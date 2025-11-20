#!/bin/bash
# SEO检查脚本

echo "🔍 检查Next.js构建的SEO优化..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查out目录是否存在
if [ ! -d "out" ]; then
    echo -e "${RED}❌ out/ 目录不存在，请先运行 npm run build${NC}"
    exit 1
fi

# 检查index.html是否存在
if [ ! -f "out/index.html" ]; then
    echo -e "${RED}❌ out/index.html 不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建文件存在${NC}"
echo ""

# 检查必要的SEO元素
echo "检查SEO元素..."
echo ""

# Title标签
if grep -q "<title>" out/index.html; then
    title=$(grep -o "<title>[^<]*" out/index.html | sed 's/<title>//')
    echo -e "${GREEN}✅ Title: ${title}${NC}"
else
    echo -e "${RED}❌ 缺少 Title 标签${NC}"
fi

# Meta description
if grep -q 'name="description"' out/index.html; then
    echo -e "${GREEN}✅ Meta Description 存在${NC}"
else
    echo -e "${RED}❌ 缺少 Meta Description${NC}"
fi

# Keywords
if grep -q 'name="keywords"' out/index.html; then
    echo -e "${GREEN}✅ Keywords 存在${NC}"
else
    echo -e "${YELLOW}⚠️  Keywords 缺失（可选）${NC}"
fi

# Open Graph
if grep -q 'property="og:' out/index.html; then
    og_count=$(grep -c 'property="og:' out/index.html)
    echo -e "${GREEN}✅ Open Graph 标签: ${og_count} 个${NC}"
else
    echo -e "${RED}❌ 缺少 Open Graph 标签${NC}"
fi

# Twitter Card
if grep -q 'name="twitter:' out/index.html; then
    twitter_count=$(grep -c 'name="twitter:' out/index.html)
    echo -e "${GREEN}✅ Twitter Card 标签: ${twitter_count} 个${NC}"
else
    echo -e "${RED}❌ 缺少 Twitter Card 标签${NC}"
fi

# Structured Data
if grep -q 'application/ld+json' out/index.html; then
    ld_count=$(grep -c 'application/ld+json' out/index.html)
    echo -e "${GREEN}✅ 结构化数据: ${ld_count} 个${NC}"
else
    echo -e "${RED}❌ 缺少结构化数据${NC}"
fi

# Canonical URL
if grep -q 'rel="canonical"' out/index.html; then
    echo -e "${GREEN}✅ Canonical URL 存在${NC}"
else
    echo -e "${RED}❌ 缺少 Canonical URL${NC}"
fi

# Hreflang
if grep -q 'rel="alternate"' out/index.html && grep -q 'hrefLang=' out/index.html; then
    hreflang_count=$(grep -c 'hrefLang=' out/index.html)
    echo -e "${GREEN}✅ Hreflang 标签: ${hreflang_count} 个${NC}"
else
    echo -e "${YELLOW}⚠️  Hreflang 标签缺失（多语言可选）${NC}"
fi

echo ""

# 检查预渲染内容
echo "检查预渲染内容..."
if grep -q "WebDrop" out/index.html && grep -q "安全的P2P文件传输" out/index.html; then
    echo -e "${GREEN}✅ 页面内容已预渲染${NC}"
else
    echo -e "${RED}❌ 页面内容未预渲染（可能只有空的root div）${NC}"
fi

echo ""

# 检查静态资源
echo "检查静态资源..."
if [ -f "out/robots.txt" ]; then
    echo -e "${GREEN}✅ robots.txt 存在${NC}"
else
    echo -e "${RED}❌ robots.txt 缺失${NC}"
fi

if [ -f "out/sitemap.xml" ]; then
    echo -e "${GREEN}✅ sitemap.xml 存在${NC}"
else
    echo -e "${RED}❌ sitemap.xml 缺失${NC}"
fi

if [ -f "out/manifest.json" ]; then
    echo -e "${GREEN}✅ manifest.json 存在${NC}"
else
    echo -e "${YELLOW}⚠️  manifest.json 缺失${NC}"
fi

echo ""

# 检查Favicon
echo "检查Favicon..."
favicon_count=$(ls out/*.ico out/*.png 2>/dev/null | wc -l)
if [ $favicon_count -gt 0 ]; then
    echo -e "${GREEN}✅ Favicon 文件: ${favicon_count} 个${NC}"
else
    echo -e "${RED}❌ Favicon 文件缺失${NC}"
fi

echo ""

# 文件大小统计
echo "文件大小统计..."
if [ -d "out/_next" ]; then
    total_size=$(du -sh out | awk '{print $1}')
    echo -e "${GREEN}总大小: ${total_size}${NC}"
    
    js_size=$(du -sh out/_next/static/chunks 2>/dev/null | awk '{print $1}')
    echo -e "JavaScript: ${js_size}"
    
    css_size=$(du -sh out/_next/static/chunks/*.css 2>/dev/null | awk '{print $1}')
    echo -e "CSS: ${css_size}"
fi

echo ""
echo "===================="
echo -e "${GREEN}SEO检查完成！${NC}"
echo "===================="
echo ""
echo "建议："
echo "1. 使用 Google Rich Results Test 测试: https://search.google.com/test/rich-results"
echo "2. 使用 Facebook Sharing Debugger 测试: https://developers.facebook.com/tools/debug/"
echo "3. 使用 PageSpeed Insights 测试性能: https://pagespeed.web.dev/"

