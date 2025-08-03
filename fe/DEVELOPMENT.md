# 开发环境配置说明

## 跨域问题解决方案

本项目使用线上后端服务器，本地开发时通过代理解决跨域问题。

### 配置说明

1. **代理配置** (`package.json`)
   ```json
   {
     "proxy": "https://api.eztrans.online"
   }
   ```

2. **环境配置** (`src/config/environment.ts`)
   - 开发环境：使用代理访问API
   - 生产环境：直接访问线上API

3. **API配置** (`src/config/api.ts`)
   - 开发环境：API_BASE_URL为空字符串，使用代理
   - 生产环境：API_BASE_URL为线上地址

### 开发环境特性

1. **调试面板** (`src/components/DebugPanel.tsx`)
   - 仅在开发环境显示
   - 显示环境信息、API配置、连接用户等
   - 可通过右下角"🐛 Debug"按钮打开

2. **环境检测**
   - 自动检测是否为开发环境
   - 开发环境启用详细日志
   - 生产环境禁用调试功能

### 启动开发服务器

```bash
cd fe
npm install
npm start
```

开发服务器将在 `http://localhost:3000` 启动，自动代理API请求到线上后端。

### 生产构建

```bash
npm run build
```

生产构建会：
- 移除所有调试代码
- 禁用调试面板
- 直接访问线上API
- 优化性能和安全性

### 环境变量

- `NODE_ENV=development` - 开发环境
- `NODE_ENV=production` - 生产环境

### 注意事项

1. 确保线上后端服务器正常运行
2. 开发环境需要网络连接访问线上API
3. 调试面板仅在开发环境显示，生产环境不会包含
4. 所有API请求都会通过代理转发到线上服务器 