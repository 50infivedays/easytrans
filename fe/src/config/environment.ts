// 环境配置文件
// 用于区分开发和生产环境，确保生产环境不包含调试代码

export const ENV = {
    // 是否为开发环境
    isDevelopment: process.env.NODE_ENV === 'development',

    // 是否为本地开发
    isLocalhost: typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    ),

    // 是否为生产环境
    isProduction: process.env.NODE_ENV === 'production',

    // 当前环境
    nodeEnv: process.env.NODE_ENV || 'development',

    // 是否启用调试功能（仅开发环境）
    enableDebug: process.env.NODE_ENV === 'development',

    // 是否启用详细日志（仅开发环境）
    enableVerboseLogging: process.env.NODE_ENV === 'development',

    // API配置
    api: {
        baseUrl: process.env.NODE_ENV === 'development' ? '' : 'https://api.eztrans.online',
        wsUrl: 'wss://api.eztrans.online/ws',
        healthCheck: process.env.NODE_ENV === 'development' ? '/health' : 'https://api.eztrans.online/health',
        debugUsers: process.env.NODE_ENV === 'development' ? '/debug/users' : 'https://api.eztrans.online/debug/users'
    }
};

// 开发环境专用配置
export const DEV_CONFIG = {
    // 仅在开发环境启用的功能
    enableConsoleLogs: ENV.isDevelopment,
    enablePerformanceMonitoring: ENV.isDevelopment,
    enableErrorBoundary: ENV.isDevelopment,

    // 开发环境调试信息
    debugInfo: ENV.isDevelopment ? {
        apiBaseUrl: ENV.api.baseUrl,
        wsUrl: ENV.api.wsUrl,
        environment: ENV.nodeEnv,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    } : null
};

// 生产环境配置
export const PROD_CONFIG = {
    // 生产环境优化
    enableConsoleLogs: false,
    enablePerformanceMonitoring: false,
    enableErrorBoundary: true,

    // 生产环境安全设置
    security: {
        enableCSP: true,
        enableHSTS: true,
        enableXSSProtection: true
    }
};

// 导出当前环境的配置
export const getCurrentConfig = () => {
    return ENV.isDevelopment ? DEV_CONFIG : PROD_CONFIG;
}; 