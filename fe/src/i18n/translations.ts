export interface Translations {
    title: string;
    subtitle: string;
    features: {
        privacy: string;
        privacyDesc: string;
        fileTransfer: string;
        fileTransferDesc: string;
        chat: string;
        chatDesc: string;
        fastTransfer: string;
        fastTransferDesc: string;
    };
    securityFeatures: {
        title: string;
        endToEnd: string;
        p2pDirect: string;
        noServer: string;
    };
    connectionStatus: {
        title: string;
        websocket: string;
        webrtc: string;
        connected: string;
        disconnected: string;
        reconnect: string;
    };
    myUid: {
        title: string;
        description: string;
        getting: string;
        scanToConnect: string;
    };
    connectToPeer: {
        title: string;
        description: string;
        placeholder: string;
        connect: string;
        disconnect: string;
        waiting: string;
        enterUid: string;
        debugInfo: string;
    };
    chat: {
        title: string;
        description: string;
        noMessages: string;
        placeholder: string;
        send: string;
        fileSize: string;
    };
    fileTransfer: {
        title: string;
        download: string;
        size: string;
    };
    instructions: {
        title: string;
        description: string;
        quickStart: string;
        steps: string[];
        coreFeatures: string;
        features: {
            realtimeChat: string;
            realtimeChatDesc: string;
            fileTransfer: string;
            fileTransferDesc: string;
            privacy: string;
            privacyDesc: string;
            fastTransfer: string;
            fastTransferDesc: string;
        };
        security: string;
        securityPoints: string[];
    };
    offerConfirm: {
        title: string;
        description: string;
        accept: string;
        reject: string;
    };
    language: string;
}

