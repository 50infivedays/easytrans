#!/bin/bash

# HTTPS 配置检查脚本
# 用于验证网站的 HTTPS 配置是否正确

echo "================================"
echo "HTTPS 配置检查工具"
echo "================================"
echo ""

DOMAIN="webdrop.online"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查 HTTP 到 HTTPS 重定向
echo "1. 检查 HTTP 到 HTTPS 重定向..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://$DOMAIN")
HTTP_REDIRECT=$(curl -s -I "http://$DOMAIN" | grep -i "Location:" | grep "https://")

if [ -n "$HTTP_REDIRECT" ]; then
    echo -e "${GREEN}✓${NC} HTTP 正确重定向到 HTTPS"
    echo "  重定向地址: $HTTP_REDIRECT"
else
    echo -e "${RED}✗${NC} HTTP 未重定向到 HTTPS"
    echo -e "${YELLOW}  建议: 在服务器配置中添加 301 重定向${NC}"
fi
echo ""

# 2. 检查 HSTS 头
echo "2. 检查 HSTS (HTTP Strict Transport Security) 头..."
HSTS_HEADER=$(curl -s -I "https://$DOMAIN" | grep -i "Strict-Transport-Security")

if [ -n "$HSTS_HEADER" ]; then
    echo -e "${GREEN}✓${NC} HSTS 头已配置"
    echo "  $HSTS_HEADER"
    
    # 检查 max-age
    if echo "$HSTS_HEADER" | grep -q "max-age=31536000"; then
        echo -e "${GREEN}✓${NC} max-age 设置正确 (1年)"
    else
        echo -e "${YELLOW}⚠${NC} max-age 可能设置较短，建议设置为 31536000 (1年)"
    fi
    
    # 检查 includeSubDomains
    if echo "$HSTS_HEADER" | grep -q "includeSubDomains"; then
        echo -e "${GREEN}✓${NC} 包含 includeSubDomains"
    else
        echo -e "${YELLOW}⚠${NC} 建议添加 includeSubDomains"
    fi
    
    # 检查 preload
    if echo "$HSTS_HEADER" | grep -q "preload"; then
        echo -e "${GREEN}✓${NC} 包含 preload"
    else
        echo -e "${YELLOW}⚠${NC} 如需加入 HSTS Preload 列表，需添加 preload"
    fi
else
    echo -e "${RED}✗${NC} 未找到 HSTS 头"
    echo -e "${YELLOW}  建议: 在服务器配置中添加 Strict-Transport-Security 头${NC}"
fi
echo ""

# 3. 检查 Content-Security-Policy
echo "3. 检查 Content-Security-Policy 头..."
CSP_HEADER=$(curl -s -I "https://$DOMAIN" | grep -i "Content-Security-Policy")

if echo "$CSP_HEADER" | grep -q "upgrade-insecure-requests"; then
    echo -e "${GREEN}✓${NC} CSP upgrade-insecure-requests 已配置"
else
    echo -e "${YELLOW}⚠${NC} 建议在 CSP 中添加 upgrade-insecure-requests"
fi
echo ""

# 4. 检查 SSL 证书
echo "4. 检查 SSL 证书..."
SSL_INFO=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

if [ -n "$SSL_INFO" ]; then
    echo -e "${GREEN}✓${NC} SSL 证书有效"
    echo "$SSL_INFO" | sed 's/^/  /'
else
    echo -e "${RED}✗${NC} 无法验证 SSL 证书"
fi
echo ""

# 5. 检查 sitemap
echo "5. 检查 sitemap.xml..."
SITEMAP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/sitemap.xml")

if [ "$SITEMAP_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Sitemap 可访问 (HTTP $SITEMAP_RESPONSE)"
    
    # 检查 sitemap 中的 URL 是否都是 HTTPS
    HTTP_URLS=$(curl -s "https://$DOMAIN/sitemap.xml" | grep -o "http://[^<]*" | wc -l)
    HTTPS_URLS=$(curl -s "https://$DOMAIN/sitemap.xml" | grep -o "https://[^<]*" | wc -l)
    
    echo "  HTTPS URLs: $HTTPS_URLS"
    echo "  HTTP URLs: $HTTP_URLS"
    
    if [ "$HTTP_URLS" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} 所有 sitemap URL 都使用 HTTPS"
    else
        echo -e "${RED}✗${NC} Sitemap 中存在 HTTP URL，需要修改为 HTTPS"
    fi
else
    echo -e "${RED}✗${NC} Sitemap 无法访问 (HTTP $SITEMAP_RESPONSE)"
fi
echo ""

# 6. 检查 robots.txt
echo "6. 检查 robots.txt..."
ROBOTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/robots.txt")

if [ "$ROBOTS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} robots.txt 可访问"
    
    SITEMAP_IN_ROBOTS=$(curl -s "https://$DOMAIN/robots.txt" | grep -i "Sitemap:")
    if echo "$SITEMAP_IN_ROBOTS" | grep -q "https://"; then
        echo -e "${GREEN}✓${NC} robots.txt 中的 sitemap 使用 HTTPS"
        echo "  $SITEMAP_IN_ROBOTS"
    else
        echo -e "${YELLOW}⚠${NC} robots.txt 中的 sitemap 可能未使用 HTTPS"
    fi
else
    echo -e "${RED}✗${NC} robots.txt 无法访问"
fi
echo ""

# 7. 总结
echo "================================"
echo "检查完成"
echo "================================"
echo ""
echo "建议操作："
echo "1. 如果 HTTP 未重定向，请配置服务器 301 重定向"
echo "2. 如果缺少 HSTS 头，请在服务器配置中添加"
echo "3. 在 Google Search Console 提交 HTTPS sitemap"
echo "4. 请求 Google 重新抓取主要页面"
echo "5. 考虑加入 HSTS Preload 列表 (https://hstspreload.org/)"
echo ""
echo "在线检查工具："
echo "- SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "- Security Headers: https://securityheaders.com/?q=$DOMAIN"
echo "- HSTS Preload: https://hstspreload.org/?domain=$DOMAIN"
echo ""

