#!/bin/bash
# 部署脚本

set -e  # 遇到错误立即退出

echo "🚀 WebDrop Next.js 部署脚本"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 清理旧构建
echo -e "${BLUE}📦 清理旧构建...${NC}"
rm -rf .next out

# 2. 安装依赖
echo -e "${BLUE}📥 安装依赖...${NC}"
npm ci

# 3. 构建
echo -e "${BLUE}🔨 构建生产版本...${NC}"
npm run build

# 4. 运行SEO检查
echo ""
echo -e "${BLUE}🔍 运行SEO检查...${NC}"
./scripts/check-seo.sh

# 5. 显示构建信息
echo ""
echo -e "${GREEN}✅ 构建完成！${NC}"
echo ""
echo "构建输出目录: out/"
echo "文件总数: $(find out -type f | wc -l)"
echo "总大小: $(du -sh out | awk '{print $1}')"
echo ""

# 6. 部署选项
echo "===================="
echo "部署选项："
echo "===================="
echo ""
echo "1. Cloudflare Pages"
echo "   命令: npx wrangler pages publish out --project-name=webdrop"
echo ""
echo "2. Vercel"
echo "   命令: vercel --prod"
echo ""
echo "3. Netlify"
echo "   命令: netlify deploy --prod --dir=out"
echo ""
echo "4. 自定义服务器"
echo "   将 out/ 目录内容上传到服务器"
echo "   例如: rsync -av out/ user@server:/var/www/webdrop/"
echo ""
echo "5. 本地预览"
echo "   命令: npx serve out"
echo ""

# 询问是否要本地预览
read -p "是否要本地预览？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🌐 启动本地预览服务器...${NC}"
    echo "访问: http://localhost:3000"
    npx serve out -l 3000
fi

