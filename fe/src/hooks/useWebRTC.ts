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
    data?: ArrayBuffer;
}

export interface UseWebRTCReturn {
    isConnected: boolean;
    messages: ChatMessage[];
    fileTransfers: FileTransfer[];
    connect: (targetId: string) => void;
    sendMessage: (text: string) => void;
    sendFile: (file: File) => void;
    disconnect: () => void;
    // 新增确认框相关状态
    showOfferConfirm: boolean;
    offerFrom: string | null;
    confirmOffer: () => void;
    rejectOffer: () => void;
    // 新增当前连接的对方ID
    connectedPeerId: string | null;
}

export const useWebRTC = (
    sendSignalingMessage: (message: Message) => void,
    lastSignalingMessage: Message | null
): UseWebRTCReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [fileTransfers, setFileTransfers] = useState<FileTransfer[]>([]);

    // 新增确认框状态
    const [showOfferConfirm, setShowOfferConfirm] = useState(false);
    const [offerFrom, setOfferFrom] = useState<string | null>(null);
    const pendingOfferRef = useRef<{ from: string; data: any } | null>(null);

    // 新增当前连接的对方ID状态
    const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const pendingICECandidatesRef = useRef<RTCIceCandidate[]>([]);
    const currentTargetRef = useRef<string | null>(null);

    // File transfer state
    const fileTransferRef = useRef<Map<string, FileTransfer>>(new Map());
    const receivingFilesRef = useRef<Map<string, { chunks: ArrayBuffer[], receivedSize: number, totalSize: number, fileName: string }>>(new Map());





    const handleFileTransferStart = useCallback((data: any) => {
        const transferId = data.transferId;
        const fileName = data.fileName;
        const fileSize = data.fileSize;

        console.log('Starting file transfer:', { transferId, fileName, fileSize });

        // Initialize receiving file
        receivingFilesRef.current.set(transferId, {
            chunks: [],
            receivedSize: 0,
            totalSize: fileSize,
            fileName: fileName
        });

        // Add to file transfers list
        const fileTransfer: FileTransfer = {
            id: transferId,
            fileName,
            fileSize,
            progress: 0,
            status: 'receiving'
        };

        setFileTransfers(prev => [...prev, fileTransfer]);
    }, []);

    const handleFileChunkInfo = useCallback((data: any) => {
        const transferId = data.transferId;
        const chunkIndex = data.chunkIndex;
        const totalChunks = data.totalChunks;

        console.log('File chunk info:', { transferId, chunkIndex, totalChunks });

        // Update progress
        setFileTransfers(prev => prev.map(transfer => {
            if (transfer.id === transferId) {
                return {
                    ...transfer,
                    progress: (chunkIndex / totalChunks) * 100
                };
            }
            return transfer;
        }));
    }, []);

    const handleFileChunk = useCallback((chunk: ArrayBuffer) => {
        // Find the current receiving file
        const entries = Array.from(receivingFilesRef.current.entries());
        for (const [transferId, fileInfo] of entries) {
            fileInfo.chunks.push(chunk);
            fileInfo.receivedSize += chunk.byteLength;

            // Update progress
            setFileTransfers(prev => prev.map(transfer => {
                if (transfer.id === transferId) {
                    return {
                        ...transfer,
                        progress: (fileInfo.receivedSize / fileInfo.totalSize) * 100
                    };
                }
                return transfer;
            }));

            break; // Only handle one file at a time
        }
    }, []);

    const handleFileTransferEnd = useCallback((data: any) => {
        const transferId = data.transferId;
        const fileInfo = receivingFilesRef.current.get(transferId);

        if (fileInfo) {
            console.log('File transfer completed:', fileInfo.fileName);

            // Combine all chunks
            const totalSize = fileInfo.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
            const combinedBuffer = new ArrayBuffer(totalSize);
            const uint8Array = new Uint8Array(combinedBuffer);

            let offset = 0;
            for (const chunk of fileInfo.chunks) {
                uint8Array.set(new Uint8Array(chunk), offset);
                offset += chunk.byteLength;
            }

            // Update file transfer status
            setFileTransfers(prev => prev.map(transfer => {
                if (transfer.id === transferId) {
                    return {
                        ...transfer,
                        status: 'completed',
                        progress: 100,
                        data: combinedBuffer
                    };
                }
                return transfer;
            }));

            // Add message
            const message: ChatMessage = {
                id: Date.now().toString(),
                text: `收到文件: ${fileInfo.fileName}`,
                sender: 'peer',
                timestamp: new Date(),
                type: 'file',
                fileName: fileInfo.fileName,
                fileSize: fileInfo.totalSize,
            };
            setMessages(prev => [...prev, message]);

            // Clean up
            receivingFilesRef.current.delete(transferId);
        }
    }, []);

    const setupDataChannel = useCallback((channel: RTCDataChannel) => {
        channel.onopen = () => {
            console.log('Data channel opened');
            setIsConnected(true);
            // 设置当前连接的对方ID
            if (currentTargetRef.current) {
                setConnectedPeerId(currentTargetRef.current);
            }
        };

        channel.onclose = () => {
            console.log('Data channel closed');
            setIsConnected(false);
            // 清除当前连接的对方ID
            setConnectedPeerId(null);
        };

        channel.onmessage = (event) => {
            try {
                // Check if it's a binary message (file chunk)
                if (event.data instanceof ArrayBuffer) {
                    handleFileChunk(event.data);
                    return;
                }

                // Handle text messages
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
                } else if (data.type === 'file-start') {
                    // Handle file transfer start
                    handleFileTransferStart(data);
                } else if (data.type === 'file-chunk') {
                    // Handle file chunk info (not the actual chunk)
                    handleFileChunkInfo(data);
                } else if (data.type === 'file-end') {
                    // Handle file transfer end
                    handleFileTransferEnd(data);
                }
            } catch (error) {
                console.error('Error parsing data channel message:', error);
            }
        };

        dataChannelRef.current = channel;
    }, [handleFileChunk, handleFileTransferStart, handleFileChunkInfo, handleFileTransferEnd]);

    const createPeerConnection = useCallback(() => {
        // Create WebRTC configuration
        const rtcConfig: RTCConfiguration = {
            iceServers: [
                // Cloudflare STUN 服务器（最高优先级）
                { urls: 'stun:stun.cloudflare.com:3478' },

                // 小米WiFi STUN 服务器
                { urls: 'stun:stun.miwifi.com:3478' },

                // Google STUN 服务器（备用）
                { urls: 'stun:stun.l.google.com:19302' },

                // VoIP 服务 STUN 服务器
                { urls: 'stun:stun.voipbuster.com' },
                { urls: 'stun:stun.voipstunt.com' },

                // 自定义 TURN 服务器（已注释）
                // {
                //     urls: ["turn:turn.bqrdh.com"],
                //     username: "chenzw",
                //     credential: "otary@1990"
                // },
            ],
            iceCandidatePoolSize: 10, // Generate more ICE candidates
            bundlePolicy: 'balanced',
            rtcpMuxPolicy: 'require',
            // Force the use of STUN servers for discovering public IP
            iceTransportPolicy: 'all',
        };

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (event) => {
            if (event.candidate && currentTargetRef.current) {
                // Log ICE candidate for debugging NAT traversal
                console.log('ICE Candidate:', {
                    type: event.candidate.type,
                    address: event.candidate.address,
                    port: event.candidate.port,
                    protocol: event.candidate.protocol,
                    candidate: event.candidate.candidate
                });

                sendSignalingMessage({
                    type: 'ice-candidate',
                    to: currentTargetRef.current,
                    data: event.candidate,
                });
            }
        };

        pc.onicecandidateerror = (event) => {
            console.error('ICE candidate error:', event);
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);

            // Additional debugging for connection failures
            if (pc.iceConnectionState === 'failed') {
                console.warn('ICE connection failed - this often indicates NAT/firewall issues');
                console.log('Attempting ICE restart...');
                pc.restartIce();
            }
        };

        pc.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', pc.iceGatheringState);
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
    }, [sendSignalingMessage, setupDataChannel]);

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
            const transferId = Date.now().toString();
            const chunkSize = 16384; // 16KB chunks
            const totalChunks = Math.ceil(file.size / chunkSize);

            console.log('Starting file transfer:', {
                fileName: file.name,
                fileSize: file.size,
                transferId,
                totalChunks
            });

            // Add to file transfers list
            const fileTransfer: FileTransfer = {
                id: transferId,
                fileName: file.name,
                fileSize: file.size,
                progress: 0,
                status: 'sending'
            };

            setFileTransfers(prev => [...prev, fileTransfer]);
            fileTransferRef.current.set(transferId, fileTransfer);

            // Send file start message
            const startMessage = {
                type: 'file-start',
                transferId,
                fileName: file.name,
                fileSize: file.size,
                totalChunks
            };

            dataChannelRef.current.send(JSON.stringify(startMessage));

            // Read and send file in chunks
            const reader = new FileReader();
            let chunkIndex = 0;

            reader.onload = (e) => {
                if (e.target?.result instanceof ArrayBuffer) {
                    // Send chunk info
                    const chunkInfo = {
                        type: 'file-chunk',
                        transferId,
                        chunkIndex,
                        totalChunks
                    };
                    dataChannelRef.current?.send(JSON.stringify(chunkInfo));

                    // Send actual chunk data
                    dataChannelRef.current?.send(e.target.result);

                    chunkIndex++;

                    // Update progress
                    setFileTransfers(prev => prev.map(transfer => {
                        if (transfer.id === transferId) {
                            return {
                                ...transfer,
                                progress: (chunkIndex / totalChunks) * 100
                            };
                        }
                        return transfer;
                    }));

                    // Continue reading if more chunks
                    if (chunkIndex < totalChunks) {
                        const start = chunkIndex * chunkSize;
                        const end = Math.min(start + chunkSize, file.size);
                        const chunk = file.slice(start, end);
                        reader.readAsArrayBuffer(chunk);
                    } else {
                        // Send file end message
                        const endMessage = {
                            type: 'file-end',
                            transferId
                        };
                        dataChannelRef.current?.send(JSON.stringify(endMessage));

                        // Update status to completed
                        setFileTransfers(prev => prev.map(transfer => {
                            if (transfer.id === transferId) {
                                return {
                                    ...transfer,
                                    status: 'completed',
                                    progress: 100
                                };
                            }
                            return transfer;
                        }));

                        // Add message
                        const message: ChatMessage = {
                            id: Date.now().toString(),
                            text: `发送文件: ${file.name}`,
                            sender: 'me',
                            timestamp: new Date(),
                            type: 'file',
                            fileName: file.name,
                            fileSize: file.size,
                        };
                        setMessages(prev => [...prev, message]);

                        // Clean up
                        fileTransferRef.current.delete(transferId);
                    }
                }
            };

            // Start reading first chunk
            const firstChunk = file.slice(0, chunkSize);
            reader.readAsArrayBuffer(firstChunk);
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
        setConnectedPeerId(null);
    }, []);

    // 确认offer的处理函数
    const confirmOffer = useCallback(async () => {
        if (!pendingOfferRef.current) return;

        const { from, data } = pendingOfferRef.current;
        console.log('User confirmed offer from:', from);

        // 清除确认框状态
        setShowOfferConfirm(false);
        setOfferFrom(null);
        pendingOfferRef.current = null;

        // 处理offer
        try {
            // Store the sender as our target for ICE candidates
            currentTargetRef.current = from;

            // Always create a new peer connection for incoming offers
            if (pcRef.current) {
                pcRef.current.close();
            }
            pcRef.current = createPeerConnection();
            const pc = pcRef.current;

            console.log('Setting remote description from offer...');
            await pc.setRemoteDescription(new RTCSessionDescription(data));

            // Process pending ICE candidates
            for (const candidate of pendingICECandidatesRef.current) {
                await pc.addIceCandidate(candidate);
            }
            pendingICECandidatesRef.current = [];

            console.log('Creating answer...');
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log('Sending answer to:', from);
            sendSignalingMessage({
                type: 'answer',
                to: from,
                data: answer,
            });
        } catch (error) {
            console.error('Error handling confirmed offer:', error);
        }
    }, [createPeerConnection, sendSignalingMessage]);

    // 拒绝offer的处理函数
    const rejectOffer = useCallback(() => {
        if (!pendingOfferRef.current) return;

        const { from } = pendingOfferRef.current;
        console.log('User rejected offer from:', from);

        // 清除确认框状态
        setShowOfferConfirm(false);
        setOfferFrom(null);
        pendingOfferRef.current = null;

        // 发送拒绝消息
        sendSignalingMessage({
            type: 'offer-rejected',
            to: from,
            data: { reason: 'User rejected the connection offer' }
        });
    }, [sendSignalingMessage]);

    // Handle signaling messages
    useEffect(() => {
        if (!lastSignalingMessage) return;

        const message = lastSignalingMessage;

        const handleSignalingMessage = async () => {
            try {
                switch (message.type) {
                    case 'offer':
                        console.log('Received offer from:', message.from);

                        // 显示确认框而不是直接处理offer
                        setShowOfferConfirm(true);
                        setOfferFrom(message.from!);
                        pendingOfferRef.current = {
                            from: message.from!,
                            data: message.data
                        };
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
        showOfferConfirm,
        offerFrom,
        confirmOffer,
        rejectOffer,
        connectedPeerId,
    };
}; 