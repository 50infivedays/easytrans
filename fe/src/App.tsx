import React, { useState, useRef } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { useWebSocket } from './hooks/useWebSocket';
import { useWebRTC } from './hooks/useWebRTC';
import { Send, Copy, FileUp, Users, Wifi, WifiOff, Download, CheckCircle, AlertCircle } from 'lucide-react';

// 根据环境自动选择WebSocket URL
const getWebSocketURL = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const isProduction = window.location.hostname !== 'localhost';

  if (isProduction) {
    return 'wss://api.eztrans.online/ws';
  } else {
    return 'ws://localhost:8080/ws';
  }
};

const WEBSOCKET_URL = getWebSocketURL();

function App() {
  const [targetId, setTargetId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isConnected: wsConnected, uid, sendMessage: sendWsMessage, lastMessage, reconnect } = useWebSocket(WEBSOCKET_URL);

  const {
    isConnected: rtcConnected,
    messages,
    fileTransfers,
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

  const handleDownloadFile = (transfer: any) => {
    if (transfer.data) {
      const blob = new Blob([transfer.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = transfer.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EasyTrans</h1>
          <p className="text-gray-600">基于WebRTC的隐私安全的文件和文本传输</p>
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
            <CardDescription>分享这个6位代码给其他人以建立连接</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={uid || '获取中...'}
                readOnly
                className="font-mono text-lg font-bold text-center tracking-widest"
                style={{
                  fontSize: '24px',
                  letterSpacing: '4px',
                }}
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
                  placeholder="输入对方的UID (例如: ABC123)"
                  value={targetId.toUpperCase()}
                  onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="font-mono target-uid-input"
                  maxLength={6}
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

              {/* File Transfers */}
              {fileTransfers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">文件传输</h3>
                  <div className="space-y-2">
                    {fileTransfers.map((transfer) => (
                      <div key={transfer.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        {getStatusIcon(transfer.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transfer.fileName}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${transfer.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {transfer.progress.toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {((transfer.fileSize || 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        {transfer.status === 'completed' && transfer.data && (
                          <Button
                            onClick={() => handleDownloadFile(transfer)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              <li>文件传输支持进度显示和自动下载</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
