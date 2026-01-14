/**
 * @module  _
 * @file enum-command-name.ts
 * @description _
 * @author MrMudBean <Mr.MudBean@outlook.com>
 * @copyright  2026 ©️ MrMudBean
 * @since 2026-01-14 12:13
 * @version 0.3.1
 * @lastModified 2026-01-14 12:20
 */

export enum CommandNameType {
  /** 构建 javascript 文件头 */
  'CREATE_JAVASCRIPT_HEADER' = 'autoLastModified.createJavaScriptHeaderComment',
  /** 构建 MDX 文件头 */
  'CREATE_MDX_HEADER' = 'autoLastModified.createMdxHeaderComment',
  /** 构建 MDX page 类型的文件头  */
  'CREATE_MDX_PAGE_HEADER' = 'autoLastModified.createMdxPageHeaderComment',
  /** 构架 MDX blog 文件头  */
  'CREATE_MDX_BLOG_HEADER' = 'autoLastModified.createMdxBlogHeaderComment',
  /** 刷新数据命令 */
  'RESET_EXTENSION_DATA' = 'autoLastModified.resetExtensionData',
}
