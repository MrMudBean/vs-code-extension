import { currentDocument } from './context';

/**
 * 获取当前文档的类型
 * @returns 当前文本文档的类型
 */
export function getLang(): string {
  return currentDocument?.languageId ?? 'js';
}

/**
 * ## 判定当前文档是否是 Js 文档
 * @returns 当前文档是 JS/JSX/TS/TSX 类型则返回 `true `，否则返回 `false`
 */
export function isJs(): boolean {
  const lang = getLang();
  return [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ].includes(lang);
}
/**
 * ## 判定当前是否是 MDX 文档
 * @returns 当前文件是 MDX 类型则返回 `true` ，否则返回 `false`
 */
export function isMdx(): boolean {
  const lang = getLang();
  return lang === 'mdx';
}

/**
 * @returns 当前文档类型为 markdown 则返回 `true` ，否则则返回 `false`
 */
export function isMarkdown(): boolean {
  const lang = getLang();
  return lang === 'markdown';
}
