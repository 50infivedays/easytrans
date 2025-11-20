# 🚀 WebDrop Next.js 快速启动指南

## 5分钟快速开始

### 1. 安装依赖（1分钟）
```bash
cd /home/coreuser/workspace/easytrans/fe-next
npm install
```

### 2. 本地开发（立即）
```bash
npm run dev
```
访问：http://localhost:3000

### 3. 构建生产版本（1分钟）
```bash
npm run build
```

### 4. SEO检查（10秒）
```bash
./scripts/check-seo.sh
```

### 5. 本地预览（可选）
```bash
npx serve out
```

## 常用命令

```bash
# 开发
npm run dev           # 启动开发服务器

# 构建
npm run build         # 构建生产版本

# 检查
npm run lint          # 代码检查
./scripts/check-seo.sh  # SEO检查

# 部署
./scripts/deploy.sh   # 交互式部署脚本
```

## 项目结构速览

```
fe-next/
├── app/
│   ├── page.tsx      # 主页（客户端组件）
│   ├── layout.tsx    # 根布局（SEO配置）
│   └── globals.css   # 全局样式
├── components/       # React组件
├── hooks/            # 自定义Hooks（WebSocket/WebRTC）
├── config/           # 配置（API、环境）
├── i18n/             # 国际化
├── public/           # 静态资源
├── out/              # 构建输出（静态HTML）
└── scripts/          # 实用脚本
```

## 核心功能

✅ **已实现并测试通过：**
- WebSocket连接
- WebRTC P2P传输
- 实时聊天
- 文件传输
- 二维码扫描
- 多语言支持
- 完整SEO优化

## 部署选项

### 推荐：Cloudflare Pages
```bash
npm run build
npx wrangler pages publish out --project-name=webdrop
```

### 其他选项
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod --dir=out`
- 自定义服务器：上传 `out/` 目录

详见：[DEPLOYMENT.md](./DEPLOYMENT.md)

## 验证清单

部署前检查：
- [ ] `npm run build` 成功
- [ ] `./scripts/check-seo.sh` 全部通过
- [ ] 本地预览功能正常
- [ ] WebSocket连接正常
- [ ] 文件传输测试通过

## 与原版对比

| 特性 | 原版 (fe/) | 新版 (fe-next/) |
|------|-----------|----------------|
| SEO | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 首屏速度 | 3-5秒 | 1-2秒 |
| 功能 | ✅ | ✅ 相同 |

## 遇到问题？

1. **构建失败：** 清理缓存
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

2. **SEO检查失败：** 查看构建日志，确认 `out/index.html` 存在

3. **WebSocket连接失败：** 检查 `.env.local` 配置

4. **查看更多：** [README.md](./README.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)

## 下一步

1. ✅ 在测试环境部署
2. ✅ 验证所有功能
3. ✅ 运行SEO工具测试
4. 🚀 部署到生产环境
5. 📈 监控SEO改善

---

**准备好了？开始吧！** 🚀

```bash
npm install && npm run dev
```

