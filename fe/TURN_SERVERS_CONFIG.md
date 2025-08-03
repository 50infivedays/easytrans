# TURN服务器配置

## 概述

EasyTrans应用已配置了多组TURN服务器，用于在NAT穿透失败时提供中继服务，确保WebRTC连接的成功建立。

## 当前配置的服务器

### STUN服务器（用于NAT穿透）
1. **Cloudflare STUN** - `stun:stun.cloudflare.com:3478`
2. **小米WiFi STUN** - `stun:stun.miwifi.com:3478`
3. **Google STUN** - `stun:stun.l.google.com:19302`
4. **VoIP STUN** - `stun:stun.voipbuster.com`
5. **VoIP STUN** - `stun:stun.voipstunt.com`

### TURN服务器（用于中继）
1. **TURN服务器1**
   - 地址：`turn:turn.bqrdh.com`
   - 用户名：`chenzw`
   - 密码：`otary@1990`

2. **TURN服务器2**
   - 地址：`turn:43.138.235.180:9002`
   - 用户名：`dfs`
   - 密码：`mypwd`

## 配置详情

### WebRTC配置
```javascript
const rtcConfig: RTCConfiguration = {
    iceServers: [
        // STUN服务器
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.miwifi.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.voipbuster.com' },
        { urls: 'stun:stun.voipstunt.com' },

        // TURN服务器
        {
            urls: ["turn:turn.bqrdh.com"],
            username: "chenzw",
            credential: "otary@1990"
        },
        {
            urls: ["turn:43.138.235.180:9002"],
            username: "dfs",
            credential: "mypwd"
        },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'balanced',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: 'all',
};
```

## 工作原理

### 1. STUN服务器
- **作用**：帮助发现公网IP地址
- **优先级**：首先尝试STUN服务器
- **优势**：免费、无需认证
- **限制**：只能发现IP，不能中继数据

### 2. TURN服务器
- **作用**：在NAT穿透失败时提供中继服务
- **优先级**：STUN失败后使用
- **优势**：可以中继数据，确保连接成功
- **限制**：需要认证，有带宽限制

### 3. 连接流程
1. **尝试STUN**：首先使用STUN服务器发现公网IP
2. **直接连接**：尝试建立P2P连接
3. **TURN中继**：如果P2P失败，使用TURN服务器中继
4. **多服务器**：按优先级尝试不同的服务器

## 性能优化

### 1. 服务器优先级
- STUN服务器优先（免费、快速）
- TURN服务器备用（付费、可靠）

### 2. 连接策略
- `iceTransportPolicy: 'all'`：允许所有类型的ICE候选
- `iceCandidatePoolSize: 10`：生成更多ICE候选
- `bundlePolicy: 'balanced'`：平衡的捆绑策略

### 3. 错误处理
- 自动重试不同的服务器
- 详细的ICE候选日志
- 连接状态监控

## 安全考虑

### 1. 认证信息
- TURN服务器需要用户名和密码
- 认证信息已硬编码在配置中
- 生产环境建议使用动态认证

### 2. 数据安全
- WebRTC使用DTLS加密
- TURN服务器只中继加密数据
- 不会泄露实际通信内容

## 监控和调试

### 1. 控制台日志
```javascript
console.log('ICE Candidate generated:', {
    type: event.candidate.type,
    address: event.candidate.address,
    port: event.candidate.port,
    protocol: event.candidate.protocol,
    candidate: event.candidate.candidate,
    target: currentTargetRef.current
});
```

### 2. 连接状态
- `iceConnectionState`：ICE连接状态
- `connectionState`：整体连接状态
- `iceGatheringState`：ICE候选收集状态

## 故障排除

### 1. 连接失败
- 检查网络环境
- 查看控制台错误日志
- 确认TURN服务器可用性

### 2. 性能问题
- 监控ICE候选数量
- 检查连接延迟
- 优化服务器配置

### 3. 安全警告
- 定期更新认证信息
- 监控异常连接
- 实施访问控制

## 扩展建议

### 1. 动态配置
- 从服务器获取TURN配置
- 支持运行时更新
- 实现负载均衡

### 2. 监控系统
- 连接成功率统计
- 服务器性能监控
- 用户反馈收集

### 3. 备用方案
- 添加更多TURN服务器
- 实现自动故障转移
- 提供降级方案 