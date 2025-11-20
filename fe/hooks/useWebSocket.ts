'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
    type: string;
    from?: string;
    to?: string;
    data?: any;
    error?: string;
}

export interface UseWebSocketReturn {
    socket: WebSocket | null;
    isConnected: boolean;
    uid: string | null;
    sendMessage: (message: Message) => void;
    lastMessage: Message | null;
    disconnect: () => void;
    reconnect: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [uid, setUid] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectCountRef = useRef(0);
    const wsRef = useRef<WebSocket | null>(null);
    const isConnectingRef = useRef(false);
    const isManualDisconnectRef = useRef(false);

    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // 1秒

    const sendMessage = useCallback((message: Message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        // 防止重复连接
        if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)) {
            console.log('Connection already in progress, skipping...');
            return;
        }

        // 清理之前的连接
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
            setSocket(null);
        }

        clearReconnectTimeout();
        isConnectingRef.current = true;

        try {
            console.log('Attempting to connect to WebSocket...');
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected, waiting for ready message...');
                setSocket(ws);
                isConnectingRef.current = false;
                // 连接成功后重置重连计数
                reconnectCountRef.current = 0;
                isManualDisconnectRef.current = false;
            };

            ws.onmessage = (event) => {
                try {
                    const message: Message = JSON.parse(event.data);
                    setLastMessage(message);

                    if (message.type === 'ready') {
                        console.log('Server ready, sending login message...');
                        // 检查本地存储的uid
                        const savedUid = localStorage.getItem('uid') || '';
                        const loginMessage: Message = {
                            type: 'login',
                            data: { uid: savedUid }
                        };
                        ws.send(JSON.stringify(loginMessage));
                    } else if (message.type === 'login_success') {
                        console.log('Login successful');
                        const { uid: userUid, isNewUser } = message.data as { uid: string; isNewUser: boolean };
                        setUid(userUid);
                        localStorage.setItem('uid', userUid);
                        setIsConnected(true);

                        if (isNewUser) {
                            console.log('New user UID assigned:', userUid);
                        } else {
                            console.log('Existing user logged in:', userUid);
                        }
                    }
                } catch (err) {
                    console.error('Failed to parse message:', err);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
                setIsConnected(false);
                setSocket(null);
                isConnectingRef.current = false;

                // 清理引用
                if (wsRef.current === ws) {
                    wsRef.current = null;
                }

                // 只在非手动断开且非正常关闭时重连，并且未超过最大重连次数
                if (!isManualDisconnectRef.current &&
                    event.code !== 1000 &&
                    reconnectCountRef.current < maxReconnectAttempts) {

                    reconnectCountRef.current++;
                    // 使用指数退避策略
                    const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectCountRef.current - 1), 30000);
                    console.log(`Attempting to reconnect (${reconnectCountRef.current}/${maxReconnectAttempts}) in ${delay}ms...`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (!isManualDisconnectRef.current) {
                            connect();
                        }
                    }, delay);
                } else if (reconnectCountRef.current >= maxReconnectAttempts) {
                    console.log('Max reconnection attempts reached, giving up');
                } else if (isManualDisconnectRef.current) {
                    console.log('Manual disconnect, not reconnecting');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                isConnectingRef.current = false;
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            isConnectingRef.current = false;

            // 连接失败时也尝试重连，但要考虑重连次数限制
            if (!isManualDisconnectRef.current && reconnectCountRef.current < maxReconnectAttempts) {
                reconnectCountRef.current++;
                const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectCountRef.current - 1), 30000);
                console.log(`Connection failed, retrying (${reconnectCountRef.current}/${maxReconnectAttempts}) in ${delay}ms...`);

                reconnectTimeoutRef.current = setTimeout(() => {
                    if (!isManualDisconnectRef.current) {
                        connect();
                    }
                }, delay);
            } else {
                console.log('Max reconnection attempts reached, giving up');
            }
        }
    }, [url, clearReconnectTimeout]);

    const disconnect = useCallback(() => {
        console.log('Manual disconnect requested');
        isManualDisconnectRef.current = true;
        clearReconnectTimeout();

        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
            wsRef.current = null;
        }
        setSocket(null);
        setIsConnected(false);
        isConnectingRef.current = false;
    }, [clearReconnectTimeout]);

    // 手动重连函数，重置重连计数
    const reconnect = useCallback(() => {
        console.log('Manual reconnect requested');
        reconnectCountRef.current = 0;
        isManualDisconnectRef.current = false;
        connect();
    }, [connect]);

    // 只在组件挂载时连接一次
    useEffect(() => {
        let mounted = true;

        // 防止React StrictMode的双重调用
        const timer = setTimeout(() => {
            if (mounted && !wsRef.current) {
                connect();
            }
        }, 0);

        return () => {
            mounted = false;
            clearTimeout(timer);
            isManualDisconnectRef.current = true;
            clearReconnectTimeout();
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
        };
    }, [connect, clearReconnectTimeout]); // 只在挂载时执行一次

    // 当URL改变时重新连接
    useEffect(() => {
        if (wsRef.current) {
            disconnect();
            // 短暂延迟后重新连接
            const timer = setTimeout(() => {
                reconnect();
            }, 100);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]); // 只依赖URL变化，避免无限循环

    return {
        socket,
        isConnected,
        uid,
        sendMessage,
        lastMessage,
        disconnect,
        reconnect,
    };
}; 