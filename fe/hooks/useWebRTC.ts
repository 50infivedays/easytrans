'use client';

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

interface FileTransferStartPayload {
    transferId: string;
    fileName: string;
    fileSize: number;
}

interface FileChunkInfoPayload {
    transferId: string;
    chunkIndex: number;
    totalChunks: number;
}

interface FileTransferEndPayload {
    transferId: string;
}

interface PendingOffer {
    from: string;
    data: RTCSessionDescriptionInit;
}

type NotifyType = 'success' | 'error' | 'info';

export interface SignalingLabels {
    notReady: string;
    p2pFailed: string;
    startFailed: string;
    transferLost: string;
    acceptFailed: string;
    peerDisconnected: string;
    rejected: string;
    error: string;
    targetNotFound: string;
}

const MAX_BUFFERED_AMOUNT = 256 * 1024;
const CHUNK_SIZE = 16384;
const PROGRESS_THROTTLE_MS = 250;

function asSessionDescription(data: unknown): RTCSessionDescriptionInit {
    return data as RTCSessionDescriptionInit;
}

function asIceCandidateInit(data: unknown): RTCIceCandidateInit {
    return data as RTCIceCandidateInit;
}

function isPolitePeer(localUid: string, remoteUid: string): boolean {
    return localUid.localeCompare(remoteUid) < 0;
}

function waitForBuffer(channel: RTCDataChannel, maxBuffered = MAX_BUFFERED_AMOUNT): Promise<boolean> {
    return new Promise((resolve) => {
        const check = () => {
            if (channel.readyState !== 'open') {
                resolve(false);
                return;
            }
            if (channel.bufferedAmount <= maxBuffered) {
                resolve(true);
                return;
            }
            setTimeout(check, 20);
        };
        check();
    });
}

export interface UseWebRTCReturn {
    isConnected: boolean;
    messages: ChatMessage[];
    fileTransfers: FileTransfer[];
    connect: (targetId: string) => void;
    sendMessage: (text: string) => void;
    sendFile: (file: File) => void;
    disconnect: () => void;
    showOfferConfirm: boolean;
    offerFrom: string | null;
    confirmOffer: () => void;
    rejectOffer: () => void;
    connectedPeerId: string | null;
}

