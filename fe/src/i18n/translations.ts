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
    footer: {
        allRightsReserved: string;
        privacyPolicy: string;
        termsOfService: string;
        copyright: string;
    };
    language: string;
}

export const translations: Record<string, Translations> = {
    zh: {
        title: "WebDrop",
        subtitle: "安全的P2P文件传输与实时聊天",
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
            scanQR: "扫描",
            scanSuccess: "二维码扫描成功",
            scanSuccessToast: "二维码扫描成功！",
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
        footer: {
            allRightsReserved: "保留所有权利",
            privacyPolicy: "隐私政策",
            termsOfService: "服务条款",
            copyright: "版权声明",
        },
        language: "语言",
    },
    en: {
        title: "WebDrop",
        subtitle: "Secure P2P file transfer & real-time chat",
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
            scanQR: "Scan",
            scanSuccess: "QR code scanned successfully",
            scanSuccessToast: "QR code scanned successfully!",
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
        footer: {
            allRightsReserved: "All rights reserved",
            privacyPolicy: "Privacy Policy",
            termsOfService: "Terms of Service",
            copyright: "Copyright",
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
            placeholder: "Escribe un mensaje...",
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
        footer: {
            allRightsReserved: "Todos los derechos reservados",
            privacyPolicy: "Política de Privacidad",
            termsOfService: "Términos de Servicio",
            copyright: "Derechos de Autor",
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
            placeholder: "Введите сообщение...",
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
        footer: {
            allRightsReserved: "Все права защищены",
            privacyPolicy: "Политика конфиденциальности",
            termsOfService: "Условия использования",
            copyright: "Авторские права",
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
