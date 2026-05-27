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
        scanQR: string;
        scanSuccess: string;
        scanSuccessToast: string;
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
    qrScanner: {
        title: string;
        description: string;
        cameraDenied: string;
        cameraNotFound: string;
        cameraFailed: string;
        browserNotSupported: string;
        httpsRequiredMobile: string;
        httpsRequired: string;
        permissionHintMobile: string;
        permissionHint: string;
        clickToStart: string;
        requestPermission: string;
        startScan: string;
        stopScan: string;
        close: string;
        deviceNotSupported: string;
        cameraInUse: string;
        cameraError: string;
    };
    footer: {
        allRightsReserved: string;
        privacyPolicy: string;
        termsOfService: string;
        copyright: string;
    };
    workspace: {
        copy: string;
        trustTitle: string;
        chatTitle: string;
        step1: string;
        step2: string;
        peerConnected: string;
        ws: string;
        rtc: string;
        chatEmpty: string;
        navHome: string;
        navBlog: string;
        toastCopied: string;
        toastMessageCopied: string;
        copyMessage: string;
        sendingImage: string;
        connectionSuccess: string;
        connectionFailed: string;
        connectionDisconnected: string;
        trust: { title: string; desc: string }[];
        signaling: {
            notReady: string;
            p2pFailed: string;
            startFailed: string;
            transferLost: string;
            transferRetryFailed: string;
            fileTooLarge: string;
            largeFileConfirm: string;
            largeFileConfirmTitle: string;
            largeFileConfirmContinueText: string;
            largeFileConfirmCancelText: string;
            acceptFailed: string;
            peerDisconnected: string;
            rejected: string;
            error: string;
            targetNotFound: string;
            networkSelfBlocked: string;
            networkPeerBlocked: string;
            networkBothLimited: string;
            networkLimited: string;
            networkReason_no_udp: string;
            networkReason_symmetric_nat: string;
            networkReason_turn_blocked: string;
            networkReason_ice_failed: string;
            networkReason_checking_timeout: string;
        };
    };
    language: string;
}

