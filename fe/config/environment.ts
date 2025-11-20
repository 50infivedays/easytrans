// 环境配置文件
// 用于区分开发和生产环境，确保生产环境不包含调试代码

// Helper function to check if running in browser
const isBrowser = () => typeof window !== 'undefined';

// Helper function to check if localhost
const checkIsLocalhost = () => {
    if (!isBrowser()) return false;
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
};

export const ENV = {
    // 是否为开发环境
    isDevelopment: process.env.NODE_ENV === 'development',

    // 是否为本地开发（只在客户端检查）
    get isLocalhost() {
        return checkIsLocalhost();
    },

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
        baseUrl: process.env.NODE_ENV === 'development' ? '' : 'https://api.webdrop.online',
        wsUrl: 'wss://api.webdrop.online/ws',
        healthCheck: process.env.NODE_ENV === 'development' ? '/health' : 'https://api.webdrop.online/health',
        debugUsers: process.env.NODE_ENV === 'development' ? '/debug/users' : 'https://api.webdrop.online/debug/users'
    }
};

// 开发环境专用配置
export const DEV_CONFIG = {
    // 仅在开发环境启用的功能
    enableConsoleLogs: ENV.isDevelopment,
    enablePerformanceMonitoring: ENV.isDevelopment,
    enableErrorBoundary: ENV.isDevelopment,

    // 开发环境调试信息
    get debugInfo() {
        if (!ENV.isDevelopment) return null;
        return {
            apiBaseUrl: ENV.api.baseUrl,
            wsUrl: ENV.api.wsUrl,
            environment: ENV.nodeEnv,
            hostname: isBrowser() ? window.location.hostname : 'server'
        };
    }
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

