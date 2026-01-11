# Change Log / 更改记录

<!-- 当当当 -->

All notable changes to the "auto-last-modified" extension will be documented in this file.

所有对 "auto-last-modified" 扩展的显著更改都会记录在此文件中。

## 0.3.0 (1 月 10 日 2025 年)

- Added configuration option `Allow Insert On Empty File Save`, which allows you to configure whether to insert a file header when saving an empty file. This option is disabled by default and needs to be enabled manually if required.
- Added configuration option `Forcibly Insert`, Whether to enable the right-click function key to forcibly insert the file header command. This option is disabled by default and needs to be enabled manually if required.
- Starting from this version, the `@file` field will be automatically updated to the latest file name.
- Starting from this version, a `@version` meta tag will be inserted at the top of ts/js/jsx/tsx files (if I can find the "package.json" file).

- 添加配置项 `Allow Insert On Empty File Save` ，可以配置在空文件保存时是否插入文件头，该配置默认不开启，若有需要需要手动开启
- 添加配置项 `Forcibly Insert` ，开启右键功能键显示强行插入文件头命令。该配置默认不开启，若有需要需要手动开启
- 从本版本开始，将自动更新 `@file` 字段为最新的文件名
- 从本版本开始，将在 ts/js/jsx/tsx 的文件头中插入 `@version` 元标签（如果我能找到 "package.json" 文件的话）

## 0.2.0 (1 月 8 日 2025 年)

- Added configuration options `Use JS Plain Style`, `Use Md Blog Style`, `Use Md Doc Style`, and `Use Package Documentation Style`, which allow files in specific paths to use the specified build header style. This configuration option takes precedence over `Mdx Header Type` (in markdown/mdx documents).

- 添加了配置项 `Use JS Plain Style`、 `Use Md Blog Style`、 `Use Md Doc Style`、`Use Package Documentation Style` ，可以配置特定路径下的文件使用指定的构建头的方式，且该配置项优先级高于 `Mdx Header Type` （在 markdown/mdx 文档中）

## 0.1.1 (1 月 6 日 2025 年)

- Basic mistake, forgot the month 1

- 低级错误，月份忘了 +1

## Unreleased / 未发布

- Initial release （初始版本） -- 2026/01/06
