package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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
				log.Printf("User %s already has connection %s, closing old connection", client.UID, oldClient.ID)
				close(oldClient.Send)
				delete(h.clients, oldClient.ID)
			}

			// 注册新连接
			h.clients[client.ID] = client
			h.userClients[client.UID] = client
			h.mutex.Unlock()

			log.Printf("Client %s (User %s) connected", client.ID, client.UID)

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				delete(h.userClients, client.UID)
				close(client.Send)
			}
			h.mutex.Unlock()
			log.Printf("Client %s (User %s) disconnected", client.ID, client.UID)

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
		userID = uuid.New().String()
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
			log.Printf("JSON unmarshal error: %v", err)
			continue
		}

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

			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(client.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-client.Send)
			}

			if err := w.Close(); err != nil {
				return
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
	switch msg.Type {
	case "offer", "answer", "ice-candidate":
		h.relaySignaling(msg)
	case "ping":
		h.sendToClient(msg.From, Message{
			Type: "pong",
		})
	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

func (h *Hub) relaySignaling(msg *Message) {
	if msg.To == "" {
		log.Println("No target specified for signaling message")
		return
	}

	h.mutex.RLock()
	targetClient, exists := h.userClients[msg.To] // 使用UID查找用户
	_, senderExists := h.userClients[msg.From]
	h.mutex.RUnlock()

	if !exists {
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
		log.Printf("JSON marshal error: %v", err)
		return
	}

	select {
	case targetClient.Send <- data:
	default:
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
		AllowedOrigins:   []string{"*"},
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

	handler := c.Handler(mux)

	port := ":8080"
	fmt.Printf("Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}
