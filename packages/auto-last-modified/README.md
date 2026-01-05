# Auto Last Modified

\> 📝 Update `@updated` timestamp on save.

## ✨ Features

- ✅ **Auto-update `@updated`** field with current date on every save（ In `mdx/md` files, follow the `last_update` field of [docusaurus](https://docusaurus.io/zh-CN/docs/) and do not change it. ）
- ✅ **Auto-insert header** when creating new `.ts`, `.tsx`, `.js`, `.jsx`, or `.mdx`,`.md` files
- ✅ **Fully configurable** via VS Code settings (no hard-coded templates)
- ✅ **Zero runtime overhead** – only activates when needed
- ✅ **Clean save state** – no dirty indicator after auto-update
- ✅ **Fully Open Source** - You can find it at [Mr.MudBean/vs-code-extension/auto-last-modified](https://github.com/MrMudBean/vs-code-extension/tree/main/packages/auto-last-modified)

## ⚙️ Configuration

All settings are under the `autoLastModified` namespace.

| Setting                                | Default        | Description                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoLastModified.updatedTag`          | `""`           | Automatically update the tag in the file header comments. If not specified, it defaults to 'updated', for example: 'updated' ➞ @updated. However, for MDX/markdown, the default is 'last_update', and modifying it is not currently supported ([Docusaurus mode](https://docusaurus.io/docs/api/plugins)) |
| `autoLastModified.authorName`          | `""`           | Author name used in the template, if you not provided , will be read from the git global configuration using `git config --global user.name`                                                                                                                                                              |
| `autoLastModified.authorEmail`         | `""`           | Author email used in the template, if you not provided , will be read from the git global configuration using `git config --global user.email`                                                                                                                                                            |
| `autoLastModified.dateFormat`          | `"YYYY-MM-DD"` | Date format for `@updated` (ISO format recommended)                                                                                                                                                                                                                                                       |
| `autoLastModified.autoInsertOnNewFile` | `true`         | Enable auto-insertion on new supported files                                                                                                                                                                                                                                                              |
| `autoLastModified.mdxHeaderType`       | `page`         | Pattern used when generating markdown/mdx [docusaurus](https://docusaurus.io/docs/api/plugins) file headers                                                                                                                                                                                               |

### Example Settings

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

## Trigger timing
