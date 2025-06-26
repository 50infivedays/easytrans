import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from './useWebSocket';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'me' | 'peer';
    timestamp: Date;
    type: 'text' | 'file';
    fileName?: string;
    fileSize?: number;
}

export interface FileTransfer {
    id: string;
    fileName: string;
    fileSize: number;
    progress: number;
    status: 'pending' | 'sending' | 'receiving' | 'completed' | 'failed';
}

export interface UseWebRTCReturn {
    isConnected: boolean;
    messages: ChatMessage[];
    fileTransfers: FileTransfer[];
    connect: (targetId: string) => void;
    sendMessage: (text: string) => void;
    sendFile: (file: File) => void;
    disconnect: () => void;
}

export const useWebRTC = (
    sendSignalingMessage: (message: Message) => void,
    lastSignalingMessage: Message | null
): UseWebRTCReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [fileTransfers] = useState<FileTransfer[]>([]);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const pendingICECandidatesRef = useRef<RTCIceCandidate[]>([]);
    const currentTargetRef = useRef<string | null>(null);

    // WebRTC configuration
    const config: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    const setupDataChannel = useCallback((channel: RTCDataChannel) => {
        channel.onopen = () => {
            console.log('Data channel opened');
            setIsConnected(true);
        };

        channel.onclose = () => {
            console.log('Data channel closed');
            setIsConnected(false);
        };

        channel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'text') {
                    const message: ChatMessage = {
                        id: Date.now().toString(),
                        text: data.text,
                        sender: 'peer',
                        timestamp: new Date(),
                        type: 'text',
                    };
                    setMessages(prev => [...prev, message]);
                } else if (data.type === 'file') {
                    // Handle file transfer
                    console.log('File transfer received:', data);
                }
            } catch (error) {
                console.error('Error parsing data channel message:', error);
            }
        };

        dataChannelRef.current = channel;
    }, []);

    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(config);

        pc.onicecandidate = (event) => {
            if (event.candidate && currentTargetRef.current) {
                sendSignalingMessage({
                    type: 'ice-candidate',
                    to: currentTargetRef.current,
                    data: event.candidate,
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
            setIsConnected(pc.connectionState === 'connected');
        };

        pc.ondatachannel = (event) => {
            const channel = event.channel;
            setupDataChannel(channel);
        };

        return pc;
    }, [sendSignalingMessage, setupDataChannel, config]);

    const connect = useCallback(async (targetId: string) => {
        console.log('Connecting to target:', targetId);
        if (!targetId || targetId.trim() === '') {
            console.error('Target ID is empty');
            return;
        }

        // Store the target ID for ICE candidates
        currentTargetRef.current = targetId;

        if (pcRef.current) {
            pcRef.current.close();
        }

        const pc = createPeerConnection();
        pcRef.current = pc;

        // Create data channel
        const dataChannel = pc.createDataChannel('messages', {
            ordered: true,
        });
        setupDataChannel(dataChannel);

        try {
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send offer through signaling server
            console.log('Sending offer to:', targetId);
            sendSignalingMessage({
                type: 'offer',
                to: targetId,
                data: offer,
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [createPeerConnection, setupDataChannel, sendSignalingMessage]);

    const sendMessage = useCallback((text: string) => {
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            const messageData = {
                type: 'text',
                text,
                timestamp: new Date().toISOString(),
            };

            dataChannelRef.current.send(JSON.stringify(messageData));

            // Add to local messages
            const message: ChatMessage = {
                id: Date.now().toString(),
                text,
                sender: 'me',
                timestamp: new Date(),
                type: 'text',
            };
            setMessages(prev => [...prev, message]);
        }
    }, []);

    const sendFile = useCallback((file: File) => {
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            // For now, just send file info - proper file transfer would need chunking
            const fileData = {
                type: 'file',
                fileName: file.name,
                fileSize: file.size,
                timestamp: new Date().toISOString(),
            };

            dataChannelRef.current.send(JSON.stringify(fileData));

            // Add to local messages
            const message: ChatMessage = {
                id: Date.now().toString(),
                text: `File: ${file.name}`,
                sender: 'me',
                timestamp: new Date(),
                type: 'file',
                fileName: file.name,
                fileSize: file.size,
            };
            setMessages(prev => [...prev, message]);
        }
    }, []);

    const disconnect = useCallback(() => {
        console.log('Disconnecting WebRTC connection');
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        currentTargetRef.current = null;
        setIsConnected(false);
    }, []);

    // Handle signaling messages
    useEffect(() => {
        if (!lastSignalingMessage) return;

        const message = lastSignalingMessage;

        const handleSignalingMessage = async () => {
            try {
                switch (message.type) {
                    case 'offer':
                        console.log('Received offer from:', message.from);
                        // Store the sender as our target for ICE candidates
                        currentTargetRef.current = message.from!;

                        // Always create a new peer connection for incoming offers
                        if (pcRef.current) {
                            pcRef.current.close();
                        }
                        pcRef.current = createPeerConnection();
                        const pc = pcRef.current;

                        console.log('Setting remote description from offer...');
                        await pc.setRemoteDescription(new RTCSessionDescription(message.data));

                        // Process pending ICE candidates
                        for (const candidate of pendingICECandidatesRef.current) {
                            await pc.addIceCandidate(candidate);
                        }
                        pendingICECandidatesRef.current = [];

                        console.log('Creating answer...');
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        console.log('Sending answer to:', message.from);
                        sendSignalingMessage({
                            type: 'answer',
                            to: message.from!,
                            data: answer,
                        });
                        break;

                    case 'answer':
                        console.log('Received answer from:', message.from);
                        if (!pcRef.current) {
                            console.error('No peer connection available for answer');
                            return;
                        }

                        console.log('Setting remote description from answer...');
                        await pcRef.current.setRemoteDescription(new RTCSessionDescription(message.data));

                        // Process pending ICE candidates
                        for (const candidate of pendingICECandidatesRef.current) {
                            await pcRef.current.addIceCandidate(candidate);
                        }
                        pendingICECandidatesRef.current = [];
                        break;

                    case 'ice-candidate':
                        console.log('Received ICE candidate from:', message.from);
                        if (!pcRef.current) {
                            console.error('No peer connection available for ICE candidate');
                            return;
                        }

                        if (pcRef.current.remoteDescription) {
                            console.log('Adding ICE candidate immediately');
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(message.data));
                        } else {
                            console.log('Storing ICE candidate for later');
                            // Store ICE candidate for later
                            pendingICECandidatesRef.current.push(new RTCIceCandidate(message.data));
                        }
                        break;
                }
            } catch (error) {
                console.error('Error handling signaling message:', error);
                console.error('Message type:', message.type);
                console.error('Message data:', message.data);
            }
        };

        handleSignalingMessage();
    }, [lastSignalingMessage, createPeerConnection, sendSignalingMessage]);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        messages,
        fileTransfers,
        connect,
        sendMessage,
        sendFile,
        disconnect,
    };
}; 