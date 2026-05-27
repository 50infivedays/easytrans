'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Dialog } from '@/components/ui/dialog';
import { Toast } from '@/components/ui/toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import {
  Send,
  FileUp,
  Download,
  CheckCircle,
  AlertCircle,
  QrCode,
  MessageSquare,
} from 'lucide-react';
import { MessageCopyIcon } from '@/components/MessageCopyIcon';
import { translations, formatMessage, Translations } from '@/i18n/translations';
import { getWebSocketURL } from '@/config/api';
import SiteFooter from '@/components/SiteFooter';
import { useLanguage } from '@/contexts/LanguageContext';

const WEBSOCKET_URL = getWebSocketURL();

const QRScanner = dynamic(
  () => import('@/components/ui/qrscanner').then((mod) => ({ default: mod.QRScanner })),
  { ssr: false, loading: () => null }
);

const QRCodeComponent = dynamic(
  () => import('@/components/ui/qrcode').then((mod) => ({ default: mod.QRCodeComponent })),
  {
    ssr: false,
    loading: () => <div className="qr-placeholder" style={{ width: 120, height: 120 }} aria-hidden />,
  }
);

const DebugPanel =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('@/components/DebugPanel'), { ssr: false, loading: () => null })
    : () => null;

export default function Home() {
  const { language } = useLanguage();
  const [targetId, setTargetId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showLargeFileConfirm, setShowLargeFileConfirm] = useState(false);
  const [pendingLargeFile, setPendingLargeFile] = useState<File | null>(null);
  const [pendingLargeFileKind, setPendingLargeFileKind] = useState<'file' | 'image'>('file');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrOpen, setQrOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(max-width: 960px)').matches;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const COMPOSER_MAX_HEIGHT_PX = 120;
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const isInitialMount = useRef(true);
  const hasAttemptedConnection = useRef(false);
  const previousConnectionState = useRef<boolean | null>(null);

  const { isConnected: wsConnected, uid, sendMessage: sendWsMessage, drainSignalingMessages, signalingRevision, reconnect } =
    useWebSocket(WEBSOCKET_URL);

  const t: Translations = translations[language] || translations.en;
  const w = t.workspace;

  const handleSignalingNotify = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

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
    connectedPeerId,
  } = useWebRTC(sendWsMessage, drainSignalingMessages, signalingRevision, uid, w.signaling, handleSignalingNotify);
  const appState = rtcConnected ? 'connected' : 'idle';
  const displayUid = uid || t.myUid.getting;
  const peerCode = (connectedPeerId || targetId || '').toUpperCase();

  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const LARGE_FILE_WARNING_SIZE = 30 * 1024 * 1024;
  const ESTIMATED_TRANSFER_SPEED_BYTES_PER_SEC = 3 * 1024 * 1024;

  const handleConnect = () => {
    if (targetId.trim()) {
      hasAttemptedConnection.current = true;
      connectRTC(targetId);
    }
  };

  const handleQRScan = (result: string) => {
    const cleanResult = result.trim().toUpperCase();
    setTargetId(cleanResult);
    setToastMessage(t.connectToPeer.scanSuccess);
    setToastType('success');
    setShowToast(true);
  };

  const adjustComposerHeight = useCallback(() => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_HEIGHT_PX)}px`;
  }, []);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendRTCMessage(messageInput);
      setMessageInput('');
      requestAnimationFrame(() => {
        const el = chatInputRef.current;
        if (el) el.style.height = 'auto';
      });
    }
  };

  const openLargeFileConfirm = useCallback((file: File, kind: 'file' | 'image') => {
    setPendingLargeFile(file);
    setPendingLargeFileKind(kind);
    setShowLargeFileConfirm(true);
  }, []);

  const closeLargeFileConfirm = useCallback(() => {
    setShowLargeFileConfirm(false);
    setPendingLargeFile(null);
    setPendingLargeFileKind('file');
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        // Let the hook reject & toast the proper message.
        sendFile(file);
      } else if (file.size >= LARGE_FILE_WARNING_SIZE) {
        openLargeFileConfirm(file, 'file');
      } else {
        sendFile(file);
      }
    }
    event.target.value = '';
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        event.stopPropagation();
        const file = item.getAsFile();
        if (file) {
          if (file.size > MAX_FILE_SIZE) {
            sendFile(file);
          } else if (file.size >= LARGE_FILE_WARNING_SIZE) {
            openLargeFileConfirm(file, 'image');
          } else {
            sendFile(file);
            setToastMessage(w.sendingImage);
            setToastType('info');
            setShowToast(true);
          }
        }
        break;
      }
    }
  };

  const writeClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  };

  const copyToClipboard = async () => {
    if (!uid) return;
    try {
      await writeClipboard(uid);
      setToastMessage(w.toastCopied);
      setToastType('success');
      setShowToast(true);
    } catch {
      alert(`UID: ${uid}`);
    }
  };

  const copyMessageText = async (text: string) => {
    try {
      await writeClipboard(text);
      setToastMessage(w.toastMessageCopied);
      setToastType('success');
      setShowToast(true);
    } catch {
      alert(text);
    }
  };

  const showConnectionToast = useCallback(
    (isConnected: boolean, isManualDisconnect = false) => {
      if (isConnected) {
        setToastMessage(w.connectionSuccess);
        setToastType('success');
      } else if (isManualDisconnect) {
        setToastMessage(w.connectionDisconnected);
        setToastType('info');
      } else {
        setToastMessage(w.connectionFailed);
        setToastType('error');
      }
      setShowToast(true);
    },
    [w.connectionDisconnected, w.connectionFailed, w.connectionSuccess]
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const syncQr = () => setQrOpen(!mq.matches);
    mq.addEventListener('change', syncQr);
    return () => mq.removeEventListener('change', syncQr);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousConnectionState.current = rtcConnected;
      return;
    }
    if (rtcConnected !== undefined && hasAttemptedConnection.current) {
      const wasConnected = previousConnectionState.current;
      const isManualDisconnect = wasConnected === true && !rtcConnected;
      const connected = rtcConnected;
      window.setTimeout(() => showConnectionToast(connected, isManualDisconnect), 0);
    }
    previousConnectionState.current = rtcConnected;
  }, [rtcConnected, showConnectionToast]);

  const scrollMessagesToBottom = useCallback((smooth = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const useSmooth = smooth && !prefersReducedMotion;
    if (useSmooth && 'scrollTo' in container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!rtcConnected) return;
    const timer = window.setTimeout(() => {
      scrollMessagesToBottom();
      chatInputRef.current?.focus({ preventScroll: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [rtcConnected, scrollMessagesToBottom]);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const isMobile = window.matchMedia('(max-width: 960px)').matches;
      scrollMessagesToBottom(!isMobile);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, scrollMessagesToBottom]);

  useEffect(() => {
    adjustComposerHeight();
  }, [messageInput, adjustComposerHeight]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(language === 'zh' ? 'zh-CN' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleDownloadFile = (transfer: { data?: ArrayBuffer; fileName: string }) => {
    if (!transfer.data) return;
    const blob = new Blob([transfer.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = transfer.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" style={{ color: 'var(--signal-ok)' }} />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return (
          <div
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        );
    }
  };

  const connectLabel =
    !wsConnected ? t.connectToPeer.waiting : !targetId.trim() ? t.connectToPeer.enterUid : t.connectToPeer.connect;

  return (
    <>
      <main className="workspace" data-state={appState}>
        <section className="panel panel-identity" aria-label={t.myUid.title}>
          <div className="panel-header panel-identity-desktop">
            <p className="panel-label">{t.myUid.title}</p>
            <h2 className="panel-title">{displayUid}</h2>
          </div>
          <div className="panel-body uid-block">
            <div className="uid-top">
              <p className="panel-label uid-mobile-label">{t.myUid.title}</p>
              <div className="uid-row">
                <div className="uid-code" aria-label={t.myUid.title}>
                  {displayUid}
                </div>
                <div className="uid-actions uid-actions-inline">
                  <button
                    type="button"
                    className="btn btn-primary btn-copy-compact"
                    onClick={copyToClipboard}
                    disabled={!uid}
                  >
                    {w.copy}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon-only"
                    onClick={() => setQrOpen((o) => !o)}
                    aria-expanded={qrOpen}
                    aria-label={t.myUid.scanToConnect}
                  >
                    <QrCode size={18} />
                  </button>
                </div>
              </div>
            </div>
            <details className="qr-drawer" open={qrOpen}>
              <summary className="sr-only">{t.myUid.scanToConnect}</summary>
              <div className="qr-wrap">
                <div className="qr-frame">
                  <QRCodeComponent value={uid || ''} size={120} />
                </div>
                <p className="qr-hint">{t.myUid.scanToConnect}</p>
              </div>
            </details>
          </div>
          <div className="status-row status-row-inline" role="status" aria-live="polite">
            <span className={`pill${wsConnected ? ' ok' : ''}`}>
              <span className="pill-dot" />
              <span>{w.ws}</span>
              <span>{wsConnected ? t.connectionStatus.connected : t.connectionStatus.disconnected}</span>
            </span>
            <span className={`pill${rtcConnected ? ' ok' : ''}`}>
              <span className="pill-dot" />
              <span>{w.rtc}</span>
              <span>{rtcConnected ? t.connectionStatus.connected : t.connectionStatus.disconnected}</span>
            </span>
            {!wsConnected && (
              <button type="button" className="btn btn-ghost status-reconnect" onClick={reconnect}>
                {t.connectionStatus.reconnect}
              </button>
            )}
          </div>
        </section>

        <div className="canvas">
          <header className="hero-compact">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </header>

          <section className="panel connect-panel connect-panel-primary">
            <div className="panel-header">
              <p className="panel-label connect-idle-hint">{w.step1}</p>
              <h2 className="panel-title">{t.connectToPeer.title}</h2>
            </div>
            <div className="panel-body">
              <div className="connect-row connect-idle-hint">
                <div className="input-wrap">
                  <label className="input-label" htmlFor="peer-input">
                    {t.connectToPeer.title}
                  </label>
                  <input
                    id="peer-input"
                    className="input-field"
                    type="text"
                    maxLength={6}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={t.connectToPeer.placeholder}
                    value={targetId.toUpperCase()}
                    onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  />
                </div>
                <div className="connect-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConnect}
                    disabled={!targetId.trim() || !wsConnected}
                  >
                    {connectLabel}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowQRScanner(true)}
                    disabled={!wsConnected}
                  >
                    {t.connectToPeer.scanQR}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section
            className="panel chat-panel"
            onPaste={(e) => handlePaste(e as React.ClipboardEvent<HTMLTextAreaElement>)}
          >
            <div className="panel-header chat-panel-header">
              <p className="panel-label chat-step-label">{w.step2}</p>
              <h2 className="panel-title">{w.chatTitle}</h2>
            </div>
            <div className="panel-body chat-panel-body">
              <div className="chat-idle empty-chat">
                <MessageSquare size={40} strokeWidth={1.5} />
                <p>{w.chatEmpty}</p>
              </div>

              <div className="chat-connected">
                <div className="chat-header-meta">
                  <span className="peer-tag">
                    {w.peerConnected} <code>{peerCode}</code>
                  </span>
                  <button type="button" className="btn btn-ghost btn-disconnect" onClick={disconnectRTC}>
                    {t.connectToPeer.disconnect}
                  </button>
                </div>

                <div className="messages" ref={messagesContainerRef} role="log" aria-live="polite">
                  {messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    const showCopy = !isMe && msg.type === 'text';

                    const bubble = (
                      <div className="msg-bubble">
                        <p>{msg.text}</p>
                        {msg.type === 'file' && (
                          <span className="msg-time">
                            {formatMessage(t.chat.fileSize, {
                              size: ((msg.fileSize || 0) / 1024).toFixed(1),
                            })}
                          </span>
                        )}
                        <span className="msg-time">{formatTime(msg.timestamp)}</span>
                      </div>
                    );

                    return (
                      <div key={msg.id} className={`msg ${isMe ? 'me' : 'them'}`}>
                        {showCopy ? (
                          <div className="msg-row">
                            {bubble}
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon-only msg-copy-btn"
                              onClick={() => void copyMessageText(msg.text)}
                              aria-label={w.copyMessage}
                              title={w.copyMessage}
                            >
                              <MessageCopyIcon size={16} />
                            </button>
                          </div>
                        ) : (
                          bubble
                        )}
                      </div>
                    );
                  })}
                  <div className="messages-end" aria-hidden />
                </div>

                {fileTransfers.map((transfer) => (
                  <div key={transfer.id} className="transfer-item">
                    {getStatusIcon(transfer.status)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {transfer.fileName}
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${transfer.progress}%` }} />
                      </div>
                      <span className="msg-time">
                        {formatMessage(t.fileTransfer.size, {
                          size: ((transfer.fileSize || 0) / 1024).toFixed(1),
                        })}
                      </span>
                    </div>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-subtle)' }}>
                      {transfer.progress.toFixed(0)}%
                    </span>
                    {transfer.status === 'completed' && transfer.data && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon-only"
                        onClick={() => handleDownloadFile(transfer)}
                        aria-label={t.fileTransfer.download}
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <div className="composer">
                  <textarea
                    ref={chatInputRef}
                    className="input-field composer-input"
                    rows={1}
                    placeholder={t.chat.placeholder}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onPaste={handlePaste}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-icon"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    aria-label={t.chat.send}
                  >
                    <Send size={18} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label={t.fileTransfer.title}
                  >
                    <FileUp size={18} />
                  </button>
                  <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="sr-only" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <details className="panel panel-trust panel-trust-collapse">
          <summary className="trust-summary">
            <span>{w.trustTitle}</span>
            <svg className="trust-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="panel-body trust-body">
            <h2 className="trust-desktop-title">{w.trustTitle}</h2>
            <ul className="trust-list">
              {w.trust.map((item) => (
                <li key={item.title}>
                  <span className="trust-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    {item.desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </main>

      <SiteFooter />

      {process.env.NODE_ENV === 'development' ? <DebugPanel /> : null}

      <Dialog
        isOpen={showOfferConfirm}
        onClose={() => {}}
        title={t.offerConfirm.title}
        description={formatMessage(t.offerConfirm.description, { from: offerFrom || '' })}
        confirmText={t.offerConfirm.accept}
        cancelText={t.offerConfirm.reject}
        onConfirm={confirmOffer}
        onCancel={rejectOffer}
      />

      <Dialog
        isOpen={showLargeFileConfirm}
        onClose={closeLargeFileConfirm}
        title={w.signaling.largeFileConfirmTitle}
        description={
          pendingLargeFile
            ? formatMessage(w.signaling.largeFileConfirm, {
                sizeMB: (pendingLargeFile.size / (1024 * 1024)).toFixed(1),
                minutes: Math.max(
                  1,
                  Math.ceil(
                    pendingLargeFile.size / ESTIMATED_TRANSFER_SPEED_BYTES_PER_SEC / 60
                  )
                ),
              })
            : ''
        }
        confirmText={w.signaling.largeFileConfirmContinueText}
        cancelText={w.signaling.largeFileConfirmCancelText}
        onConfirm={() => {
          if (!pendingLargeFile) return;
          const file = pendingLargeFile;
          const kind = pendingLargeFileKind;
          if (kind === 'image') {
            setToastMessage(w.sendingImage);
            setToastType('info');
            setShowToast(true);
          }
          setShowLargeFileConfirm(false);
          setPendingLargeFile(null);
          setPendingLargeFileKind('file');
          sendFile(file);
        }}
        onCancel={closeLargeFileConfirm}
      />

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        onShowToast={(message, type) => {
          setToastMessage(message);
          setToastType(type);
          setShowToast(true);
        }}
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
        type={toastType}
      />
    </>
  );
}