export const useWebRTC = (
    sendSignalingMessage: (message: Message) => void,
    drainSignalingMessages: () => Message[],
    signalingRevision: number,
    localUid: string | null,
    signalingLabels: SignalingLabels,
    onNotify?: (message: string, type: NotifyType) => void
): UseWebRTCReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [fileTransfers, setFileTransfers] = useState<FileTransfer[]>([]);
    const [showOfferConfirm, setShowOfferConfirm] = useState(false);
    const [offerFrom, setOfferFrom] = useState<string | null>(null);
    const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);

    const pendingOfferRef = useRef<PendingOffer | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const pendingICECandidatesRef = useRef<RTCIceCandidate[]>([]);
    const currentTargetRef = useRef<string | null>(null);
    const makingOfferRef = useRef(false);
    const pendingChunkTransferIdRef = useRef<string | null>(null);
    const fileTransferRef = useRef<Map<string, FileTransfer>>(new Map());
    const receivingFilesRef = useRef<Map<string, { chunks: ArrayBuffer[]; receivedSize: number; totalSize: number; fileName: string }>>(new Map());
    const progressFlushRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressPatchesRef = useRef<Map<string, Partial<FileTransfer>>>(new Map());

    const flushProgressUpdates = useCallback((immediate = false) => {
        const run = () => {
            progressFlushRef.current = null;
            if (progressPatchesRef.current.size === 0) return;
            const patches = new Map(progressPatchesRef.current);
            progressPatchesRef.current.clear();
            setFileTransfers((prev) => prev.map((transfer) => {
                const patch = patches.get(transfer.id);
                return patch ? { ...transfer, ...patch } : transfer;
            }));
        };

        if (immediate) {
            if (progressFlushRef.current) {
                clearTimeout(progressFlushRef.current);
                progressFlushRef.current = null;
            }
            run();
            return;
        }

        if (progressFlushRef.current) return;
        progressFlushRef.current = setTimeout(run, PROGRESS_THROTTLE_MS);
    }, []);

    const queueProgressUpdate = useCallback((transferId: string, patch: Partial<FileTransfer>, immediate = false) => {
        const existing = progressPatchesRef.current.get(transferId) ?? {};
        progressPatchesRef.current.set(transferId, { ...existing, ...patch, id: transferId });
        flushProgressUpdates(immediate);
    }, [flushProgressUpdates]);

    const notify = useCallback((message: string, type: NotifyType = 'info') => {
        onNotify?.(message, type);
    }, [onNotify]);

    const resetConnectionState = useCallback(() => {
        currentTargetRef.current = null;
        makingOfferRef.current = false;
        pendingChunkTransferIdRef.current = null;
        pendingICECandidatesRef.current = [];
        pendingOfferRef.current = null;
        setIsConnected(false);
        setConnectedPeerId(null);
        setShowOfferConfirm(false);
        setOfferFrom(null);
    }, []);

    const cleanupPeerConnection = useCallback(() => {
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
    }, []);

    const handleFileTransferStart = useCallback((data: FileTransferStartPayload) => {
        receivingFilesRef.current.set(data.transferId, {
            chunks: [],
            receivedSize: 0,
            totalSize: data.fileSize,
            fileName: data.fileName,
        });

        setFileTransfers((prev) => [
            ...prev,
            {
                id: data.transferId,
                fileName: data.fileName,
                fileSize: data.fileSize,
                progress: 0,
                status: 'receiving',
            },
        ]);
    }, []);

    const handleFileChunkInfo = useCallback((data: FileChunkInfoPayload) => {
        pendingChunkTransferIdRef.current = data.transferId;
        queueProgressUpdate(data.transferId, {
            progress: ((data.chunkIndex + 1) / data.totalChunks) * 100,
        });
    }, [queueProgressUpdate]);

    const handleFileChunk = useCallback((chunk: ArrayBuffer) => {
        const transferId = pendingChunkTransferIdRef.current;
        pendingChunkTransferIdRef.current = null;
        if (!transferId) return;

        const fileInfo = receivingFilesRef.current.get(transferId);
        if (!fileInfo) return;

        fileInfo.chunks.push(chunk);
        fileInfo.receivedSize += chunk.byteLength;

        queueProgressUpdate(transferId, {
            progress: (fileInfo.receivedSize / fileInfo.totalSize) * 100,
        });
    }, [queueProgressUpdate]);

    const handleFileTransferEnd = useCallback((data: FileTransferEndPayload) => {
        const fileInfo = receivingFilesRef.current.get(data.transferId);
        if (!fileInfo) return;

        const totalSize = fileInfo.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
        const combinedBuffer = new ArrayBuffer(totalSize);
        const uint8Array = new Uint8Array(combinedBuffer);

        let offset = 0;
        for (const chunk of fileInfo.chunks) {
            uint8Array.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
        }

        setFileTransfers((prev) => prev.map((transfer) => {
            if (transfer.id === data.transferId) {
                return {
                    ...transfer,
                    status: 'completed',
                    progress: 100,
                    data: combinedBuffer,
                };
            }
            return transfer;
        }));
        progressPatchesRef.current.delete(data.transferId);
        flushProgressUpdates(true);

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                text: `收到文件: ${fileInfo.fileName}`,
                sender: 'peer',
                timestamp: new Date(),
                type: 'file',
                fileName: fileInfo.fileName,
                fileSize: fileInfo.totalSize,
            },
        ]);

        receivingFilesRef.current.delete(data.transferId);
    }, [flushProgressUpdates]);

    const setupDataChannel = useCallback((channel: RTCDataChannel) => {
        channel.onopen = () => {
            setIsConnected(true);
            if (currentTargetRef.current) {
                setConnectedPeerId(currentTargetRef.current);
            }
        };

        channel.onclose = () => {
            setIsConnected(false);
            setConnectedPeerId(null);
        };

        channel.onmessage = (event) => {
            try {
                if (event.data instanceof ArrayBuffer) {
                    handleFileChunk(event.data);
                    return;
                }

                const data = JSON.parse(event.data as string);

                if (data.type === 'text') {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            text: data.text,
                            sender: 'peer',
                            timestamp: new Date(),
                            type: 'text',
                        },
                    ]);
                } else if (data.type === 'file-start') {
                    handleFileTransferStart(data);
                } else if (data.type === 'file-chunk') {
                    handleFileChunkInfo(data);
                } else if (data.type === 'file-end') {
                    handleFileTransferEnd(data);
                }
            } catch (error) {
                console.error('Error parsing data channel message:', error);
            }
        };

        dataChannelRef.current = channel;
    }, [handleFileChunk, handleFileTransferEnd, handleFileTransferStart, handleFileChunkInfo]);

    const createPeerConnection = useCallback(() => {
        const rtcConfig: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.cloudflare.com:3478' },
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:stun.voipbuster.com:3478' },
                { urls: 'stun:stun.voipstunt.com:3478' },
                {
                    urls: ['turn:turn.bqrdh.com:3478'],
                    username: 'chenzw',
                    credential: 'otary@1990',
                },
                {
                    urls: ['turn:43.138.235.180:9002'],
                    username: 'dfs',
                    credential: 'mypwd',
                },
            ],
            iceCandidatePoolSize: 15,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            iceTransportPolicy: 'all',
        };

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (event) => {
            if (event.candidate && currentTargetRef.current) {
                sendSignalingMessage({
                    type: 'ice-candidate',
                    to: currentTargetRef.current,
                    data: event.candidate.toJSON(),
                });
            }
        };

        pc.onicecandidateerror = (event) => {
            console.error('ICE candidate error:', event);
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'failed') {
                console.warn('ICE connection failed');
                notify(signalingLabels.p2pFailed, 'error');
            }
        };

        pc.ondatachannel = (event) => {
            setupDataChannel(event.channel);
        };

        return pc;
    }, [notify, sendSignalingMessage, setupDataChannel, signalingLabels]);

    const addIceCandidate = useCallback(async (candidateInit: RTCIceCandidateInit) => {
        const pc = pcRef.current;
        if (!pc) {
            pendingICECandidatesRef.current.push(new RTCIceCandidate(candidateInit));
            return;
        }

        if (pc.remoteDescription) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
            } catch (error) {
                console.error('Failed to add ICE candidate:', error);
            }
            return;
        }

        pendingICECandidatesRef.current.push(new RTCIceCandidate(candidateInit));
    }, []);

    const flushPendingIceCandidates = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc) return;

        const pending = pendingICECandidatesRef.current.splice(0);
        for (const candidate of pending) {
            try {
                await pc.addIceCandidate(candidate);
            } catch (error) {
                console.error('Failed to add pending ICE candidate:', error);
            }
        }
    }, []);

    const connect = useCallback(async (targetId: string) => {
        const normalizedTarget = targetId.trim().toUpperCase();
        if (!normalizedTarget) return;

        currentTargetRef.current = normalizedTarget;
        cleanupPeerConnection();

        const pc = createPeerConnection();
        pcRef.current = pc;

        const dataChannel = pc.createDataChannel('messages', { ordered: true });
        setupDataChannel(dataChannel);

        makingOfferRef.current = true;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignalingMessage({
                type: 'offer',
                to: normalizedTarget,
                data: offer,
            });
        } catch (error) {
            console.error('Error creating offer:', error);
            notify(signalingLabels.startFailed, 'error');
        } finally {
            makingOfferRef.current = false;
        }
    }, [cleanupPeerConnection, createPeerConnection, notify, sendSignalingMessage, setupDataChannel, signalingLabels]);

    const sendMessage = useCallback((text: string) => {
        const channel = dataChannelRef.current;
        if (!channel || channel.readyState !== 'open') {
            notify(signalingLabels.notReady, 'error');
            return;
        }

        channel.send(JSON.stringify({
            type: 'text',
            text,
            timestamp: new Date().toISOString(),
        }));

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                text,
                sender: 'me',
                timestamp: new Date(),
                type: 'text',
            },
        ]);
    }, [notify, signalingLabels]);

    const sendFile = useCallback(async (file: File) => {
        const channel = dataChannelRef.current;
        if (!channel || channel.readyState !== 'open') {
            notify(signalingLabels.notReady, 'error');
            return;
        }

        const transferId = Date.now().toString();
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        setFileTransfers((prev) => [
            ...prev,
            {
                id: transferId,
                fileName: file.name,
                fileSize: file.size,
                progress: 0,
                status: 'sending',
            },
        ]);
        fileTransferRef.current.set(transferId, {
            id: transferId,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: 'sending',
        });

        const canContinue = await waitForBuffer(channel);
        if (!canContinue) {
            notify(signalingLabels.transferLost, 'error');
            return;
        }

        channel.send(JSON.stringify({
            type: 'file-start',
            transferId,
            fileName: file.name,
            fileSize: file.size,
            totalChunks,
        }));

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            const buffer = await chunk.arrayBuffer();

            const ready = await waitForBuffer(channel);
            if (!ready) {
                notify(signalingLabels.transferLost, 'error');
                setFileTransfers((prev) => prev.map((transfer) => (
                    transfer.id === transferId ? { ...transfer, status: 'failed' } : transfer
                )));
                return;
            }

            channel.send(JSON.stringify({
                type: 'file-chunk',
                transferId,
                chunkIndex,
                totalChunks,
            }));
            channel.send(buffer);

            queueProgressUpdate(transferId, {
                progress: ((chunkIndex + 1) / totalChunks) * 100,
            });
        }

        const ready = await waitForBuffer(channel);
        if (!ready) {
            notify(signalingLabels.transferLost, 'error');
            return;
        }

        channel.send(JSON.stringify({ type: 'file-end', transferId }));

        queueProgressUpdate(transferId, { status: 'completed', progress: 100 }, true);

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                text: `发送文件: ${file.name}`,
                sender: 'me',
                timestamp: new Date(),
                type: 'file',
                fileName: file.name,
                fileSize: file.size,
            },
        ]);

        fileTransferRef.current.delete(transferId);
    }, [notify, queueProgressUpdate, signalingLabels]);

    const disconnect = useCallback(() => {
        if (currentTargetRef.current) {
            sendSignalingMessage({
                type: 'disconnect',
                to: currentTargetRef.current,
                data: {},
            });
        }

        cleanupPeerConnection();
        resetConnectionState();
    }, [cleanupPeerConnection, resetConnectionState, sendSignalingMessage]);

    const confirmOffer = useCallback(async () => {
        if (!pendingOfferRef.current) return;

        const { from, data } = pendingOfferRef.current;
        setShowOfferConfirm(false);
        setOfferFrom(null);
        pendingOfferRef.current = null;

        try {
            currentTargetRef.current = from;
            cleanupPeerConnection();

            const pc = createPeerConnection();
            pcRef.current = pc;

            await pc.setRemoteDescription(new RTCSessionDescription(data));
            await flushPendingIceCandidates();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendSignalingMessage({
                type: 'answer',
                to: from,
                data: answer,
            });
        } catch (error) {
            console.error('Error handling confirmed offer:', error);
            notify(signalingLabels.acceptFailed, 'error');
            resetConnectionState();
        }
    }, [cleanupPeerConnection, createPeerConnection, flushPendingIceCandidates, notify, resetConnectionState, sendSignalingMessage, signalingLabels]);

    const rejectOffer = useCallback(() => {
        if (!pendingOfferRef.current) return;

        const { from } = pendingOfferRef.current;
        setShowOfferConfirm(false);
        setOfferFrom(null);
        pendingOfferRef.current = null;
        pendingICECandidatesRef.current = [];

        sendSignalingMessage({
            type: 'offer-rejected',
            to: from,
            data: { reason: 'User rejected the connection offer' },
        });
    }, [sendSignalingMessage]);

    const handleRemoteDisconnect = useCallback(() => {
        cleanupPeerConnection();
        resetConnectionState();
        notify(signalingLabels.peerDisconnected, 'info');
    }, [cleanupPeerConnection, notify, resetConnectionState, signalingLabels]);

    const handleOfferRejected = useCallback(() => {
        cleanupPeerConnection();
        resetConnectionState();
        notify(signalingLabels.rejected, 'error');
    }, [cleanupPeerConnection, notify, resetConnectionState, signalingLabels]);

    const handleIncomingOffer = useCallback(async (message: Message) => {
        const from = message.from;
        if (!from) return;

        const remoteDescription = asSessionDescription(message.data);
        const offerCollision = Boolean(
            pcRef.current &&
            (makingOfferRef.current || pcRef.current.signalingState !== 'stable')
        );

        if (offerCollision && localUid && !isPolitePeer(localUid, from)) {
            console.log('Glare detected: impolite side ignoring offer from', from);
            return;
        }

        if (offerCollision && localUid && isPolitePeer(localUid, from)) {
            console.log('Glare detected: polite side rolling back for offer from', from);
            cleanupPeerConnection();
            makingOfferRef.current = false;
        } else if (pcRef.current) {
            cleanupPeerConnection();
            setIsConnected(false);
            setConnectedPeerId(null);
        }

        pendingICECandidatesRef.current = [];
        setShowOfferConfirm(true);
        setOfferFrom(from);
        pendingOfferRef.current = { from, data: remoteDescription };
    }, [cleanupPeerConnection, localUid]);

    const processSignalingMessage = useCallback(async (message: Message) => {
        try {
            switch (message.type) {
                case 'disconnect':
                    handleRemoteDisconnect();
                    break;

                case 'offer-rejected':
                    handleOfferRejected();
                    break;

                case 'error': {
                    const serverError = message.error || '';
                    if (serverError.toLowerCase().includes('not found')) {
                        notify(signalingLabels.targetNotFound, 'error');
                    } else {
                        notify(serverError || signalingLabels.error, 'error');
                    }
                    break;
                }

                case 'offer':
                    await handleIncomingOffer(message);
                    break;

                case 'answer': {
                    const pc = pcRef.current;
                    if (!pc) {
                        console.error('No peer connection available for answer');
                        return;
                    }

                    await pc.setRemoteDescription(new RTCSessionDescription(asSessionDescription(message.data)));
                    await flushPendingIceCandidates();
                    break;
                }

                case 'ice-candidate': {
                    if (pendingOfferRef.current && pendingOfferRef.current.from === message.from) {
                        pendingICECandidatesRef.current.push(
                            new RTCIceCandidate(asIceCandidateInit(message.data))
                        );
                        return;
                    }

                    await addIceCandidate(asIceCandidateInit(message.data));
                    break;
                }

                default:
                    break;
            }
        } catch (error) {
            console.error('Error handling signaling message:', error);
            console.error('Message type:', message.type);
            console.error('Message data:', message.data);
        }
    }, [
        addIceCandidate,
        flushPendingIceCandidates,
        handleIncomingOffer,
        handleOfferRejected,
        handleRemoteDisconnect,
        notify,
        signalingLabels,
    ]);

    useEffect(() => {
        const messages = drainSignalingMessages();
        if (messages.length === 0) return;

        void (async () => {
            for (const message of messages) {
                await processSignalingMessage(message);
            }
        })();
    }, [signalingRevision, drainSignalingMessages, processSignalingMessage]);

    useEffect(() => {
        return () => {
            cleanupPeerConnection();
        };
    }, [cleanupPeerConnection]);

    return {
        isConnected,
        messages,
        fileTransfers,
        connect,
        sendMessage,
        sendFile: (file: File) => {
            void sendFile(file);
        },
        disconnect,
        showOfferConfirm,
        offerFrom,
        confirmOffer,
        rejectOffer,
        connectedPeerId,
    };
};
