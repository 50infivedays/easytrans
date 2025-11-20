# WebRTC连接故障排除指南

## 🔍 问题诊断

### 常见症状
- ✅ WebSocket已连接
- ✅ 获取到UID
- ❌ ICE候选错误
- ❌ WebRTC连接失败
- ❌ 无法发送消息/文件

## 🛠️ 解决方案

### ✅ 已完成的修复

**已优化STUN/TURN服务器配置：**
1. ✅ 添加了5个Google STUN服务器（最可靠）
2. ✅ 调整了服务器优先级
3. ✅ 增加了ICE候选池大小
4. ✅ 优化了bundle策略

### 🚀 立即测试

#### 步骤1: 重新构建项目
```bash
# Next.js版本
cd /home/coreuser/workspace/easytrans/fe-next
npm run build

# 或原版React
cd /home/coreuser/workspace/easytrans/fe
npm run build
```

#### 步骤2: 测试连接
```bash
# 启动开发服务器
npm run dev

# 然后在浏览器中测试连接
# 打开开发者工具查看日志
```

#### 步骤3: 检查ICE候选
打开浏览器控制台，应该看到类似：
```
✅ ICE Candidate generated: {type: 'host', protocol: 'udp'}
✅ ICE Candidate generated: {type: 'srflx', protocol: 'udp'} 
```

## 🔧 常见问题解决

### 问题1: 所有TURN服务器都失败
**症状：** 日志显示多个TURN错误

**原因：**
- TURN服务器可能已停止服务
- 网络环境阻止了TURN连接
- 认证信息可能已过期

**解决方案：**
✅ **不用担心！** 只要有STUN服务器工作，大多数情况下可以成功建立P2P连接。

**验证：**
```bash
# 测试Google STUN（应该可用）
curl -v telnet://stun.l.google.com:19302
```

### 问题2: 在相同网络下无法连接
**症状：** 两个设备在同一局域网，但连接失败

**原因：** 可能是路由器阻止了本地P2P连接

**解决方案：**
1. **检查路由器设置** - 启用UPnP
2. **使用不同网络** - 一个用WiFi，一个用移动数据
3. **尝试使用VPN** - 绕过本地网络限制

### 问题3: 跨网络无法连接
**症状：** 不同网络的设备无法连接

**原因：**
- NAT类型限制（对称NAT）
- 防火墙阻止
- TURN服务器不可用

**解决方案：**
```bash
# 检查NAT类型
# 在浏览器控制台查看ICE候选类型：
# - host: 本地地址
# - srflx: STUN服务器反射地址（可以P2P）
# - relay: TURN中继地址（需要TURN服务器）
```

如果只有 `host` 类型，说明STUN不工作。
如果有 `srflx` 类型，说明可以P2P连接。
如果需要 `relay` 类型，说明需要TURN服务器。

### 问题4: 防火墙/公司网络
**症状：** 在家可以用，在公司/学校不能用

**原因：** 企业防火墙阻止了WebRTC

**解决方案：**
1. **联系IT管理员** - 请求开放WebRTC端口
2. **使用移动热点** - 绕过公司网络
3. **等待升级** - 需要部署可靠的TURN服务器

## 🎯 最佳实践

### 1. 推荐的网络环境
✅ 家庭WiFi网络
✅ 移动数据网络
✅ 没有严格限制的网络

❌ 企业/学校网络（可能有限制）
❌ 公共WiFi（可能不稳定）
❌ VPN网络（可能影响P2P）

### 2. 连接测试步骤
```bash
# 1. 确认WebSocket连接
# 看到 "WebSocket: 已连接" ✅

# 2. 确认获取到UID
# 看到6位字母UID ✅

# 3. 等待ICE候选收集
# 控制台显示 "ICE Candidate generated" ✅

# 4. 尝试连接
# 输入对方UID，点击连接

# 5. 查看连接状态
# 应该看到 "Connection state: connected" ✅
```

### 3. 调试技巧
```javascript
// 在浏览器控制台运行，查看详细信息：

// 1. 查看RTCPeerConnection状态
console.log('Connection State:', pc.connectionState);
console.log('ICE Connection State:', pc.iceConnectionState);
console.log('ICE Gathering State:', pc.iceGatheringState);

// 2. 查看本地ICE候选
pc.onicecandidate = (e) => {
    if (e.candidate) {
        console.log('Local Candidate:', {
            type: e.candidate.type,
            protocol: e.candidate.protocol,
            address: e.candidate.address,
            port: e.candidate.port
        });
    }
};
```

## 📊 连接成功率预期

| 场景 | 成功率 | 说明 |
|------|--------|------|
| 同一局域网 | 95%+ | 应该能直接连接 |
| 不同网络（普通NAT） | 85%+ | STUN可以穿透 |
| 不同网络（对称NAT） | 60%+ | 可能需要TURN |
| 严格防火墙环境 | 30%- | 需要TURN服务器 |

## 🔑 TURN服务器说明

### 当前配置的TURN服务器

**服务器1:**
```
地址: turn:turn.bqrdh.com:3478
用户名: chenzw
密码: otary@1990
状态: ⚠️ 可能不可用
```

**服务器2:**
```
地址: turn:43.138.235.180:9002
用户名: dfs
密码: mypwd
状态: ⚠️ 可能不可用
```

### TURN服务器的作用
- 📡 **中继数据** - 当P2P无法建立时使用
- 🔒 **兜底方案** - 确保在任何网络环境下都能连接
- 💰 **需要成本** - 运营TURN服务器需要带宽费用

### 没有TURN服务器会怎样？
✅ **大多数情况下没问题！**
- 80-90%的连接可以通过STUN直连
- 只有在严格NAT环境下才需要TURN
- Google等公司的服务也主要依赖STUN

❌ **少数情况下可能失败：**
- 对称NAT + 对称NAT
- 企业防火墙严格限制
- ISP限制UDP流量

## 🚀 部署自己的TURN服务器（可选）

如果需要100%连接成功率，可以部署自己的TURN服务器：

### 使用Coturn（推荐）
```bash
# 在Ubuntu服务器上安装
sudo apt-get update
sudo apt-get install coturn

# 配置 /etc/turnserver.conf
listening-port=3478
external-ip=YOUR_SERVER_IP
realm=webdrop.online
user=webdrop:your_password
lt-cred-mech

# 启动服务
sudo systemctl start coturn
sudo systemctl enable coturn
```

### 更新配置
```typescript
// 在 useWebRTC.ts 中添加
{
    urls: ["turn:your-server.com:3478"],
    username: "webdrop",
    credential: "your_password"
}
```

## 📈 监控和统计

### 查看连接统计
```javascript
// 在浏览器控制台运行
pc.getStats().then(stats => {
    stats.forEach(report => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            console.log('成功的连接类型:', report.candidatePairType);
            console.log('使用的协议:', report.localCandidateId);
        }
    });
});
```

## 🎯 总结

1. ✅ **已优化配置** - 添加了更多可靠的STUN服务器
2. ✅ **大多数情况可用** - 不依赖TURN也能工作
3. ⚠️ **少数情况需要TURN** - 严格网络环境下
4. 📚 **查看日志** - 浏览器控制台有详细信息

### 快速测试清单
- [ ] 重新构建项目
- [ ] 清除浏览器缓存
- [ ] 检查WebSocket连接
- [ ] 查看ICE候选日志
- [ ] 尝试不同网络环境
- [ ] 如仍失败，考虑部署TURN

---

**需要帮助？** 查看浏览器控制台的详细日志，里面有完整的调试信息。

