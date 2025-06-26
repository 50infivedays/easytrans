import React, { useState, useRef } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { useWebSocket } from './hooks/useWebSocket';
import { useWebRTC } from './hooks/useWebRTC';
import { Send, Copy, FileUp, Users, Wifi, WifiOff } from 'lucide-react';

const WEBSOCKET_URL = 'ws://localhost:8080/ws';

function App() {
  const [targetId, setTargetId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isConnected: wsConnected, uid, sendMessage: sendWsMessage, lastMessage, reconnect } = useWebSocket(WEBSOCKET_URL);

  const {
    isConnected: rtcConnected,
    messages,
    connect: connectRTC,
    sendMessage: sendRTCMessage,
    sendFile,
    disconnect: disconnectRTC
  } = useWebRTC(sendWsMessage, lastMessage);

  const handleConnect = () => {
    console.log('Connect button clicked');
    console.log('Target ID:', targetId);
    console.log('WebSocket connected:', wsConnected);
    console.log('Target ID trimmed:', targetId.trim());

    if (targetId.trim()) {
      console.log('Attempting to connect to:', targetId);
      connectRTC(targetId);
    } else {
      console.log('Target ID is empty, cannot connect');
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendRTCMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sendFile(file);
    }
  };

  const copyToClipboard = () => {
    if (uid) {
      navigator.clipboard.writeText(uid);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EasyTrans</h1>
          <p className="text-gray-600">基于WebRTC的点对点文件和文本传输</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {wsConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              连接状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">WebSocket连接:</p>
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {wsConnected ? '已连接' : '未连接'}
                  </p>
                  {!wsConnected && (
                    <Button
                      onClick={reconnect}
                      size="sm"
                      variant="outline"
                    >
                      重连
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">WebRTC连接:</p>
                <p className={`font-medium ${rtcConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {rtcConnected ? '已连接' : '未连接'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My UID */}
        <Card>
          <CardHeader>
            <CardTitle>我的用户ID (UID)</CardTitle>
            <CardDescription>分享这个UID给其他人以建立连接</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={uid || '正在获取...'}
                readOnly
                className="font-mono"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                disabled={!uid}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connect to Peer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              连接到对方
            </CardTitle>
            <CardDescription>输入对方的UID来建立P2P连接</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="输入对方的UID"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="font-mono target-uid-input"
                />
                <Button
                  onClick={handleConnect}
                  disabled={!targetId.trim() || !wsConnected}
                >
                  {!wsConnected ? '等待连接...' : !targetId.trim() ? '请输入UID' : '连接'}
                </Button>
                {rtcConnected && (
                  <Button
                    onClick={disconnectRTC}
                    variant="destructive"
                  >
                    断开
                  </Button>
                )}
              </div>
              {/* Debug info */}
              <div className="text-xs text-gray-500">
                <p>调试信息: WebSocket: {wsConnected ? '✓' : '✗'},
                  目标ID: {targetId || '未输入'},
                  按钮状态: {(!targetId.trim() || !wsConnected) ? '禁用' : '启用'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        {rtcConnected && (
          <Card>
            <CardHeader>
              <CardTitle>聊天和文件传输</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-64 border rounded-lg p-4 mb-4 overflow-y-auto bg-white">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">暂无消息...</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-3 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${msg.sender === 'me'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                          }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        {msg.type === 'file' && (
                          <p className="text-xs opacity-75 mt-1">
                            大小: {((msg.fileSize || 0) / 1024).toFixed(1)} KB
                          </p>
                        )}
                        <p className="text-xs opacity-75 mt-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  placeholder="输入消息..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <FileUp className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>确保WebSocket连接正常（显示"已连接"）</li>
              <li>复制你的UID并分享给对方</li>
              <li>输入对方的UID并点击"连接"按钮</li>
              <li>连接成功后即可开始发送消息和文件</li>
              <li>支持文本消息和文件传输（通过WebRTC数据通道）</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