export const translations: Record<string, Translations> = {
    zh: {
        title: "WebDrop",
        subtitle: "浏览器内 P2P 传文件与聊天，数据不经服务器存储。",
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
            placeholder: "输入 6 位码",
            connect: "连接",
            disconnect: "断开",
            waiting: "等待连接...",
            enterUid: "请输入UID",
            debugInfo: "调试信息: WebSocket: {wsStatus}, 目标ID: {targetId}, 按钮状态: {buttonStatus}",
            scanQR: "扫描",
            scanSuccess: "二维码扫描成功",
            scanSuccessToast: "二维码扫描成功！",
        },
        chat: {
            title: "💬 实时聊天 & 📁 文件传输",
            description: "支持端到端加密的文本消息发送和P2P文件传输",
            noMessages: "暂无消息...",
            placeholder: "输入消息或粘贴图片...",
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
            description: "快速开始使用WebDrop进行隐私安全的文件传输和聊天",
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
        qrScanner: {
            title: "扫描二维码",
            description: "将二维码对准摄像头进行扫描",
            cameraDenied: "摄像头权限被拒绝，请允许访问摄像头",
            cameraNotFound: "未找到摄像头设备",
            cameraFailed: "摄像头访问失败，请检查权限设置",
            browserNotSupported: "您的浏览器不支持摄像头访问",
            httpsRequiredMobile: "移动端需要 HTTPS 才能访问摄像头，请使用 HTTPS 链接",
            httpsRequired: "需要 HTTPS 环境才能访问摄像头",
            permissionHintMobile: "需要摄像头权限才能开始扫描（移动端请确保使用 HTTPS）",
            permissionHint: "需要摄像头权限才能开始扫描",
            clickToStart: "点击开始扫描",
            requestPermission: "请求权限",
            startScan: "开始扫描",
            stopScan: "停止扫描",
            close: "关闭",
            deviceNotSupported: "您的设备不支持摄像头访问",
            cameraInUse: "摄像头被其他应用占用",
            cameraError: "摄像头访问失败: {message}",
        },
        footer: {
            allRightsReserved: "保留所有权利",
            privacyPolicy: "隐私政策",
            termsOfService: "服务条款",
            copyright: "版权声明",
        },
        workspace: {
            copy: "复制",
            trustTitle: "为何值得信任",
            chatTitle: "传输与对话",
            step1: "Step 1",
            step2: "Step 2",
            peerConnected: "已与",
            ws: "信令",
            rtc: "P2P",
            chatEmpty: "连接成功后，消息与文件将在此出现",
            navHome: "首页",
            navBlog: "博客",
            toastCopied: "连接码已复制",
            toastMessageCopied: "消息已复制",
            copyMessage: "复制消息",
            sendingImage: "正在发送图片...",
            connectionSuccess: "连接成功",
            connectionFailed: "连接失败",
            connectionDisconnected: "连接断开",
            trust: [
                { title: "端到端直连", desc: "WebRTC 点对点，文件不落地第三方" },
                { title: "无大小限制", desc: "速度取决于双方网络，而非云端配额" },
                { title: "零安装", desc: "打开链接即可用，跨设备浏览器" },
            ],
            signaling: {
                notReady: "连接未就绪，请等待 P2P 建立后再操作",
                p2pFailed: "P2P 连接失败，请重试",
                startFailed: "无法发起连接",
                transferLost: "文件传输中断，连接已断开",
                transferRetryFailed: "文件传输失败：网络不稳定，已多次重试仍未成功",
                fileTooLarge: "文件太大了（最大 100MB）",
                largeFileConfirm: "文件较大（{sizeMB}MB），传输可能需要约 {minutes} 分钟，且在弱网下可能失败。是否继续？",
                largeFileConfirmTitle: "大文件传输提示",
                largeFileConfirmContinueText: "继续发送",
                largeFileConfirmCancelText: "取消",
                acceptFailed: "接受连接失败",
                peerDisconnected: "对方已断开连接",
                rejected: "对方拒绝了连接请求",
                error: "信令错误",
                targetNotFound: "对方不在线或 UID 不正确",
                networkSelfBlocked: "你的网络可能无法建立 WebRTC 连接（{detail}）",
                networkPeerBlocked: "对方网络可能无法建立 WebRTC 连接（{detail}）",
                networkBothLimited: "双方网络都可能受限，建议在更开放的网络环境下重试",
                networkLimited: "当前网络受限，WebRTC 连接可能不稳定",
                networkReason_no_udp: "未收集到 ICE 候选，UDP 可能被阻断",
                networkReason_symmetric_nat: "对称型 NAT，无法获取公网地址",
                networkReason_turn_blocked: "TURN 中继不可达",
                networkReason_ice_failed: "ICE 协商失败",
                networkReason_checking_timeout: "连接检查超时",
            },
        },
        language: "语言",
    },
    en: {
        title: "WebDrop",
        subtitle: "P2P file transfer and chat in the browser. Nothing stored on our servers.",
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
            placeholder: "6-character code",
            connect: "Connect",
            disconnect: "Disconnect",
            waiting: "Waiting for connection...",
            enterUid: "Please enter UID",
            debugInfo: "Debug info: WebSocket: {wsStatus}, Target ID: {targetId}, Button status: {buttonStatus}",
            scanQR: "Scan",
            scanSuccess: "QR code scanned successfully",
            scanSuccessToast: "QR code scanned successfully!",
        },
        chat: {
            title: "💬 Real-time Chat & 📁 File Transfer",
            description: "End-to-end encrypted text messaging and P2P file transfer",
            noMessages: "No messages yet...",
            placeholder: "Type a message or paste an image...",
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
        qrScanner: {
            title: "Scan QR Code",
            description: "Point your camera at the QR code to scan",
            cameraDenied: "Camera permission denied. Please allow camera access.",
            cameraNotFound: "No camera device found",
            cameraFailed: "Camera access failed. Check permission settings.",
            browserNotSupported: "Your browser does not support camera access",
            httpsRequiredMobile: "HTTPS is required for camera access on mobile. Use an HTTPS link.",
            httpsRequired: "HTTPS is required for camera access",
            permissionHintMobile: "Camera permission is required to scan (use HTTPS on mobile)",
            permissionHint: "Camera permission is required to scan",
            clickToStart: "Tap to start scanning",
            requestPermission: "Request permission",
            startScan: "Start scanning",
            stopScan: "Stop scanning",
            close: "Close",
            deviceNotSupported: "Your device does not support camera access",
            cameraInUse: "Camera is in use by another app",
            cameraError: "Camera access failed: {message}",
        },
        footer: {
            allRightsReserved: "All rights reserved",
            privacyPolicy: "Privacy Policy",
            termsOfService: "Terms of Service",
            copyright: "Copyright",
        },
        workspace: {
            copy: "Copy",
            trustTitle: "Why trust WebDrop",
            chatTitle: "Transfer & chat",
            step1: "Step 1",
            step2: "Step 2",
            peerConnected: "Connected to",
            ws: "Signaling",
            rtc: "P2P",
            chatEmpty: "Messages and files appear here once connected",
            navHome: "Home",
            navBlog: "Blog",
            toastCopied: "Code copied",
            toastMessageCopied: "Message copied",
            copyMessage: "Copy message",
            sendingImage: "Sending image...",
            connectionSuccess: "Connection successful",
            connectionFailed: "Connection failed",
            connectionDisconnected: "Connection disconnected",
            trust: [
                { title: "Direct P2P", desc: "WebRTC peer-to-peer, no third-party file storage" },
                { title: "No size cap", desc: "Speed follows your network, not cloud quotas" },
                { title: "No install", desc: "Open a link in any modern browser" },
            ],
            signaling: {
                notReady: "Connection not ready. Wait until P2P is connected.",
                p2pFailed: "P2P connection failed. Try reconnecting.",
                startFailed: "Failed to start connection.",
                transferLost: "File transfer interrupted — connection lost.",
                transferRetryFailed: "File transfer failed after multiple retries.",
                fileTooLarge: "File is too large (max 100MB).",
                largeFileConfirm: "This file is large ({sizeMB}MB). Transfer may take about {minutes} minute(s) and can fail on weak networks. Continue?",
                largeFileConfirmTitle: "Large file transfer",
                largeFileConfirmContinueText: "Continue",
                largeFileConfirmCancelText: "Cancel",
                acceptFailed: "Failed to accept connection.",
                peerDisconnected: "Peer disconnected.",
                rejected: "Connection request was rejected.",
                error: "Signaling error",
                targetNotFound: "Peer is offline or UID is incorrect.",
                networkSelfBlocked: "Your network may be unable to establish WebRTC ({detail})",
                networkPeerBlocked: "The peer's network may be unable to establish WebRTC ({detail})",
                networkBothLimited: "Both networks may be restricted. Try a more open network.",
                networkLimited: "Your network is restricted; WebRTC may be unstable.",
                networkReason_no_udp: "No ICE candidates gathered; UDP may be blocked",
                networkReason_symmetric_nat: "Symmetric NAT; no public address",
                networkReason_turn_blocked: "TURN relay unreachable",
                networkReason_ice_failed: "ICE negotiation failed",
                networkReason_checking_timeout: "Connection check timed out",
            },
        },
        language: "Language",
    },
    es: {
        title: "WebDrop",
        subtitle: "Transferencia segura de archivos P2P y chat en tiempo real",
        features: {
            privacy: "🔒 Privacidad y Seguridad",
            privacyDesc: "Cifrado de extremo a extremo",
            fileTransfer: "📁 Transferencia",
            fileTransferDesc: "Transferencia directa P2P",
            chat: "💬 Chat en vivo",
            chatDesc: "Mensajería instantánea",
            fastTransfer: "⚡ Rápido",
            fastTransferDesc: "Sin servidor intermedio",
        },
        securityFeatures: {
            title: "🔐 Características de Privacidad y Seguridad",
            endToEnd: "Protección con cifrado de extremo a extremo",
            p2pDirect: "Conexión directa P2P, sin servidor intermedio",
            noServer: "Los datos no pasan por servidores de terceros",
        },
        connectionStatus: {
            title: "Estado de Conexión",
            websocket: "Conexión WebSocket:",
            webrtc: "Conexión WebRTC:",
            connected: "Conectado",
            disconnected: "Desconectado",
            reconnect: "Reconectar",
        },
        myUid: {
            title: "Mi ID de Usuario (UID)",
            description: "Comparte este código de 6 dígitos con otros para conectar",
            getting: "Obteniendo...",
            scanToConnect: "Escanear para conectar",
        },
        connectToPeer: {
            title: "Conectar con Usuario",
            description: "Introduce el UID del otro usuario para establecer conexión P2P",
            placeholder: "UID del usuario (ej: ABC123)",
            connect: "Conectar",
            disconnect: "Desconectar",
            waiting: "Esperando conexión...",
            enterUid: "Por favor introduce el UID",
            debugInfo: "Info depuración: WebSocket: {wsStatus}, ID Destino: {targetId}, Estado botón: {buttonStatus}",
            scanQR: "Escanear",
            scanSuccess: "Código QR escaneado con éxito",
            scanSuccessToast: "¡Código QR escaneado con éxito!",
        },
        chat: {
            title: "💬 Chat y 📁 Transferencia",
            description: "Mensajería de texto cifrada de extremo a extremo y transferencia de archivos P2P",
            noMessages: "No hay mensajes...",
            placeholder: "Escribe un mensaje o pega una imagen...",
            send: "Enviar",
            fileSize: "Tamaño: {size} KB",
        },
        fileTransfer: {
            title: "Transferencia de Archivos",
            download: "Descargar",
            size: "Tamaño: {size} KB",
        },
        instructions: {
            title: "📖 Instrucciones",
            description: "Guía de inicio rápido para transferencia de archivos y chat privado",
            quickStart: "🚀 Inicio Rápido",
            steps: [
                "Asegúrate de que la conexión WebSocket es normal (muestra 'Conectado')",
                "Copia tu UID y compártelo con otros",
                "Introduce el UID del otro usuario y haz clic en 'Conectar'",
                "Comienza a enviar mensajes y archivos tras la conexión exitosa",
            ],
            coreFeatures: "✨ Características Principales",
            features: {
                realtimeChat: "💬 Chat en Tiempo Real",
                realtimeChatDesc: "Mensajería de texto instantánea con cifrado de extremo a extremo",
                fileTransfer: "📁 Transferencia de Archivos",
                fileTransferDesc: "Transferencia directa P2P, soporta archivos grandes con visualización de progreso",
                privacy: "🔒 Privacidad y Seguridad",
                privacyDesc: "Tecnología WebRTC, los datos no pasan por servidores de terceros",
                fastTransfer: "⚡ Transferencia Rápida",
                fastTransferDesc: "Sin servidor intermedio, velocidad de transferencia más rápida",
            },
            security: "🔐 Notas de Seguridad",
            securityPoints: [
                "Toda la transmisión de datos utiliza cifrado de extremo a extremo",
                "La transferencia de archivos usa canales de datos WebRTC, sin servidores",
                "Los mensajes de chat se cifran en tiempo real para proteger la privacidad",
                "Soporta transferencia de archivos de cualquier tamaño sin límites",
            ],
        },
        offerConfirm: {
            title: "Solicitud de Conexión",
            description: "El usuario {from} solicita conectar contigo. ¿Aceptar?",
            accept: "Aceptar",
            reject: "Rechazar",
        },
        qrScanner: {
            title: "Escanear código QR",
            description: "Apunta la cámara al código QR para escanear",
            cameraDenied: "Permiso de cámara denegado. Permite el acceso a la cámara.",
            cameraNotFound: "No se encontró ninguna cámara",
            cameraFailed: "Error al acceder a la cámara. Revisa los permisos.",
            browserNotSupported: "Tu navegador no admite acceso a la cámara",
            httpsRequiredMobile: "Se requiere HTTPS para usar la cámara en móvil. Usa un enlace HTTPS.",
            httpsRequired: "Se requiere HTTPS para acceder a la cámara",
            permissionHintMobile: "Se necesita permiso de cámara para escanear (usa HTTPS en móvil)",
            permissionHint: "Se necesita permiso de cámara para escanear",
            clickToStart: "Toca para empezar a escanear",
            requestPermission: "Solicitar permiso",
            startScan: "Empezar escaneo",
            stopScan: "Detener escaneo",
            close: "Cerrar",
            deviceNotSupported: "Tu dispositivo no admite acceso a la cámara",
            cameraInUse: "La cámara está en uso por otra aplicación",
            cameraError: "Error de cámara: {message}",
        },
        footer: {
            allRightsReserved: "Todos los derechos reservados",
            privacyPolicy: "Política de Privacidad",
            termsOfService: "Términos de Servicio",
            copyright: "Derechos de Autor",
        },
        workspace: {
            copy: "Copiar",
            trustTitle: "Por qué confiar",
            chatTitle: "Transferir y chatear",
            step1: "Paso 1",
            step2: "Paso 2",
            peerConnected: "Conectado a",
            ws: "Señal",
            rtc: "P2P",
            chatEmpty: "Los mensajes y archivos aparecerán aquí al conectar",
            navHome: "Inicio",
            navBlog: "Blog",
            toastCopied: "Código copiado",
            toastMessageCopied: "Mensaje copiado",
            copyMessage: "Copiar mensaje",
            sendingImage: "Enviando imagen...",
            connectionSuccess: "Conexión exitosa",
            connectionFailed: "Conexión fallida",
            connectionDisconnected: "Conexión desconectada",
            trust: [
                { title: "P2P directo", desc: "WebRTC punto a punto, sin almacenamiento en terceros" },
                { title: "Sin límite de tamaño", desc: "La velocidad depende de tu red, no de cuotas en la nube" },
                { title: "Sin instalación", desc: "Abre un enlace en cualquier navegador moderno" },
            ],
            signaling: {
                notReady: "Conexión no lista. Espera a que se establezca el P2P.",
                p2pFailed: "Falló la conexión P2P. Intenta de nuevo.",
                startFailed: "No se pudo iniciar la conexión.",
                transferLost: "Transferencia interrumpida — conexión perdida.",
                transferRetryFailed: "La transferencia falló tras varios reintentos.",
                fileTooLarge: "El archivo es demasiado grande (máx. 100MB).",
                largeFileConfirm: "Este archivo es grande ({sizeMB}MB). La transferencia puede tardar unos {minutes} minuto(s) y fallar con red inestable. ¿Continuar?",
                largeFileConfirmTitle: "Transferencia de archivo grande",
                largeFileConfirmContinueText: "Continuar",
                largeFileConfirmCancelText: "Cancelar",
                acceptFailed: "No se pudo aceptar la conexión.",
                peerDisconnected: "El otro usuario se desconectó.",
                rejected: "La solicitud de conexión fue rechazada.",
                error: "Error de señalización",
                targetNotFound: "El usuario no está en línea o el UID es incorrecto.",
                networkSelfBlocked: "Tu red puede no poder establecer WebRTC ({detail})",
                networkPeerBlocked: "La red del otro usuario puede no poder establecer WebRTC ({detail})",
                networkBothLimited: "Ambas redes pueden estar restringidas. Prueba una red más abierta.",
                networkLimited: "Tu red está restringida; WebRTC puede ser inestable.",
                networkReason_no_udp: "Sin candidatos ICE; UDP puede estar bloqueado",
                networkReason_symmetric_nat: "NAT simétrico; sin dirección pública",
                networkReason_turn_blocked: "Relay TURN inaccesible",
                networkReason_ice_failed: "Falló la negociación ICE",
                networkReason_checking_timeout: "Tiempo de espera de conexión agotado",
            },
        },
        language: "Idioma",
    },
    ru: {
        title: "WebDrop",
        subtitle: "Безопасная P2P передача файлов и чат",
        features: {
            privacy: "🔒 Приватность",
            privacyDesc: "Сквозное шифрование",
            fileTransfer: "📁 Файлы",
            fileTransferDesc: "Прямая P2P передача",
            chat: "💬 Чат",
            chatDesc: "Мгновенные сообщения",
            fastTransfer: "⚡ Скорость",
            fastTransferDesc: "Без серверов",
        },
        securityFeatures: {
            title: "🔐 Особенности безопасности",
            endToEnd: "Защита сквозным шифрованием",
            p2pDirect: "Прямое P2P соединение, без посредников",
            noServer: "Данные не проходят через сторонние серверы",
        },
        connectionStatus: {
            title: "Статус соединения",
            websocket: "WebSocket:",
            webrtc: "WebRTC:",
            connected: "Подключено",
            disconnected: "Отключено",
            reconnect: "Переподключить",
        },
        myUid: {
            title: "Мой ID (UID)",
            description: "Поделитесь этим 6-значным кодом для подключения",
            getting: "Получение...",
            scanToConnect: "Сканировать для подключения",
        },
        connectToPeer: {
            title: "Подключение",
            description: "Введите UID собеседника для P2P соединения",
            placeholder: "Введите UID (напр. ABC123)",
            connect: "Подключить",
            disconnect: "Отключить",
            waiting: "Ожидание подключения...",
            enterUid: "Введите UID",
            debugInfo: "Отладка: WebSocket: {wsStatus}, Target ID: {targetId}, Button: {buttonStatus}",
            scanQR: "Сканировать",
            scanSuccess: "QR-код успешно сканирован",
            scanSuccessToast: "QR-код успешно сканирован!",
        },
        chat: {
            title: "💬 Чат и 📁 Файлы",
            description: "Текстовые сообщения и файлы с шифрованием",
            noMessages: "Нет сообщений...",
            placeholder: "Введите сообщение или вставьте изображение...",
            send: "Отправить",
            fileSize: "Размер: {size} КБ",
        },
        fileTransfer: {
            title: "Передача файлов",
            download: "Скачать",
            size: "Размер: {size} КБ",
        },
        instructions: {
            title: "📖 Инструкция",
            description: "Быстрый старт для безопасной передачи файлов",
            quickStart: "🚀 Быстрый старт",
            steps: [
                "Убедитесь, что WebSocket подключен (статус 'Подключено')",
                "Скопируйте свой UID и отправьте собеседнику",
                "Введите UID собеседника и нажмите 'Подключить'",
                "После подключения можно отправлять файлы и сообщения",
            ],
            coreFeatures: "✨ Основные возможности",
            features: {
                realtimeChat: "💬 Чат в реальном времени",
                realtimeChatDesc: "Мгновенные сообщения со сквозным шифрованием",
                fileTransfer: "📁 Передача файлов",
                fileTransferDesc: "Прямая P2P передача больших файлов с прогрессом",
                privacy: "🔒 Приватность и защита",
                privacyDesc: "Технология WebRTC, без сторонних серверов",
                fastTransfer: "⚡ Быстрая передача",
                fastTransferDesc: "Без промежуточных серверов, максимальная скорость",
            },
            security: "🔐 О безопасности",
            securityPoints: [
                "Все данные защищены сквозным шифрованием",
                "Файлы передаются через WebRTC напрямую между устройствами",
                "Сообщения чата шифруются в реальном времени",
                "Поддержка передачи файлов любого размера",
            ],
        },
        offerConfirm: {
            title: "Запрос подключения",
            description: "Пользователь {from} хочет подключиться. Принять?",
            accept: "Принять",
            reject: "Отклонить",
        },
        qrScanner: {
            title: "Сканировать QR-код",
            description: "Наведите камеру на QR-код для сканирования",
            cameraDenied: "Доступ к камере запрещён. Разрешите использование камеры.",
            cameraNotFound: "Камера не найдена",
            cameraFailed: "Не удалось получить доступ к камере. Проверьте разрешения.",
            browserNotSupported: "Ваш браузер не поддерживает доступ к камере",
            httpsRequiredMobile: "Для камеры на мобильном нужен HTTPS. Используйте HTTPS-ссылку.",
            httpsRequired: "Для доступа к камере требуется HTTPS",
            permissionHintMobile: "Для сканирования нужен доступ к камере (на мобильном — HTTPS)",
            permissionHint: "Для сканирования нужен доступ к камере",
            clickToStart: "Нажмите, чтобы начать сканирование",
            requestPermission: "Запросить разрешение",
            startScan: "Начать сканирование",
            stopScan: "Остановить сканирование",
            close: "Закрыть",
            deviceNotSupported: "Ваше устройство не поддерживает доступ к камере",
            cameraInUse: "Камера используется другим приложением",
            cameraError: "Ошибка камеры: {message}",
        },
        footer: {
            allRightsReserved: "Все права защищены",
            privacyPolicy: "Политика конфиденциальности",
            termsOfService: "Условия использования",
            copyright: "Авторские права",
        },
        workspace: {
            copy: "Копировать",
            trustTitle: "Почему нам доверяют",
            chatTitle: "Передача и чат",
            step1: "Шаг 1",
            step2: "Шаг 2",
            peerConnected: "Подключено к",
            ws: "Сигнал",
            rtc: "P2P",
            chatEmpty: "Сообщения и файлы появятся здесь после подключения",
            navHome: "Главная",
            navBlog: "Блог",
            toastCopied: "Код скопирован",
            toastMessageCopied: "Сообщение скопировано",
            copyMessage: "Копировать сообщение",
            sendingImage: "Отправка изображения...",
            connectionSuccess: "Подключено",
            connectionFailed: "Ошибка подключения",
            connectionDisconnected: "Отключено",
            trust: [
                { title: "Прямой P2P", desc: "WebRTC напрямую, без хранения на сторонних серверах" },
                { title: "Без лимита размера", desc: "Скорость зависит от вашей сети, а не от облачных квот" },
                { title: "Без установки", desc: "Откройте ссылку в любом современном браузере" },
            ],
            signaling: {
                notReady: "Соединение не готово. Дождитесь установки P2P.",
                p2pFailed: "P2P-соединение не удалось. Попробуйте снова.",
                startFailed: "Не удалось начать подключение.",
                transferLost: "Передача прервана — соединение потеряно.",
                transferRetryFailed: "Передача не удалась после нескольких повторных попыток.",
                fileTooLarge: "Файл слишком большой (максимум 100MB).",
                largeFileConfirm: "Файл большой ({sizeMB}MB). Передача может занять около {minutes} мин. и при слабой сети завершиться ошибкой. Продолжить?",
                largeFileConfirmTitle: "Передача большого файла",
                largeFileConfirmContinueText: "Продолжить",
                largeFileConfirmCancelText: "Отмена",
                acceptFailed: "Не удалось принять подключение.",
                peerDisconnected: "Собеседник отключился.",
                rejected: "Запрос на подключение отклонён.",
                error: "Ошибка сигнализации",
                targetNotFound: "Пользователь не в сети или неверный UID.",
                networkSelfBlocked: "Ваша сеть может не поддерживать WebRTC ({detail})",
                networkPeerBlocked: "Сеть собеседника может не поддерживать WebRTC ({detail})",
                networkBothLimited: "Обе сети могут быть ограничены. Попробуйте более открытую сеть.",
                networkLimited: "Сеть ограничена; WebRTC может быть нестабильным.",
                networkReason_no_udp: "Нет ICE-кандидатов; UDP может быть заблокирован",
                networkReason_symmetric_nat: "Симметричный NAT; нет публичного адреса",
                networkReason_turn_blocked: "TURN-релей недоступен",
                networkReason_ice_failed: "Сбой согласования ICE",
                networkReason_checking_timeout: "Таймаут проверки соединения",
            },
        },
        language: "Язык",
    },
};

export const getBrowserLanguage = (): string => {
    const language = navigator.language || navigator.languages?.[0] || 'en';
    // 支持中文、西班牙语、俄语检测
    if (language.startsWith('zh')) return 'zh';
    if (language.startsWith('es')) return 'es';
    if (language.startsWith('ru')) return 'ru';
    return 'en';
};

export const formatMessage = (message: string, params: Record<string, string | number> = {}): string => {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key]?.toString() || match;
    });
};
