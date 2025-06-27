package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

type Client struct {
	ID       string // WebSocket连接ID
	UID      string // 用户ID
	Conn     *websocket.Conn
	Send     chan []byte
	LastSeen time.Time
}

type Message struct {
	Type  string      `json:"type"`
	From  string      `json:"from,omitempty"`
	To    string      `json:"to,omitempty"`
	Data  interface{} `json:"data,omitempty"`
	Error string      `json:"error,omitempty"`
}

type Hub struct {
	clients     map[string]*Client // key: connection ID
	userClients map[string]*Client // key: user ID
	register    chan *Client
	unregister  chan *Client
	broadcast   chan []byte
	mutex       sync.RWMutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// 生成友好的用户ID
func generateFriendlyUID() string {
	// 使用大写字母和数字，避免容易混淆的字符
	chars := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

	rand.Seed(time.Now().UnixNano())

	var result strings.Builder
	for i := 0; i < 6; i++ {
		result.WriteByte(chars[rand.Intn(len(chars))])
	}

	return result.String()
}

// 检查UID是否已存在
func (h *Hub) isUIDExists(uid string) bool {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	_, exists := h.userClients[uid]
	return exists
}

// 生成唯一的友好UID
func (h *Hub) generateUniqueUID() string {
	for {
		uid := generateFriendlyUID()
		if !h.isUIDExists(uid) {
			return uid
		}
	}
}

func newHub() *Hub {
	return &Hub{
		clients:     make(map[string]*Client),
		userClients: make(map[string]*Client),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		broadcast:   make(chan []byte),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			// 如果该用户已有连接，关闭旧连接
			if oldClient, exists := h.userClients[client.UID]; exists {
				log.Printf("⚠️  User %s already has connection %s, closing old connection", client.UID, oldClient.ID)
				close(oldClient.Send)
				delete(h.clients, oldClient.ID)
			}

			// 注册新连接
			h.clients[client.ID] = client
			h.userClients[client.UID] = client

			log.Printf("✅ Client %s (User %s) connected. Total users: %d", client.ID, client.UID, len(h.userClients))
			log.Printf("📋 All connected users:")
			for uid := range h.userClients {
				log.Printf("   - %s", uid)
			}
			h.mutex.Unlock()

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				delete(h.userClients, client.UID)
				close(client.Send)
				log.Printf("❌ Client %s (User %s) disconnected. Total users: %d", client.ID, client.UID, len(h.userClients))
			} else {
				log.Printf("⚠️  Attempted to unregister non-existent client %s", client.ID)
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for _, client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client.ID)
					delete(h.userClients, client.UID)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	// 创建临时客户端，等待login消息
	connectionID := uuid.New().String()
	client := &Client{
		ID:       connectionID,
		UID:      "", // 待login后设置
		Conn:     conn,
		Send:     make(chan []byte, 256),
		LastSeen: time.Now(),
	}

	// 发送连接就绪消息，等待login
	readyMsg := Message{
		Type: "ready",
		Data: map[string]string{"message": "Connection established, please login"},
	}
	data, _ := json.Marshal(readyMsg)
	client.Conn.WriteMessage(websocket.TextMessage, data)

	go h.writePump(client)
	go h.readPump(client)
}

func (h *Hub) readPump(client *Client) {
	defer func() {
		h.unregister <- client
		client.Conn.Close()
	}()

	// Set a deadline for receiving the login message
	client.Conn.SetReadDeadline(time.Now().Add(10 * time.Second))

	// The first message must be a login message
	_, messageBytes, err := client.Conn.ReadMessage()
	if err != nil {
		log.Printf("Error reading login message: %v", err)
		return
	}

	var loginMsg Message
	if err := json.Unmarshal(messageBytes, &loginMsg); err != nil {
		log.Printf("Failed to unmarshal login message: %v", err)
		return
	}

	if loginMsg.Type != "login" {
		log.Printf("Expected login message, but got %s", loginMsg.Type)
		return
	}

	// Process login logic
	var userID string
	var isNewUser bool = false
	if loginMsg.Data != nil {
		if dataMap, ok := loginMsg.Data.(map[string]interface{}); ok {
			if existingUID, ok := dataMap["uid"].(string); ok && existingUID != "" {
				userID = existingUID
			}
		}
	}

	if userID == "" {
		userID = h.generateUniqueUID()
		isNewUser = true
		log.Printf("Generated new UID for user: %s", userID)
	} else {
		log.Printf("User %s reconnected.", userID)
	}

	client.UID = userID
	h.register <- client // Register the client

	// Send login success response via the writePump
	loginResponse := Message{
		Type: "login_success",
		Data: map[string]interface{}{
			"uid":       userID,
			"isNewUser": isNewUser,
		},
	}
	responseData, _ := json.Marshal(loginResponse)
	client.Send <- responseData

	// Reset deadline for regular messages and set pong handler
	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Loop for subsequent messages
	for {
		_, messageBytes, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("❌ JSON unmarshal error: %v", err)
			log.Printf("❌ Raw message: %s", string(messageBytes))
			continue
		}

		log.Printf("📨 Received message from client %s (UID: %s): Type=%s, To=%s", client.ID, client.UID, msg.Type, msg.To)
		msg.From = client.UID
		h.handleMessage(&msg)
	}
}

