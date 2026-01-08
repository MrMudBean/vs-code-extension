# Auto Last Modified

\> 📝 Update `@lastModified` timestamp on save.

\> 📝 在文件保存时自动更新 `@lastModified` 时间戳。（在 `mdx/md` 文件中识别 [docusaurus](https://docusaurus.io/zh-CN/docs/) 支持的 `last-update` 字段）

<!-- 本插件在  https://marketplace.visualstudio.com/items?itemName=MrMudBean.auto-last-modified 可见 -->

## ✨ Features / 功能亮点

:::info

下面出自于阿里千问

:::

- ✅ **Auto-update `@lastModified`** field with current date on every save（ In `mdx/md` files, follow the `last_update.date` field of [docusaurus](https://docusaurus.io/zh-CN/docs/) and do not change it. ）
- ✅ **Auto-insert header** when creating new `.ts`, `.tsx`, `.js`, `.jsx`, or `.mdx`,`.md` files
- ✅ **Fully configurable** via VS Code settings (no hard-coded templates)
- ✅ **Zero runtime overhead** – only activates when needed
- ✅ **Clean save state** – no dirty indicator after auto-update
- ✅ **Fully Open Source** - You can find it at [Mr.MudBean/vs-code-extension/auto-last-modified](https://github.com/MrMudBean/vs-code-extension/tree/main/packages/auto-last-modified)

- ✅ **自动更新 `@lastModified`** 每次保存时自动将 `@lastModified` 字段更新为当前日期（在 `mdx/md` 文件，以 [docusaurus](https://docusaurus.io/zh-CN/docs/) 的 `last_update` 字段为准，且不可更改）
- ✅ **自动插入文件头部注释** 新建 `.ts`/`.tsx`/`.js`/`.jsx`/`.mdx` 文件时自动插入自定义文件头
- ✅ **可自定义** 完全通过 VS Code 设置配置（无硬编码模板）
- ✅ **零运行时开销** —— 仅在必要时激活
- ✅ **保存后状态干净** —— 自动更新后不会显示未保存标记
- ✅ **完全开源** - 你可以在 [Mr.MudBean/vs-code-extension/auto-last-modified](https://github.com/MrMudBean/vs-code-extension/tree/main/packages/auto-last-modified) 找到它

## ⚙️ Configuration / 配置说明

All settings are under the `autoLastModified` namespace.

所有配置项均位于 `autoLastModified` 命名空间下。

| Setting                                         | Default        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoLastModified.lastModifiedTag`              | `""`           | Automatically update the tag in the file header comments. If not specified, it defaults to `lastModified`, for example: `lastModified` ➞ `@lastModified` . However, for MDX/markdown, the default is 'last_update.date', and modifying it is not currently supported ([Docusaurus mode](https://docusaurus.io/docs/api/plugins))                                                                                                         |
| `autoLastModified.authorName`                   | `""`           | Author name used in the template, if you not provided , will be read from the git global configuration using `git config --global user.name`                                                                                                                                                                                                                                                                                             |
| `autoLastModified.authorEmail`                  | `""`           | Author email used in the template, if you not provided , will be read from the git global configuration using `git config --global user.email`                                                                                                                                                                                                                                                                                           |
| `autoLastModified.dateFormat`                   | `"YYYY-MM-DD"` | Date format for `@lastModified` (ISO format recommended)                                                                                                                                                                                                                                                                                                                                                                                 |
| `autoLastModified.autoInsertOnNewFile`          | `true`         | Enable auto-insertion on new supported files                                                                                                                                                                                                                                                                                                                                                                                             |
| `autoLastModified.mdxHeaderType`                | `page`         | Pattern used when generating markdown/mdx [docusaurus](https://docusaurus.io/docs/api/plugins) file headers                                                                                                                                                                                                                                                                                                                              |
| `autoLastModified.useJsPlainStyle`              | `[]`           | In JS/TS/JSX/TSX files, use the standard style and define the rules for matching file paths with an array of paths. If a rule is not provided, there will be no rule by default. For example, `['code/doc']` will apply the standard style to JS/TS/JSX/TSX files under the '**/code/doc/**' path when building file headers. This style differs from `usePackageDocumentationStyle` when the packageDocumentation field is not present. |
| `autoLastModified.usePackageDocumentationStyle` | `[]`           | Use package documentation style in JS/TS/JSX/TSX files, and use a path array to define the rules for matching file paths. If no rules are provided, the default is no rules. For example, `['code/npm']` will apply the package documentation style to the headers of JS/TS/JSX/TSX files under the '**/code/npm/**' path. This style differs from `useJsPlainStyle` in that it includes the packageDocumentation field.                 |
| `utoLastModified.useMdDocStyle`                 | `[]`           | In markdown/MDX files, use [docusaurus doc](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs) and define the rules for matching file paths with an array of paths. If left empty, it means no rules. For example, `['code/doc']` will build .md/.mdx files under the path '**/code/doc/**' without `authors` in the front matter.                                                                                  |
| `autoLastModified.useMdBlogStyle`               | `[]`           | When using [docusaurus blog](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog) in markdown/MDX files, you can define the file path rules using an array of paths. If no rules are provided, it is considered to have no rules. For example, `['change-log']` will build header annotations containing `authors` in .md/.mdx files under the '**/change-log/**' path.                                               |

| 设置项                                          | 默认值         | 描述                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoLastModified.lastModifiedTag`              | `""`           | 自动更新文件头注释中的 tag 标签，未填写时默认 `lastModified` ， 示例：`lastModified` ➞ `@lastModified`。但是 mdx/markdown 默认为 `last_update.date` ，且暂不支持修改 （[docusaurus 模式](https://docusaurus.io/zh-CN/docs/api/plugins)）                                                       |
| `autoLastModified.author`                       | `""`           | 用户名，如果未填写，可能读取 git 配置 `git config --global user.name`                                                                                                                                                                                                                          |
| `autoLastModified.authorEmail`                  | `""`           | 📮，如果未填写，可能读取 git 配置 `git config --global user.email`                                                                                                                                                                                                                             |
| `autoLastModified.dateFormat`                   | `"YYYY-MM-DD"` | 日期格式                                                                                                                                                                                                                                                                                       |
| `autoLastModified.autoInsertOnNewFile`          | `true`         | 是否允许自动插入                                                                                                                                                                                                                                                                               |
| `autoLastModified.mdxHeaderType`                | `"pages"`      | 生成 markdown/mdx [docusaurus](https://docusaurus.io/zh-CN/docs/api/plugins) 文件头时使用的模式                                                                                                                                                                                                |
| `autoLastModified.useJsPlainStyle`              | `[]`           | 在 JS/TS/JSX/TSX 文件中使用普通风格，使用路径数组来定义命中的文件路径的规则，未填写规则默认无规则，例如 `['code/doc']` 将会在 '**/code/doc/**' 路径下的 JS/TS/JSX/TSX 文件构建文件头为普通风格。该风格与 `usePackageDocumentationStyle` 区别于没有 packageDocumentation 字段                   |
| `autoLastModified.usePackageDocumentationStyle` | `[]`           | 在 JS/TS/JSX/TSX 文件中使用包文档风格，使用路径数组来定义命中的文件路径的规则，未填写规则默认无规则，例如 `['code/npm']` 将会在 '**/code/npm/**' 路径下的 JS/TS/JSX/TSX 文件构建文件头为包文档风格。该风格与 `useJsPlainStyle` 区别于多了 packageDocumentation 字段                            |
| `utoLastModified.useMdDocStyle`                 | `[]`           | 在 markdown/MDX 文件中使用 [docusaurus doc](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-content-docs)，使用路径数组来定义命中的文件路径的规则，未填写视为无规则，例如 `['code/doc']` 将会在 '**/code/doc/**' 路径下的 .md/.mdx 文件中构建不包含 `authors` 的头部注释       |
| `autoLastModified.useMdBlogStyle`               | `[]`           | 在 markdown/MDX 文件中使用 [docusaurus blog](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-content-blog) ，使用路径数组类定义命中的文件路径规则，未填写规则视为无规则，例如 `['change-log']` 将会在 '**/change-log/**' 路径下的 .md/.mdx 文件中构建包含 `authors` 的头部注释 |

### Example Settings / 配置示例

```jsonc
{
  "autoLastModified.lastModifiedTag": "lastModified",
  "autoLastModified.author": "Mr.MudBean",
  "autoLastModified.authorEmail": "Mr.MudBean@outlook.com",
  "autoLastModified.autoInsertOnNewFile": true,
  "autoLastModified.dateFormat": "YYYY-MM-DD",
  "autoLastModified.mdxHeaderType": "page",
  "configuration.useJsPlainStyle": [],
  "autoLastModified.usePackageDocumentationStyle": ["code/npm"],
  "utoLastModified.useMdDocStyle": [],
  "autoLastModified.useMdBlogStyle": [],
}
```

## Trigger timing / 触发时机

After thinking about it, the original setup required me to manually switch the type of build header comments whenever I changed my working directory. It was really quite a headache. So, I decided to use a directory-based approach, giving it a higher priority than manual configuration, but completely ignoring the directory setting when a command is triggered. It’s a pretty good idea, and indeed, I actually implemented it.

想了想，原来的模式在我切换工作目录的时候需要手动切换构建头部注释的类型。着实会让人感到头大。于是，使用目录的方式，且让其优先级高于手动配置，但在命令触发时，完全忽略目录设定。这是个不错的想法，并且，我真的这么做了 （嗯，我确实的先想的中文，再用的翻译软件）。