export const translations: Record<string, Translations> = {
    zh: {
        title: "EasyTrans",
        subtitle: "基于WebRTC的隐私安全的文件和文本传输",
        features: {
            privacy: "🔒 隐私安全",
            privacyDesc: "端到端加密",
            fileTransfer: "📁 文件传输",
            fileTransferDesc: "P2P直连传输",
            chat: "💬 实时聊天",
            chatDesc: "消息即时发送",
            fastTransfer: "⚡ 快速传输",
            fastTransferDesc: "无需服务器中转",
        },
        securityFeatures: {
            title: "🔐 隐私安全特性",
            endToEnd: "端到端加密保护",
            p2pDirect: "P2P直连，无服务器中转",
            noServer: "数据不经过第三方服务器",
        },
        connectionStatus: {
            title: "连接状态",
            websocket: "WebSocket连接:",
            webrtc: "WebRTC连接:",
            connected: "已连接",
            disconnected: "未连接",
            reconnect: "重连",
        },
        myUid: {
            title: "我的用户ID (UID)",
            description: "分享这个6位代码给其他人以建立连接",
            getting: "获取中...",
            scanToConnect: "扫码连接",
        },
        connectToPeer: {
            title: "连接到对方",
            description: "输入对方的UID来建立P2P连接",
            placeholder: "输入对方的UID (例如: ABC123)",
            connect: "连接",
            disconnect: "断开",
            waiting: "等待连接...",
            enterUid: "请输入UID",
            debugInfo: "调试信息: WebSocket: {wsStatus}, 目标ID: {targetId}, 按钮状态: {buttonStatus}",
        },
        chat: {
            title: "💬 实时聊天 & 📁 文件传输",
            description: "支持端到端加密的文本消息发送和P2P文件传输",
            noMessages: "暂无消息...",
            placeholder: "输入消息...",
            send: "发送",
            fileSize: "大小: {size} KB",
        },
        fileTransfer: {
            title: "文件传输",
            download: "下载",
            size: "大小: {size} KB",
        },
        instructions: {
            title: "📖 使用说明",
            description: "快速开始使用EasyTrans进行隐私安全的文件传输和聊天",
            quickStart: "🚀 快速开始",
            steps: [
                "确保WebSocket连接正常（显示'已连接'）",
                "复制你的UID并分享给对方",
                "输入对方的UID并点击'连接'按钮",
                "连接成功后即可开始发送消息和文件",
            ],
            coreFeatures: "✨ 核心功能",
            features: {
                realtimeChat: "💬 实时聊天",
                realtimeChatDesc: "支持文本消息即时发送，端到端加密保护",
                fileTransfer: "📁 文件传输",
                fileTransferDesc: "P2P直连传输，支持大文件，显示传输进度",
                privacy: "🔒 隐私安全",
                privacyDesc: "WebRTC技术，数据不经过第三方服务器",
                fastTransfer: "⚡ 快速传输",
                fastTransferDesc: "无需服务器中转，传输速度更快",
            },
            security: "🔐 安全说明",
            securityPoints: [
                "所有数据传输均采用端到端加密",
                "文件传输通过WebRTC数据通道，不经过服务器",
                "聊天消息实时加密传输，保护隐私安全",
                "支持任意大小文件传输，无限制",
            ],
        },
        offerConfirm: {
            title: "连接请求",
            description: "用户 {from} 请求与您建立连接，是否接受？",
            accept: "接受",
            reject: "拒绝",
        },
        language: "语言",
    },
    en: {
        title: "EasyTrans",
        subtitle: "Privacy-focused P2P file and text transfer based on WebRTC",
        features: {
            privacy: "🔒 Privacy & Security",
            privacyDesc: "End-to-end encryption",
            fileTransfer: "📁 File Transfer",
            fileTransferDesc: "P2P direct transfer",
            chat: "💬 Real-time Chat",
            chatDesc: "Instant messaging",
            fastTransfer: "⚡ Fast Transfer",
            fastTransferDesc: "No server relay",
        },
        securityFeatures: {
            title: "🔐 Privacy & Security Features",
            endToEnd: "End-to-end encryption protection",
            p2pDirect: "P2P direct connection, no server relay",
            noServer: "Data doesn't pass through third-party servers",
        },
        connectionStatus: {
            title: "Connection Status",
            websocket: "WebSocket Connection:",
            webrtc: "WebRTC Connection:",
            connected: "Connected",
            disconnected: "Disconnected",
            reconnect: "Reconnect",
        },
        myUid: {
            title: "My User ID (UID)",
            description: "Share this 6-digit code with others to establish connection",
            getting: "Getting...",
            scanToConnect: "Scan to connect",
        },
        connectToPeer: {
            title: "Connect to Peer",
            description: "Enter the other party's UID to establish P2P connection",
            placeholder: "Enter peer's UID (e.g., ABC123)",
            connect: "Connect",
            disconnect: "Disconnect",
            waiting: "Waiting for connection...",
            enterUid: "Please enter UID",
            debugInfo: "Debug info: WebSocket: {wsStatus}, Target ID: {targetId}, Button status: {buttonStatus}",
        },
        chat: {
            title: "💬 Real-time Chat & 📁 File Transfer",
            description: "End-to-end encrypted text messaging and P2P file transfer",
            noMessages: "No messages yet...",
            placeholder: "Type a message...",
            send: "Send",
            fileSize: "Size: {size} KB",
        },
        fileTransfer: {
            title: "File Transfer",
            download: "Download",
            size: "Size: {size} KB",
        },
        instructions: {
            title: "📖 Instructions",
            description: "Quick start guide for privacy-focused file transfer and chat",
            quickStart: "🚀 Quick Start",
            steps: [
                "Ensure WebSocket connection is normal (shows 'Connected')",
                "Copy your UID and share it with others",
                "Enter the other party's UID and click 'Connect'",
                "Start sending messages and files after successful connection",
            ],
            coreFeatures: "✨ Core Features",
            features: {
                realtimeChat: "💬 Real-time Chat",
                realtimeChatDesc: "Instant text messaging with end-to-end encryption",
                fileTransfer: "📁 File Transfer",
                fileTransferDesc: "P2P direct transfer, supports large files with progress display",
                privacy: "🔒 Privacy & Security",
                privacyDesc: "WebRTC technology, data doesn't pass through third-party servers",
                fastTransfer: "⚡ Fast Transfer",
                fastTransferDesc: "No server relay, faster transfer speed",
            },
            security: "🔐 Security Notes",
            securityPoints: [
                "All data transmission uses end-to-end encryption",
                "File transfer through WebRTC data channels, no server involvement",
                "Chat messages are encrypted in real-time for privacy protection",
                "Supports file transfer of any size without limits",
            ],
        },
        offerConfirm: {
            title: "Connection Request",
            description: "User {from} is requesting to connect with you. Accept?",
            accept: "Accept",
            reject: "Reject",
        },
        language: "Language",
    },
};

export const getBrowserLanguage = (): string => {
    const language = navigator.language || navigator.languages?.[0] || 'en';
    return language.startsWith('zh') ? 'zh' : 'en';
};

export const formatMessage = (message: string, params: Record<string, string | number> = {}): string => {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key]?.toString() || match;
    });
}; 