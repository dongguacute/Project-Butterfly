---
title: "Markdown 语法全解析：从基础到高级"
date: "2025-12-25"
category: "技术指南"
description: "这篇文章展示了本站支持的所有 Markdown 语法格式，包括基础文本排版、多媒体集成、数学公式（示例）以及 GFM 扩展语法。"
---

# Markdown 语法大赏

这是一篇为了测试和展示 **Project Butterfly** 文章渲染引擎而准备的示例文章。它包含了你日常写作中可能用到的所有格式。

---

## 1. 基础文本排版

你可以轻松地使用 **粗体**、*斜体*、<u>下划线</u>、~~中划线~~ 或者 `行内代码`。

> **这是一段引用块。** 
> 好的排版能够让读者的视线像流水一样顺畅。引用块常用于摘录名言或强调核心观点。

### 列表展示

**无序列表：**
- 蝴蝶的翅膀是美丽的
- 技术的迭代是迅速的
- 设计的本质是解决问题

**有序列表：**
1. 构思你的主题
2. 编写 Markdown 源码
3. 自动同步到网页展示

---

## 2. 图片与多媒体

图片支持圆角和阴影自动处理：

![示例图片](https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80)
*图：大自然的光影（Unsplash 示例）*

---

## 3. 代码块展示

支持语法高亮（基于 Tailwind Typography 预设样式）：

```typescript
// 这是一个 TypeScript 示例
interface Article {
  title: string;
  date: string;
  content: string;
}

function renderArticle(data: Article): string {
  console.log(`正在渲染: ${data.title}`);
  return `<h1>${data.title}</h1><p>${data.content}</p>`;
}

const myArticle = {
  title: "蝴蝶计划",
  date: "2025-12-25",
  content: "这是一个纯静态的 Remix 博客。"
};

renderArticle(myArticle);
```

---

## 4. GFM 扩展语法 (GitHub Flavored Markdown)

### 表格测试

| 功能 | 支持程度 | 备注 |
| :--- | :---: | :--- |
| 基础语法 | 100% | 完美兼容 |
| GFM 表格 | 100% | 已集成 remark-gfm |
| 任务列表 | 100% | 交互友好 |

### 任务列表

- [x] 完成基础架构搭建
- [x] 实现 Remark 渲染引擎
- [ ] 添加评论系统 (WIP)
- [x] 优化 SEO 标签

---
## 7. 提示小组件 (Callouts / Alerts)

本站支持通过 Markdown 指令语法（Directives）添加各种类型的提示框：

:::note
这是一个普通的笔记（Note），用于记录一些补充信息。
:::

:::info
这是一个信息框（Info），用于传达重要的背景资料。
:::

:::tip
这是一个小技巧（Tip），分享一些能提高效率的方法。
:::

:::warning
这是一个警告（Warning），提醒读者注意潜在的问题。
:::

:::error
这是一个错误提示（Error），指出必须避免的行为。
:::

---

## 8. CSV 与表格增强

除了标准的 Markdown 表格，你现在还可以直接插入 CSV 代码块并获得基础高亮支持：

```csv
ID,Name,Role,Status
1,Butterfly,Admin,Active
2,Guest,User,Pending
3,Bot,System,Disabled
```

---

## 9. 脚注与链接

你可以添加一个链接到 [Project Butterfly 首页](/)。
或者添加一个脚注：这是一个带有脚注的句子[^1]。

---

## 6. 装饰性元素

使用分割线来区分不同的章节：

***

### 结语

Markdown 的魅力在于它让你专注于内容本身。配合 **Project Butterfly** 的毛玻璃设计语言，你的文字将展现出前所未有的质感。

[^1]: 这是脚注的内容，通常显示在文章末尾。
