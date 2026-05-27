'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    SignalingTabCoordinator,
    createSessionId,
} from '@/lib/signaling-tab-coordinator';

export interface Message {
    type: string;
    from?: string;
    to?: string;
    data?: unknown;
    error?: string;
}

const SIGNALING_TYPES = new Set([
    'offer',
    'answer',
    'ice-candidate',
    'disconnect',
    'offer-rejected',
    'error',
]);

export interface UseWebSocketReturn {
    socket: WebSocket | null;
    isConnected: boolean;
    uid: string | null;
    isSignalingLeader: boolean;
    sendMessage: (message: Message) => void;
    drainSignalingMessages: () => Message[];
    signalingRevision: number;
    disconnect: () => void;
    reconnect: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [uid, setUid] = useState<string | null>(() =>
        typeof window !== 'undefined' ? localStorage.getItem('uid') : null
    );
    const [signalingRevision, setSignalingRevision] = useState(0);
    const [isSignalingLeader, setIsSignalingLeader] = useState(false);

    const coordinatorRef = useRef<SignalingTabCoordinator | null>(null);
    const sessionIdRef = useRef<string>('');
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectCountRef = useRef(0);
    const wsRef = useRef<WebSocket | null>(null);
    const isConnectingRef = useRef(false);
    const isManualDisconnectRef = useRef(false);
    const sessionReplacedRef = useRef(false);
    const signalingQueueRef = useRef<Message[]>([]);

    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000;

    const enqueueSignalingMessage = useCallback((message: Message) => {
        signalingQueueRef.current.push(message);
        setSignalingRevision((revision) => revision + 1);
    }, []);

    const drainSignalingMessages = useCallback(() => {
        if (signalingQueueRef.current.length === 0) {
            return [];
        }
        return signalingQueueRef.current.splice(0);
    }, []);

    const broadcastWsState = useCallback(
        (nextUid: string | null, connected: boolean) => {
            coordinatorRef.current?.broadcastFromLeader({
                type: 'ws-state',
                uid: nextUid,
                connected,
                sessionId: sessionIdRef.current,
            });
        },
        []
    );

    const uidRef = useRef<string | null>(uid);
    uidRef.current = uid;

    const handleServerPayload = useCallback(
        (raw: string) => {
            try {
                const message: Message = JSON.parse(raw);

                if (message.type === 'session_replaced') {
                    sessionReplacedRef.current = true;
                    isManualDisconnectRef.current = true;
                    wsRef.current?.close(4000, 'session_replaced');
                    setIsConnected(false);
                    setSocket(null);
                    broadcastWsState(uidRef.current, false);
                    return;
                }

                if (message.type === 'login_success') {
                    const { uid: userUid } = message.data as { uid: string; isNewUser?: boolean };
                    setUid(userUid);
                    localStorage.setItem('uid', userUid);
                    setIsConnected(true);
                    broadcastWsState(userUid, true);
                    return;
                }

                if (SIGNALING_TYPES.has(message.type)) {
                    enqueueSignalingMessage(message);
                }
            } catch {
                // ignore malformed payloads
            }
        },
        [broadcastWsState, enqueueSignalingMessage]
    );

