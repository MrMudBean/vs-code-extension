import { basename } from 'node:path';
import * as vscode from 'vscode';
import { print, showErrorMessage } from 'zza';
import { getAuthorInfo } from './authorInfo';
import { changeFileIsEmpty } from './changeFileIsEmpty';
import { autoInsert, currentDate, vsCodeConfig } from './getConfig';
import { isJs, isMarkdown, isMdx } from './getLang';

/**
 * ## 新建文件插入文件头
 *
 * 本文件主要起到了校验的作用，用以判定当前文档的编辑器
 * @param document 文档
 */
export async function insertFileHeader(document: vscode.TextDocument) {
  /** MDX 文档类型 */
  const mdxDoc = isMdx(document);
  /** 有效的文档类型 */
  const isEffectiveDoc = mdxDoc || isJs(document);
  if (
    !autoInsert() || // 不允许自动插入（用户手动关闭了该项）
    !isEffectiveDoc || // 当前非支持文档类型
    document.getText().replace(/\s/g, '') !== '' || // 当前非新（空）文档
    document.isDirty // 当前文档不干净
  ) {
    // 不符合要求退出
    return;
  }
  //  使用延迟保证能正确获取当前的编辑
  setTimeout(() => {
    /** 当前编辑者 */
    const editor = vscode.window.visibleTextEditors.find(
      e => e.document === document,
    );

    if (!editor) {
      // 没有找到编辑者，可能文件过大或其他原因
      return;
    }
    // 构建文件头
    buildFileHeader(editor);
  }, 248);
}

/**
 * @param type 创建的标头类型，主要用于区别 docusaurus 的 page、blog 类型
 */
export function buildFileHeaderOnActiveTextEditor(type?: 'page' | 'blog') {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  buildFileHeader(editor, type);
}

/**
 * ## 文档构建者
 * @param editor vscode 文本编辑
 * @param type 创建的标头类型，主要用于区别 docusaurus 的 page、blog 类型
 * @returns Promise<void>
 */
async function buildFileHeader(
  editor: vscode.TextEditor,
  type?: 'page' | 'blog',
) {
  const document = editor.document;
  if (!document) return print('没有找到 document');
  const mdxDoc = isMdx(document); // mdx 类型文档
  const mdDoc = isMarkdown(document); // markdown 类型
  const markdownDoc = mdxDoc || mdDoc; // markdown 和 mdx 类型
  type ??= vsCodeConfig.mdxHeaderType();
  let template = getTemplate(document, markdownDoc, mdDoc, type); // 模版片段
  const docUri = document.uri.toString();
  print(docUri);
  try {
    await editor.edit(editBuilder => {
      const fullRange = new vscode.Range(
        new vscode.Position(0, 0),
        document.positionAt(document.getText().length),
      );
      editBuilder.replace(fullRange, template); // 替换文本
    });
    await document.save(); // 保存写入
  } catch (error: any) {
    console.error('初始化空文件失败', error);
    showErrorMessage(`初始化空文件失败： ${error.message}`);
  }
  changeFileIsEmpty(document); // 重要：更改右键状态
}

/**
 *
 * @param document 文档
 * @param markdownDoc 当前是否是 markdown 或 mdx 文档
 * @param mdDoc 当前是否是 markdown 类型文档
 * @param type 选择的 markdown 的类型，主要针对 docusaurus 的 blog、page 类型
 * @returns 插入模版
 */
function getTemplate(
  document: vscode.TextDocument,
  markdownDoc: boolean,
  mdDoc: boolean,
  type?: 'blog' | 'page',
): string {
  const { name, email } = getAuthorInfo(); // 用于信息
  const filePath = document.fileName; // 文件路径
  const currentNow = currentDate(); // 当前的时间
  const isBlog = type === 'blog'; // 是否是 blog 模式

  return markdownDoc
    ? [
        '---',
        `title: ${basename(filePath)}`,
        isBlog && 'authors: []',
        '# description: xx',
        isBlog && '# keys: []',
        'hide_title: true',
        `date: ${currentNow}`,
        `last_update: ${currentNow}`,
        !isBlog && '# pagination_prev: null',
        !isBlog && '# pagination_next: null',
        '---',
        '',
        isBlog && (mdDoc ? '<!-- truncate  -->' : '{/* {truncate} */}'), // 插入摘要标记
      ]
        .filter(e => e !== false)
        .join('\n')
    : [
        '/**',
        ` * @file ${filePath?.replace(/.*\/(.*?)$/, '$1')}`,
        ' * @description xx',
        ` * @author ${name || '📇'} <${email || '📮'}>`,
        ' * @license MIT',
        ` * @copyright  ${new Date().getFullYear()} ©️ ${name || '📇'}`,
        ' * @packageDocumentation',
        ' * @module  xx',
        ` * @since ${currentNow}`,
        ` * @updated ${currentNow}`,
        ' **/',
      ].join('\n');
}
