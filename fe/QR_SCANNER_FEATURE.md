# 二维码扫描功能

## 功能概述

在EasyTrans应用中新增了二维码扫描功能，用户可以通过扫描对方的UID二维码来快速建立连接，无需手动输入UID。

## 功能特性

### 1. 二维码扫描
- 使用`@yudiel/react-qr-scanner`库实现
- 支持摄像头权限请求
- 实时扫描识别二维码
- 自动填充UID到连接输入框

### 2. 用户界面
- 在连接区域添加了"扫描"按钮
- 扫描按钮仅在未连接状态下显示
- 支持中英文界面
- 美观的扫描界面，包含扫描框指示

### 3. 错误处理
- 摄像头权限失败提示
- 扫描错误处理
- 用户友好的错误信息

## 使用方法

1. **启动扫描**：点击连接区域的"扫描"按钮
2. **权限授权**：允许浏览器访问摄像头
3. **扫描二维码**：将对方的UID二维码对准摄像头
4. **自动连接**：扫描成功后UID会自动填入，点击"连接"即可

## 技术实现

### 组件结构
```
QRScanner (fe/src/components/ui/qrscanner.tsx)
├── Scanner (@yudiel/react-qr-scanner)
├── Dialog (自定义对话框)
└── Button (控制按钮)
```

### 主要功能
- `handleQRScan`: 处理扫描结果
- `setShowQRScanner`: 控制扫描器显示/隐藏
- 自动清理扫描结果并转换为大写

### API适配
- 使用`Scanner`组件而不是`QrScanner`
- 使用`onScan`回调而不是`onDecode`
- 处理`IDetectedBarcode[]`数组格式的扫描结果
- 指定`formats={['qr_code']}`只扫描二维码

### 翻译支持
- 中文：扫描、二维码扫描成功
- 英文：Scan、QR code scanned successfully

## 依赖项

```json
{
  "@yudiel/react-qr-scanner": "^2.3.1"
}
```

## 浏览器兼容性

- 需要支持WebRTC的现代浏览器
- 需要摄像头权限
- 支持HTTPS环境（摄像头访问要求）

## 注意事项

1. **HTTPS要求**：摄像头访问需要HTTPS环境
2. **权限管理**：首次使用需要用户授权摄像头权限
3. **移动设备**：在移动设备上效果最佳
4. **网络连接**：需要WebSocket连接正常才能使用扫描功能

## 修复的问题

1. **API兼容性**：修复了`@yudiel/react-qr-scanner`的API使用方式
   - 使用`Scanner`而不是`QrScanner`
   - 使用`onScan`而不是`onDecode`
   - 正确处理扫描结果数组格式

2. **Dialog组件增强**：修改了Dialog组件以支持children和自定义操作按钮
   - 添加了`children`属性支持
   - 添加了`showActions`属性控制是否显示默认操作按钮
   - 使`onConfirm`和`onCancel`变为可选属性 