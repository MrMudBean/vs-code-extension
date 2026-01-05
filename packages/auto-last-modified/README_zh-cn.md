# Auto Last Modified

\> 📝 在文件保存时自动更新 `@updated` 时间戳。（在 `mdx/md` 文件中识别 [docusaurus](https://docusaurus.io/zh-CN/docs/) 支持的 `last-update` 字段）

## ✨ Features / 功能亮点

- ✅ **自动更新 `@updated`** 每次保存时自动将 `@updated` 字段更新为当前日期（在 `mdx/md` 文件，以 [docusaurus](https://docusaurus.io/zh-CN/docs/) 的 `last_update` 字段为准，且不可更改）
- ✅ **自动插入文件头部注释** 新建 `.ts`/`.tsx`/`.js`/`.jsx`/`.mdx` 文件时自动插入自定义文件头
- ✅ **可自定义** 完全通过 VS Code 设置配置（无硬编码模板）
- ✅ **零运行时开销** —— 仅在必要时激活
- ✅ **保存后状态干净** —— 自动更新后不会显示未保存标记
- ✅ **完全开源** - 你可以在 [Mr.MudBean/vs-code-extension/auto-last-modified](https://github.com/MrMudBean/vs-code-extension/tree/main/packages/auto-last-modified) 找到它

## ⚙️ 配置说明

所有配置项均位于 `autoLastModified` 命名空间下。

| Setting                                | Default        | Description                                                                                                                                                                                                  |
| -------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `autoLastModified.updatedTag`          | `""`           | 自动更新文件头注释中的 tag 标签，未填写时默认 updated， 示例：'updated' ➞ @updated。但是 mdx/markdown 默认为 last_update，且暂不支持修改 （[docusaurus 模式](https://docusaurus.io/zh-CN/docs/api/plugins)） |
| `autoLastModified.author`              | `""`           | 用户名，如果未填写，可能读取 git 配置 `git config --global user.name`                                                                                                                                        |
| `autoLastModified.authorEmail`         | `""`           | 📮，如果未填写，可能读取 git 配置 `git config --global user.email`                                                                                                                                           |
| `autoLastModified.dateFormat`          | `"YYYY-MM-DD"` | 日期格式                                                                                                                                                                                                     |
| `autoLastModified.autoInsertOnNewFile` | `true`         | 是否允许自动插入                                                                                                                                                                                             |
| `autoLastModified.mdxHeaderType`       | `"pages"`      | 生成 markdown/mdx [docusaurus](https://docusaurus.io/zh-CN/docs/api/plugins) 文件头时使用的模式                                                                                                              |

### 示例配置

```jsonc
{
  "autoLastModified.updatedTag": "updated",
  "autoLastModified.author": "Mr.MudBean",
  "autoLastModified.authorEmail": "Mr.MudBean@outlook.com",
  "autoLastModified.autoInsertOnNewFile": true,
  "autoLastModified.dateFormat": "YYYY-MM-DD",
  "autoLastModified.mdxHeaderType": "page",
}
```

## 触发时机
