# 语言设置说明

**最后更新：2025年8月4日**

## 默认语言设置

WebDrop 网站现在采用**英文作为默认语言**，只有在检测到浏览器语言为中文时才使用中文。

## 语言检测逻辑

### 1. 浏览器语言检测
```typescript
export const getBrowserLanguage = (): string => {
    const language = navigator.language || navigator.languages?.[0] || 'en';
    // 默认使用英文，只有在检测到中文时才使用中文
    return language.startsWith('zh') ? 'zh' : 'en';
};
```

### 2. 语言初始化流程
1. 检查 localStorage 中是否有保存的语言设置
2. 如果有，使用保存的设置
3. 如果没有，调用 `getBrowserLanguage()` 检测浏览器语言
4. 只有在浏览器语言以 'zh' 开头时才使用中文，否则使用英文

## 修改内容

### 1. HTML 页面语言属性
所有 HTML 页面的 `lang` 属性已从 `zh-CN` 改为 `en`：
- `index.html`
- `privacy-policy.html`
- `terms-of-service.html`
- `copyright.html`
- `404.html`

### 2. 页面默认显示内容
所有静态页面的默认显示内容已改为英文：
- 中文内容：`class="content"`
- 英文内容：`class="content active"`

### 3. 语言切换按钮顺序
语言切换按钮的顺序已调整为英文在前：
```html
<button onclick="showLanguage('en')">English</button>
<button onclick="showLanguage('zh')">中文</button>
```

## 用户体验

### 首次访问
- **英文浏览器用户**: 看到英文界面
- **中文浏览器用户**: 看到中文界面
- **其他语言浏览器用户**: 看到英文界面

### 语言切换
- 用户可以通过语言切换器手动切换语言
- 语言选择会保存到 localStorage
- 下次访问时会使用保存的语言设置

## SEO 优化

### 1. HTML 语言属性
- 默认 `lang="en"` 有助于搜索引擎理解网站的主要语言
- 支持多语言 SEO

### 2. 网站地图
- 包含所有重要页面的链接
- 设置适当的更新频率和优先级

### 3. 元数据
- Open Graph 标签设置英文为主要语言
- 支持中文作为替代语言

## 技术实现

### 1. React 应用
```typescript
// 初始化语言设置 - 默认使用英文，只有在检测到中文时才使用中文
useEffect(() => {
    const savedLanguage = localStorage.getItem('webdrop-language');
    if (savedLanguage) {
        setLanguage(savedLanguage);
    } else {
        const browserLanguage = getBrowserLanguage();
        setLanguage(browserLanguage);
    }
}, []);
```

### 2. 静态页面
- 使用 JavaScript 控制内容显示
- 支持动态语言切换
- 保持页面结构一致

## 维护建议

1. **内容更新**: 确保中英文内容保持同步
2. **翻译质量**: 定期检查和更新翻译内容
3. **用户反馈**: 收集用户对语言设置的反馈
4. **A/B 测试**: 可以考虑测试不同语言设置对用户行为的影响

## 兼容性

- 支持所有现代浏览器
- 支持移动端设备
- 支持屏幕阅读器
- 符合无障碍访问标准 