    const closeSocket = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'Client closing');
            wsRef.current = null;
        }
        setSocket(null);
        setIsConnected(false);
        isConnectingRef.current = false;
    }, []);

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        const coordinator = coordinatorRef.current;
        if (!coordinator?.isLeader()) return;
        if (sessionReplacedRef.current) return;
        if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (wsRef.current) {
            closeSocket();
        }

        clearReconnectTimeout();
        isConnectingRef.current = true;
        sessionIdRef.current = createSessionId();

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                setSocket(ws);
                isConnectingRef.current = false;
                reconnectCountRef.current = 0;
                isManualDisconnectRef.current = false;
            };

            ws.onmessage = (event) => {
                const raw = typeof event.data === 'string' ? event.data : '';
                if (!raw) return;

                try {
                    const message: Message = JSON.parse(raw);
                    if (message.type === 'ready') {
                        const savedUid = localStorage.getItem('uid') || '';
                        ws.send(
                            JSON.stringify({
                                type: 'login',
                                data: { uid: savedUid, sessionId: sessionIdRef.current },
                            })
                        );
                        return;
                    }
                } catch {
                    // fall through
                }

                handleServerPayload(raw);
            };

            ws.onclose = (event) => {
                setIsConnected(false);
                setSocket(null);
                isConnectingRef.current = false;

                if (wsRef.current === ws) {
                    wsRef.current = null;
                }

                if (sessionReplacedRef.current || isManualDisconnectRef.current) {
                    broadcastWsState(uidRef.current, false);
                    return;
                }

                if (
                    coordinator.isLeader() &&
                    event.code !== 1000 &&
                    reconnectCountRef.current < maxReconnectAttempts
                ) {
                    reconnectCountRef.current++;
                    const delay = Math.min(
                        baseReconnectDelay * Math.pow(2, reconnectCountRef.current - 1),
                        30000
                    );
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (!sessionReplacedRef.current && !isManualDisconnectRef.current) {
                            connect();
                        }
                    }, delay);
                } else {
                    broadcastWsState(uidRef.current, false);
                }
            };

            ws.onerror = () => {
                isConnectingRef.current = false;
            };
        } catch {
            isConnectingRef.current = false;
        }
    }, [
        url,
        clearReconnectTimeout,
        closeSocket,
        handleServerPayload,
        broadcastWsState,
    ]);

    const sendMessage = useCallback((message: Message) => {
        const payload = JSON.stringify(message);
        const coordinator = coordinatorRef.current;

        if (coordinator?.isLeader()) {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(payload);
            }
            return;
        }

        coordinator?.sendToLeader(payload);
    }, []);

    const disconnect = useCallback(() => {
        isManualDisconnectRef.current = true;
        sessionReplacedRef.current = false;
        clearReconnectTimeout();
        closeSocket();
        broadcastWsState(uidRef.current, false);
    }, [clearReconnectTimeout, closeSocket, broadcastWsState]);

    const reconnect = useCallback(() => {
        sessionReplacedRef.current = false;
        reconnectCountRef.current = 0;
        isManualDisconnectRef.current = false;
        coordinatorRef.current?.requestLeadership();
    }, []);

    useEffect(() => {
        const coordinator = SignalingTabCoordinator.getInstance();
        coordinatorRef.current = coordinator;

        const unsubscribe = coordinator.subscribe((event) => {
            switch (event.type) {
                case 'became-leader':
                    setIsSignalingLeader(true);
                    sessionReplacedRef.current = false;
                    isManualDisconnectRef.current = false;
                    reconnectCountRef.current = 0;
                    connect();
                    break;
                case 'resigned-leader':
                    setIsSignalingLeader(false);
                    isManualDisconnectRef.current = true;
                    clearReconnectTimeout();
                    closeSocket();
                    break;
                case 'ws-send':
                    if (coordinator.isLeader() && wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(event.payload);
                    }
                    break;
                case 'ws-state':
                    setUid(event.uid);
                    setIsConnected(event.connected);
                    if (event.uid) localStorage.setItem('uid', event.uid);
                    break;
                default:
                    break;
            }
        });

        const detachVisibility = coordinator.attachVisibilityHandlers();

        return () => {
            detachVisibility();
            unsubscribe();
            isManualDisconnectRef.current = true;
            clearReconnectTimeout();
            closeSocket();
        };
    }, [connect, clearReconnectTimeout, closeSocket, handleServerPayload]);

    useEffect(() => {
        if (!coordinatorRef.current?.isLeader()) return;
        disconnect();
        const timer = setTimeout(() => {
            sessionReplacedRef.current = false;
            isManualDisconnectRef.current = false;
            connect();
        }, 100);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return {
        socket,
        isConnected,
        uid,
        isSignalingLeader,
        sendMessage,
        drainSignalingMessages,
        signalingRevision,
        disconnect,
        reconnect,
    };
};
