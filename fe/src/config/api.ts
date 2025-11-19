// API配置文件
// 统一使用线上后端，通过代理解决跨域问题

import { ENV } from './environment';

// API基础URL - 开发环境使用代理，生产环境直接访问
export const API_BASE_URL = ENV.isDevelopment && ENV.isLocalhost
    ? '' // 开发环境使用代理
    : 'https://api.webdrop.online';

// WebSocket URL - 统一使用线上WebSocket
export const getWebSocketURL = (): string => {
    return 'wss://api.webdrop.online/ws';
};

// 健康检查API
export const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;

// 调试API
export const DEBUG_USERS_URL = ENV.isDevelopment && ENV.isLocalhost
    ? '/debug/users'
    : 'https://api.webdrop.online/debug/users';

// 环境信息
export const ENV_INFO = {
    isDevelopment: ENV.isDevelopment,
    isLocalhost: ENV.isLocalhost,
    nodeEnv: ENV.nodeEnv,
    apiBaseUrl: API_BASE_URL,
    wsUrl: getWebSocketURL()
}; 