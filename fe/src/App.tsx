import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Dialog } from './components/ui/dialog';
import { QRCodeComponent } from './components/ui/qrcode';
import { Toast } from './components/ui/toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useWebRTC } from './hooks/useWebRTC';
import { Send, Copy, FileUp, Users, Wifi, WifiOff, Download, CheckCircle, AlertCircle } from 'lucide-react';
import LanguageSwitcher from './components/LanguageSwitcher';
import { translations, getBrowserLanguage, formatMessage, Translations } from './i18n/translations';
import { getWebSocketURL } from './config/api';
import DebugPanel from './components/DebugPanel';

const WEBSOCKET_URL = getWebSocketURL();

function App() {
  const [targetId, setTargetId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [language, setLanguage] = useState<string>('zh');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const hasAttemptedConnection = useRef(false);
  const previousConnectionState = useRef<boolean | null>(null);

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
    disconnect: disconnectRTC,
    showOfferConfirm,
    offerFrom,
    confirmOffer,
    rejectOffer,
    connectedPeerId
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
      hasAttemptedConnection.current = true;
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

  const copyToClipboard = async () => {
    if (!uid) return;

    try {
      // 尝试使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(uid);
        console.log('UID copied to clipboard');
        showSuccessToast();
      } else {
        // 回退方案：使用传统的 document.execCommand
        const textArea = document.createElement('textarea');
        textArea.value = uid;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          console.log('UID copied to clipboard (fallback method)');
          showSuccessToast();
        } else {
          console.error('Failed to copy UID');
          throw new Error('execCommand failed');
        }
      }
    } catch (error) {
      console.error('Error copying UID to clipboard:', error);
      // 如果所有方法都失败，显示UID让用户手动复制
      const message = language === 'zh'
        ? `UID: ${uid}\n\n请手动复制此UID`
        : `UID: ${uid}\n\nPlease copy this UID manually`;
      alert(message);
    }
  };

  const showSuccessToast = () => {
    const message = language === 'zh' ? 'UID已复制到剪贴板' : 'UID copied to clipboard';
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showConnectionToast = useCallback((isConnected: boolean, isManualDisconnect: boolean = false) => {
    if (isConnected) {
      const message = language === 'zh' ? '连接成功' : 'Connection successful';
      setToastMessage(message);
      setToastType('success');
    } else {
      if (isManualDisconnect) {
        const message = language === 'zh' ? '连接断开' : 'Connection disconnected';
        setToastMessage(message);
        setToastType('info');
      } else {
        const message = language === 'zh' ? '连接失败' : 'Connection failed';
        setToastMessage(message);
        setToastType('error');
      }
    }
    setShowToast(true);
  }, [language]);

  // 监听WebRTC连接状态变化
  useEffect(() => {
    // 跳过初始加载时的提示
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousConnectionState.current = rtcConnected;
      return;
    }

    // 只在用户尝试过连接后才显示状态提示
    if (rtcConnected !== undefined && hasAttemptedConnection.current) {
      // 检查是否是从连接状态变为断开状态
      const wasConnected = previousConnectionState.current;
      const isNowDisconnected = !rtcConnected;

      // 如果之前是连接状态，现在是断开状态，可能是主动断开
      const isManualDisconnect = wasConnected === true && isNowDisconnected;

      showConnectionToast(rtcConnected, isManualDisconnect);
    }

    // 更新之前的状态
    previousConnectionState.current = rtcConnected;
  }, [rtcConnected, showConnectionToast]);

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Language Switcher */}
        <div className="text-center relative">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-sm md:text-base text-gray-600 mb-4">{t.subtitle}</p>

          {/* Language Switcher - positioned below title on mobile */}
          <div className="flex justify-center mb-4 md:hidden">
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Language Switcher - positioned in top right on desktop */}
          <div className="hidden md:block absolute top-0 right-0">
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* 功能特性展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
            <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold text-xs md:text-sm">{t.features.privacy}</div>
              <div className="text-xs text-gray-600 hidden md:block">{t.features.privacyDesc}</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold text-xs md:text-sm">{t.features.fileTransfer}</div>
              <div className="text-xs text-gray-600 hidden md:block">{t.features.fileTransferDesc}</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold text-xs md:text-sm">{t.features.chat}</div>
              <div className="text-xs text-gray-600 hidden md:block">{t.features.chatDesc}</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-semibold text-xs md:text-sm">{t.features.fastTransfer}</div>
              <div className="text-xs text-gray-600 hidden md:block">{t.features.fastTransferDesc}</div>
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
            <div className="flex gap-4 items-start">
              <div className="flex-1">
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
              </div>
              <div className="flex flex-col items-center gap-2">
                <QRCodeComponent
                  value={uid || ''}
                  size={120}
                  className="border border-gray-200 rounded-lg p-2 bg-white"
                />
                <span className="text-xs text-gray-500">{t.myUid.scanToConnect}</span>
              </div>
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
                  value={rtcConnected ? (connectedPeerId || '').toUpperCase() : targetId.toUpperCase()}
                  onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="font-mono target-uid-input"
                  maxLength={6}
                  readOnly={rtcConnected}
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

      {/* Debug Panel - 仅在开发环境显示 */}
      <DebugPanel />

      {/* Offer Confirmation Dialog */}
      <Dialog
        isOpen={showOfferConfirm}
        onClose={() => { }} // 不允许通过点击背景关闭
        title={t.offerConfirm.title}
        description={formatMessage(t.offerConfirm.description, { from: offerFrom || '' })}
        confirmText={t.offerConfirm.accept}
        cancelText={t.offerConfirm.reject}
        onConfirm={confirmOffer}
        onCancel={rejectOffer}
      />

      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
        type={toastType}
      />
    </div>
  );
}

export default App;
