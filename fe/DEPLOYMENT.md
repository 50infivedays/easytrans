# WebDrop Next.js 部署指南

## 快速部署步骤

### 1. 构建生产版本

```bash
cd /home/coreuser/workspace/easytrans/fe-next
npm run build
```

构建成功后，静态文件会生成在 `out/` 目录。

### 2. 验证构建结果

```bash
# 检查输出目录
ls -lh out/

# 查看生成的HTML文件（验证SEO）
head -100 out/index.html

# 本地预览（可选）
npx serve out
```

## 部署选项

### 选项 1: Cloudflare Pages（推荐）

**优点：** 全球CDN、免费SSL、自动HTTPS、出色的性能

**步骤：**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Pages > Create a project
3. 选择部署方式：
   - **方式A - 直接上传：**
     ```bash
     npm run build
     # 在Cloudflare Pages界面上传 out/ 目录
     ```
   
   - **方式B - Git集成：**
     - 连接GitHub仓库
     - 设置构建命令：`npm run build`
     - 设置输出目录：`out`
     - 设置环境变量（见下方）

4. 配置自定义域名（可选）

**环境变量：**
```
NEXT_PUBLIC_API_BASE_URL=https://api.webdrop.online
NEXT_PUBLIC_WS_URL=wss://api.webdrop.online/ws
NEXT_PUBLIC_GA_ID=G-SF9EWZDX5Q
NODE_ENV=production
```

### 选项 2: Vercel

**优点：** Next.js官方平台、零配置、自动优化

**步骤：**

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 或者直接从Git部署
# 连接GitHub仓库到Vercel
```

**vercel.json 配置：**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

### 选项 3: Netlify

**步骤：**

```bash
# 安装Netlify CLI
npm i -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod --dir=out
```

**netlify.toml 配置：**
```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 选项 4: 传统服务器（Nginx）

**1. 构建并上传：**
```bash
npm run build
scp -r out/* user@your-server:/var/www/webdrop/
```

**2. Nginx配置：**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name webdrop.online www.webdrop.online;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name webdrop.online www.webdrop.online;

    # SSL证书
    ssl_certificate /etc/letsencrypt/live/webdrop.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webdrop.online/privkey.pem;

    # 网站根目录
    root /var/www/webdrop;
    index index.html;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 安全头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**3. 重启Nginx：**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 选项 5: GitHub Pages

**步骤：**

1. 在 `package.json` 添加 homepage：
   ```json
   "homepage": "https://yourusername.github.io/webdrop"
   ```

2. 构建并部署：
   ```bash
   npm run build
   
   # 使用gh-pages包
   npx gh-pages -d out
   ```

## 部署后验证

### 1. 功能测试
- [ ] 页面正常加载
- [ ] WebSocket连接成功
- [ ] 可以获取UID
- [ ] 可以连接对方
- [ ] 可以发送消息
- [ ] 可以传输文件
- [ ] 二维码扫描功能正常

### 2. SEO验证

```bash
# 使用curl检查HTML
curl https://webdrop.online | head -100

# 应该看到完整的meta标签和预渲染内容
```

**在线工具验证：**
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### 3. 性能测试
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] [GTmetrix](https://gtmetrix.com/)
- [ ] [WebPageTest](https://www.webpagetest.org/)

目标指标：
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

## 持续部署 (CI/CD)

### GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          NEXT_PUBLIC_WS_URL: ${{ secrets.WS_URL }}
          NEXT_PUBLIC_GA_ID: ${{ secrets.GA_ID }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages publish out --project-name=webdrop
```

## 故障排除

### 问题 1: 构建失败
```bash
# 清理缓存重新构建
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### 问题 2: 部署后白屏
- 检查浏览器控制台错误
- 确认静态资源路径正确
- 检查环境变量是否正确设置

### 问题 3: WebSocket连接失败
- 确认 `NEXT_PUBLIC_WS_URL` 环境变量正确
- 检查服务器是否支持WebSocket
- 确认没有防火墙阻止连接

### 问题 4: SEO不生效
- 确认构建时使用了 `output: 'export'`
- 查看生成的HTML文件，确认meta标签存在
- 使用Google Search Console请求重新索引

## 监控和维护

### 1. Google Search Console
- 提交sitemap: `https://webdrop.online/sitemap.xml`
- 监控索引状态
- 查看搜索性能

### 2. Google Analytics
- 监控流量
- 分析用户行为
- 跟踪转化率

### 3. 错误监控（可选）
- Sentry
- LogRocket
- Datadog

## 回滚策略

如果新版本出现问题，快速回滚：

### Cloudflare Pages
在Cloudflare Dashboard中可以一键回滚到之前的部署。

### Vercel
```bash
vercel rollback
```

### 自建服务器
```bash
# 保留之前的版本
cd /var/www
mv webdrop webdrop-new
mv webdrop-old webdrop
sudo systemctl reload nginx
```

## 性能优化建议

1. **启用Brotli压缩**（Cloudflare/Nginx）
2. **配置HTTP/2**
3. **使用CDN**（Cloudflare、CloudFront）
4. **优化图片**（WebP格式）
5. **启用缓存头**
6. **配置Service Worker**（PWA）

## 安全建议

1. **启用HTTPS**（必须）
2. **配置CSP头**
3. **定期更新依赖**
4. **监控安全漏洞**
5. **配置防火墙规则**

## 成本估算

| 平台 | 免费额度 | 付费价格 |
|------|----------|----------|
| Cloudflare Pages | 无限制 | $0/月 |
| Vercel | 100GB带宽/月 | $20/月起 |
| Netlify | 100GB带宽/月 | $19/月起 |
| 自建VPS | - | $5-20/月 |

## 联系支持

如遇部署问题，请查看：
- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/yourusername/webdrop/issues)

