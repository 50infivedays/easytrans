import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Dialog } from './components/ui/dialog';
import { QRCodeComponent } from './components/ui/qrcode';
import { QRScanner } from './components/ui/qrscanner';
import { Toast } from './components/ui/toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useWebRTC } from './hooks/useWebRTC';
import { Send, Copy, FileUp, Users, Wifi, WifiOff, Download, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
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
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatCardRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const hasAttemptedConnection = useRef(false);
  const previousConnectionState = useRef<boolean | null>(null);

  // 初始化语言设置 - 默认使用英文，只有在检测到中文时才使用中文
  useEffect(() => {
    const savedLanguage = localStorage.getItem('webdrop-language');
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
    localStorage.setItem('webdrop-language', newLanguage);
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

  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result);
    // 清理扫描结果，只保留UID部分
    const cleanResult = result.trim().toUpperCase();
    setTargetId(cleanResult);
    setShowToast(true);
    setToastMessage(t.connectToPeer.scanSuccess);
    setToastType('success');
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

  // 当连接成功时，自动滚动到聊天区域并聚焦输入框
  useEffect(() => {
    if (rtcConnected) {
      // 稍微延迟以确保 DOM 已渲染
      setTimeout(() => {
        if (chatCardRef.current) {
          chatCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 300);
    }
  }, [rtcConnected]);

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Language Switcher */}
        <div className="text-center relative py-4">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white/60 shadow-sm ring-1 ring-white/50">
            <Wifi className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight drop-shadow-sm">{t.title}</h1>
          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="text-center p-4 rounded-xl bg-white/80 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-primary font-bold text-sm md:text-base mb-1 group-hover:scale-105 transition-transform">{t.features.privacy}</div>
              <div className="text-xs text-slate-500 hidden md:block leading-relaxed">{t.features.privacyDesc}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/80 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-green-600 font-bold text-sm md:text-base mb-1 group-hover:scale-105 transition-transform">{t.features.fileTransfer}</div>
              <div className="text-xs text-slate-500 hidden md:block leading-relaxed">{t.features.fileTransferDesc}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/80 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-purple-600 font-bold text-sm md:text-base mb-1 group-hover:scale-105 transition-transform">{t.features.chat}</div>
              <div className="text-xs text-slate-500 hidden md:block leading-relaxed">{t.features.chatDesc}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/80 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-orange-600 font-bold text-sm md:text-base mb-1 group-hover:scale-105 transition-transform">{t.features.fastTransfer}</div>
              <div className="text-xs text-slate-500 hidden md:block leading-relaxed">{t.features.fastTransferDesc}</div>
            </div>
          </div>

          {/* 安全特性说明 */}
          <div className="bg-white/40 backdrop-blur-sm border border-white/50 p-5 rounded-2xl mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center justify-center gap-2">
              <span className="text-xl">🛡️</span>
              {t.securityFeatures.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex items-center justify-center gap-2 bg-white/50 py-2 px-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{t.securityFeatures.endToEnd}</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/50 py-2 px-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{t.securityFeatures.p2pDirect}</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/50 py-2 px-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{t.securityFeatures.noServer}</span>
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
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <Input
                    value={uid || t.myUid.getting}
                    readOnly
                    className="font-mono font-bold text-center tracking-widest text-sm md:text-lg lg:text-xl xl:text-2xl"
                    style={{
                      letterSpacing: '2px',
                      minHeight: 'auto',
                      padding: '8px 12px',
                    }}
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    disabled={!uid}
                    className="w-full md:w-auto"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {language === 'zh' ? '复制UID' : 'Copy UID'}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <QRCodeComponent
                  value={uid || ''}
                  size={120}
                  className="border border-gray-200 rounded-lg p-2 bg-white"
                />
                <span className="text-xs text-gray-500 text-center">{t.myUid.scanToConnect}</span>
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
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  placeholder={t.connectToPeer.placeholder}
                  value={rtcConnected ? (connectedPeerId || '').toUpperCase() : targetId.toUpperCase()}
                  onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="font-mono target-uid-input text-sm md:text-base"
                  maxLength={6}
                  readOnly={rtcConnected}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    disabled={!targetId.trim() || !wsConnected}
                    className="flex-1 md:flex-none"
                  >
                    {!wsConnected ? t.connectToPeer.waiting : !targetId.trim() ? t.connectToPeer.enterUid : t.connectToPeer.connect}
                  </Button>
                  {!rtcConnected && (
                    <Button
                      onClick={() => setShowQRScanner(true)}
                      variant="outline"
                      disabled={!wsConnected}
                      className="flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      {t.connectToPeer.scanQR}
                    </Button>
                  )}
                  {rtcConnected && (
                    <Button
                      onClick={disconnectRTC}
                      variant="destructive"
                    >
                      {t.connectToPeer.disconnect}
                    </Button>
                  )}
                </div>
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
          <div ref={chatCardRef}>
            <Card className="border-primary shadow-xl ring-4 ring-primary/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <span>{t.chat.title}</span>
                </CardTitle>
                <CardDescription>{t.chat.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Messages */}
                <div className="h-80 border rounded-xl p-4 mb-4 overflow-y-auto bg-slate-50/50 shadow-inner scroll-smooth">
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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white border border-slate-200 text-slate-800'
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
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
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
                  ref={chatInputRef}
                  placeholder={t.chat.placeholder}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border-primary/20 focus-visible:ring-primary"
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="shadow-lg shadow-primary/20">
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
          </div>
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
                <h3 className="font-semibold text-slate-800 mb-3">{t.instructions.coreFeatures}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">💬</span>
                      <span className="text-sm font-medium">{t.instructions.features.realtimeChat}</span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">{t.instructions.features.realtimeChatDesc}</p>

                    <div className="flex items-center gap-2">
                      <span className="text-green-500">📁</span>
                      <span className="text-sm font-medium">{t.instructions.features.fileTransfer}</span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">{t.instructions.features.fileTransferDesc}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">🔒</span>
                      <span className="text-sm font-medium">{t.instructions.features.privacy}</span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">{t.instructions.features.privacyDesc}</p>

                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚡</span>
                      <span className="text-sm font-medium">{t.instructions.features.fastTransfer}</span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">{t.instructions.features.fastTransferDesc}</p>
                  </div>
                </div>
              </div>

              {/* 安全说明 */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">{t.instructions.security}</h3>
                <div className="text-sm text-slate-700 space-y-1">
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

      {/* QR Scanner */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        title={language === 'zh' ? '扫描二维码' : 'Scan QR Code'}
        description={language === 'zh' ? '将二维码对准摄像头进行扫描' : 'Point your camera at the QR code to scan'}
        onShowToast={(message, type) => {
          setToastMessage(message);
          setToastType(type);
          setShowToast(true);
        }}
        language={language}
      />

      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
        type={toastType}
      />

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <p>© 2025 WebDrop. {t.footer.allRightsReserved}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="/privacy-policy.html"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.footer.privacyPolicy}
              </a>
              <a
                href="/terms-of-service.html"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.footer.termsOfService}
              </a>
              <a
                href="/copyright.html"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.footer.copyright}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