func (h *Hub) writePump(client *Client) {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// 发送第一条消息
			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

			// 如果还有待发送的消息，分别发送每一条
			n := len(client.Send)
			for i := 0; i < n; i++ {
				if err := client.Conn.WriteMessage(websocket.TextMessage, <-client.Send); err != nil {
					return
				}
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *Hub) handleMessage(msg *Message) {
	log.Printf("🔄 Handling message: Type=%s, From=%s, To=%s", msg.Type, msg.From, msg.To)

	switch msg.Type {
	case "offer", "answer", "ice-candidate":
		log.Printf("📡 Relaying signaling message: %s from %s to %s", msg.Type, msg.From, msg.To)
		h.relaySignaling(msg)
	case "ping":
		log.Printf("🏓 Ping received from %s, sending pong", msg.From)
		h.sendToClient(msg.From, Message{
			Type: "pong",
		})
	default:
		log.Printf("❌ Unknown message type: %s from %s", msg.Type, msg.From)
	}
}

func (h *Hub) relaySignaling(msg *Message) {
	log.Printf("🔄 relaySignaling: Processing %s message", msg.Type)

	if msg.To == "" {
		log.Printf("❌ No target specified for signaling message from %s", msg.From)
		return
	}

	h.mutex.RLock()
	targetClient, exists := h.userClients[msg.To] // 使用UID查找用户
	_, senderExists := h.userClients[msg.From]

	// 打印当前在线用户列表
	log.Printf("📋 Current online users: %d", len(h.userClients))
	for uid := range h.userClients {
		log.Printf("   - User: %s", uid)
	}
	h.mutex.RUnlock()

	log.Printf("🔍 Looking for target user: %s, exists: %v", msg.To, exists)
	log.Printf("🔍 Sender exists: %v", senderExists)

	if !exists {
		log.Printf("❌ Target user %s not found, sending error to sender %s", msg.To, msg.From)
		// 发送错误消息给发送者
		if senderExists {
			h.sendToUser(msg.From, Message{
				Type:  "error",
				Error: "Target user not found",
			})
		}
		return
	}

	// 转发消息给目标客户端
	response := Message{
		Type: msg.Type,
		From: msg.From,
		To:   msg.To,
		Data: msg.Data,
	}

	data, err := json.Marshal(response)
	if err != nil {
		log.Printf("❌ JSON marshal error: %v", err)
		return
	}

	log.Printf("✅ Sending %s message from %s to %s", msg.Type, msg.From, msg.To)
	select {
	case targetClient.Send <- data:
		log.Printf("✅ Message successfully queued for delivery to %s", msg.To)
	default:
		log.Printf("❌ Failed to queue message for %s (channel full or closed)", msg.To)
		// 客户端连接已关闭
		if senderExists {
			h.sendToUser(msg.From, Message{
				Type:  "error",
				Error: "Failed to deliver message to target user",
			})
		}
	}
}

func (h *Hub) sendToClient(clientID string, msg Message) {
	h.mutex.RLock()
	client, exists := h.clients[clientID]
	h.mutex.RUnlock()

	if !exists {
		return
	}

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("JSON marshal error: %v", err)
		return
	}

	select {
	case client.Send <- data:
	default:
		// 客户端连接已关闭
	}
}

func (h *Hub) sendToUser(userID string, msg Message) {
	h.mutex.RLock()
	client, exists := h.userClients[userID]
	h.mutex.RUnlock()

	if !exists {
		return
	}

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("JSON marshal error: %v", err)
		return
	}

	select {
	case client.Send <- data:
	default:
		// 客户端连接已关闭
	}
}

func main() {
	hub := newHub()
	go hub.run()

	// 设置CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"https://eztrans.online",
			"https://www.eztrans.online",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", hub.handleWebSocket)

	// 健康检查端点
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// 调试端点：显示当前连接的用户
	mux.HandleFunc("/debug/users", func(w http.ResponseWriter, r *http.Request) {
		hub.mutex.RLock()
		users := make([]string, 0, len(hub.userClients))
		for uid := range hub.userClients {
			users = append(users, uid)
		}
		hub.mutex.RUnlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"totalUsers": len(users),
			"users":      users,
		})
	})

	handler := c.Handler(mux)

	// 从环境变量读取端口号，默认为8080
	port := os.Getenv("EZTRANS_PORT")
	if port == "" {
		port = "8080"
	}

	// 确保端口号格式正确
	if port[0] != ':' {
		port = ":" + port
	}

	fmt.Printf("Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}
