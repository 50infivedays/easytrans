# WebDrop

基于WebRTC的安全P2P文件传输与实时聊天工具。

## 功能特性

- 🔗 基于WebSocket的信令服务器
- 📡 WebRTC点对点连接
- 💬 实时文本消息传输
- 📁 文件传输功能
- 🎨 现代化UI界面（Tailwind CSS + Shadcn UI）
- 🌐 浏览器端实现，无需安装

## 项目结构

```
webdrop/
├── be/          # 后端 (Go)
├── fe/          # 前端 (React + TypeScript)
└── README.md
```

## 技术栈

### 后端
- Go
- Gorilla WebSocket
- Pion WebRTC
- CORS支持

### 前端
- React 18 + TypeScript
- Tailwind CSS
- Shadcn UI
- WebRTC API
- WebSocket API

## 快速开始

### 1. 启动后端服务器

```bash
cd be
go mod download
go run main.go
```

后端服务器将在 `http://localhost:8080` 启动。

### 2. 启动前端应用

```bash
cd fe
npm install
npm start
```

前端应用将在 `http://localhost:3000` 启动。

## 使用方法

1. 在浏览器中打开 `http://localhost:3000`
2. 等待WebSocket连接建立，获取你的唯一ID
3. 将你的ID分享给其他用户
4. 输入对方的ID并点击"连接"建立P2P连接
5. 连接成功后即可发送文本消息和文件

## 系统要求

- Go 1.19+
- Node.js 16+
- 现代浏览器（支持WebRTC）

## 开发说明

### 后端API端点

- `GET /health` - 健康检查
- `WebSocket /ws` - WebSocket信令服务器

### 信令消息格式

```json
{
  "type": "offer|answer|ice-candidate|connected|error",
  "from": "sender-id",
  "to": "receiver-id", 
  "data": "message-data",
  "error": "error-message"
}
```

### WebRTC数据通道消息格式

```json
{
  "type": "text|file",
  "text": "message-text",
  "fileName": "file-name",
  "fileSize": 12345,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 注意事项

- 确保两端都能访问信令服务器
- 防火墙可能会阻止WebRTC连接
- 大文件传输需要进行分块处理（当前版本仅演示）
- 生产环境需要配置TURN服务器

## 许可证

MIT License 