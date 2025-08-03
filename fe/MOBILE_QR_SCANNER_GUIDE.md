# 移动端二维码扫描使用指南

## 移动端特殊要求

### 1. HTTPS环境要求
移动端浏览器（iOS Safari、Android Chrome等）要求必须在HTTPS环境下才能访问摄像头。

**解决方案：**
- 使用HTTPS链接访问应用
- 本地开发时可以使用localhost（开发环境例外）

### 2. 权限处理
移动端权限处理与PC端略有不同：

**iOS Safari：**
- 首次使用时会弹出权限请求对话框
- 用户需要明确允许摄像头访问
- 如果拒绝，需要在设置中手动开启

**Android Chrome：**
- 权限请求更加直接
- 支持运行时权限管理
- 可以在设置中查看和管理权限

## 常见问题及解决方案

### 问题1：摄像头权限被拒绝
**现象：** 点击"开始扫描"后显示"摄像头权限被拒绝"

**解决方案：**
1. 检查是否在HTTPS环境下
2. 在浏览器设置中允许摄像头权限
3. 刷新页面重新尝试

### 问题2：未找到摄像头设备
**现象：** 显示"未找到摄像头设备"

**解决方案：**
1. 确认设备有摄像头
2. 检查其他应用是否正在使用摄像头
3. 重启浏览器或设备

### 问题3：移动端扫描不工作
**现象：** 在移动端无法正常扫描

**解决方案：**
1. 确保使用HTTPS链接
2. 检查浏览器是否支持WebRTC
3. 尝试使用不同的浏览器（Chrome、Safari、Firefox）

## 技术实现细节

### 移动端检测
```javascript
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
```

### 权限请求流程
1. 检查浏览器支持
2. 验证HTTPS环境
3. 请求摄像头权限
4. 处理权限结果

### 错误分类处理
- `NotAllowedError`: 权限被拒绝
- `NotFoundError`: 未找到设备
- `NotSupportedError`: 设备不支持
- `NotReadableError`: 设备被占用

## 最佳实践

### 1. 用户体验
- 提供清晰的权限说明
- 显示具体的错误信息
- 提供解决步骤指导

### 2. 技术实现
- 主动检测移动端环境
- 提供HTTPS环境检查
- 详细的错误日志记录

### 3. 测试建议
- 在不同移动设备上测试
- 测试不同的浏览器
- 验证HTTPS环境下的功能

## 调试信息

### 控制台日志
扫描组件会输出详细的调试信息：
- 权限请求过程
- 错误详情
- 设备信息

### 网络要求
- HTTPS协议（移动端必需）
- 稳定的网络连接
- WebRTC支持

## 兼容性说明

### 支持的浏览器
- **iOS**: Safari 11+, Chrome
- **Android**: Chrome, Firefox, Samsung Internet
- **桌面**: Chrome, Firefox, Safari, Edge

### 最低要求
- 支持WebRTC的现代浏览器
- 摄像头设备
- HTTPS环境（移动端） 