import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { useWebSocket } from './hooks/useWebSocket';
import { useWebRTC } from './hooks/useWebRTC';
import { Send, Copy, FileUp, Users, Wifi, WifiOff, Download, CheckCircle, AlertCircle } from 'lucide-react';
import LanguageSwitcher from './components/LanguageSwitcher';
import { translations, getBrowserLanguage, formatMessage, Translations } from './i18n/translations';

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
  const [language, setLanguage] = useState<string>('zh');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('easytrans-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      const browserLanguage = getBrowserLanguage();
      setLanguage(browserLanguage);
    }
  }, []);

  // 保存语言设置到localStorage
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('easytrans-language', newLanguage);
  };

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

  // 获取当前语言的翻译
  const t: Translations = translations[language] || translations.en;

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
    return date.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
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
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* Language Switcher */}
      <LanguageSwitcher
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600 mb-4">{t.subtitle}</p>

          {/* 功能特性展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold text-sm">{t.features.privacy}</div>
              <div className="text-xs text-gray-600">{t.features.privacyDesc}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold text-sm">{t.features.fileTransfer}</div>
              <div className="text-xs text-gray-600">{t.features.fileTransferDesc}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold text-sm">{t.features.chat}</div>
              <div className="text-xs text-gray-600">{t.features.chatDesc}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-semibold text-sm">{t.features.fastTransfer}</div>
              <div className="text-xs text-gray-600">{t.features.fastTransferDesc}</div>
            </div>
          </div>

          {/* 安全特性说明 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t.securityFeatures.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>{t.securityFeatures.endToEnd}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>{t.securityFeatures.p2pDirect}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>{t.securityFeatures.noServer}</span>
              </div>
            </div>
          </div>
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
              {t.connectionStatus.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t.connectionStatus.websocket}</p>
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {wsConnected ? t.connectionStatus.connected : t.connectionStatus.disconnected}
                  </p>
                  {!wsConnected && (
                    <Button
                      onClick={reconnect}
                      size="sm"
                      variant="outline"
                    >
                      {t.connectionStatus.reconnect}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.connectionStatus.webrtc}</p>
                <p className={`font-medium ${rtcConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {rtcConnected ? t.connectionStatus.connected : t.connectionStatus.disconnected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My UID */}
        <Card>
          <CardHeader>
            <CardTitle>{t.myUid.title}</CardTitle>
            <CardDescription>{t.myUid.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={uid || t.myUid.getting}
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
              {t.connectToPeer.title}
            </CardTitle>
            <CardDescription>{t.connectToPeer.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder={t.connectToPeer.placeholder}
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
                  {!wsConnected ? t.connectToPeer.waiting : !targetId.trim() ? t.connectToPeer.enterUid : t.connectToPeer.connect}
                </Button>
                {rtcConnected && (
                  <Button
                    onClick={disconnectRTC}
                    variant="destructive"
                  >
                    {t.connectToPeer.disconnect}
                  </Button>
                )}
              </div>
              {/* Debug info */}
              <div className="text-xs text-gray-500">
                <p>{formatMessage(t.connectToPeer.debugInfo, {
                  wsStatus: wsConnected ? '✓' : '✗',
                  targetId: targetId || (language === 'zh' ? '未输入' : 'Not entered'),
                  buttonStatus: (!targetId.trim() || !wsConnected) ? (language === 'zh' ? '禁用' : 'Disabled') : (language === 'zh' ? '启用' : 'Enabled')
                })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        {rtcConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{t.chat.title}</span>
              </CardTitle>
              <CardDescription>{t.chat.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-64 border rounded-lg p-4 mb-4 overflow-y-auto bg-white">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">{t.chat.noMessages}</p>
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
                            {formatMessage(t.chat.fileSize, { size: ((msg.fileSize || 0) / 1024).toFixed(1) })}
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t.fileTransfer.title}</h3>
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
                            {formatMessage(t.fileTransfer.size, { size: ((transfer.fileSize || 0) / 1024).toFixed(1) })}
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
                  placeholder={t.chat.placeholder}
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
            <CardTitle>{t.instructions.title}</CardTitle>
            <CardDescription>{t.instructions.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 基本使用步骤 */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">{t.instructions.quickStart}</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  {t.instructions.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* 功能特性说明 */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">{t.instructions.coreFeatures}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">💬</span>
                      <span className="text-sm font-medium">{t.instructions.features.realtimeChat}</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">{t.instructions.features.realtimeChatDesc}</p>

                    <div className="flex items-center gap-2">
                      <span className="text-green-500">📁</span>
                      <span className="text-sm font-medium">{t.instructions.features.fileTransfer}</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">{t.instructions.features.fileTransferDesc}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">🔒</span>
                      <span className="text-sm font-medium">{t.instructions.features.privacy}</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">{t.instructions.features.privacyDesc}</p>

                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚡</span>
                      <span className="text-sm font-medium">{t.instructions.features.fastTransfer}</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6">{t.instructions.features.fastTransferDesc}</p>
                  </div>
                </div>
              </div>

              {/* 安全说明 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">{t.instructions.security}</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  {t.instructions.securityPoints.map((point, index) => (
                    <p key={index}>• {point}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
