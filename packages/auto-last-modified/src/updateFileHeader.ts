import path from 'node:path';
import { isBusinessEmptyString } from 'a-type-of-js';
import * as vscode from 'vscode';
import { print } from 'zza';
import { getAuthorInfo } from './authorInfo';
import { currentDocument } from './context';
import { currentDate, vsCodeConfig } from './getConfig';
import { isJs, isMarkdown, isMdx } from './getLang';

/**
 * 更新文件头注释中指定字段的日期
 * @returns void
 */
export async function updateFileHeader() {
  if (!currentDocument) return;
  const editor = vscode.window.activeTextEditor; // 活动文本编辑器
  /** 当前为 .mdx/.md 文档 */
  const mdxDoc = isMdx() || isMarkdown(); // markdown 类型文档
  const isEffectiveDoc = mdxDoc || isJs(); // 有效文档类型
  if (
    currentDocument.isUntitled || // 文件未命名
    currentDocument.isDirty === false || // 文件是干净的
    !editor || // 但前编译器
    editor.document !== currentDocument || // 当前活动窗口已非保存时的窗口
    !isEffectiveDoc // 非有效环境
  ) {
    // 不满足条件直接退出
    return;
  }

  // 查找注释位置
  const [startLine, endLine] = checkHasHeaderComment(mdxDoc);
  if (startLine > endLine) return; // 不满足条件
  const edit = new vscode.WorkspaceEdit();
  editLastModified(startLine, endLine, edit);
  if (mdxDoc) {
    editAuthor(startLine, endLine, edit);
  }
  if (isJs()) {
    editFileName(startLine, endLine, edit);
  }
  await vscode.workspace.applyEdit(edit);
}

/**
 *
 * @param startLine 开始行数
 * @param endLine 结束行数
 * @param edit 文本编辑
 */
function editLastModified(
  startLine: number,
  endLine: number,
  edit: vscode.WorkspaceEdit,
) {
  const mdxDoc = isMarkdown() || isMdx();
  const tagName = vsCodeConfig.lastModifiedTag();
  // 构建正则：匹配 @lastModified: ... 或 @lastModified ...
  const dateRegex = new RegExp(
    mdxDoc
      ? '^(\\s+date\\s*[:：]?\\s*)(.*)$'
      : `^(\\s*\\*\\s*@${tagName}\\s*[:：]?\\s*)(.*)$`,
    'i',
  );

  // 在注释块中查找 @lastModified 行
  for (let i = startLine; i <= endLine; i++) {
    const lineText = getLineText(i); // 行文本
    const matchDate = lineText.match(dateRegex); // 获取旧日期
    if (!matchDate) {
      continue;
    }
    const oldValue = matchDate[2]; // 旧的日期
    const newValue = currentDate(); // 新的当前日期
    // 如果日期没变，跳过
    if (oldValue === newValue) {
      break;
    }
    let prefix: string = getPrefix(matchDate); // 构造新行
    updateLine(i, `${prefix}${newValue}`, edit);
    print(`更新 @${tagName} 为新日期： ${newValue}`);
    break;
  }
}

/**
 * ## 在指定行区域内查找特定的人名并替换
 * @param startLine 开始行
 * @param endLine 结束的行
 * @param edit 工作区编译器
 */
function editAuthor(
  startLine: number,
  endLine: number,
  edit: vscode.WorkspaceEdit,
) {
  // 匹配 ` author: `
  const authorRegexp = new RegExp('^(\\s+author\\s*[:：]?\\s*)(.*)$', 'i');
  for (let i = startLine; i <= endLine; i++) {
    const lineText = getLineText(i);
    const matchAuthor = lineText.match(authorRegexp);
    if (!matchAuthor) {
      continue;
    }
    const oldAuthor = matchAuthor[2]; // 旧人
    const newAuthor = getAuthorInfo().name.trim(); // 新人
    if (oldAuthor === newAuthor) {
      break;
    }
    let prefix: string = getPrefix(matchAuthor);
    updateLine(i, `${prefix}${newAuthor}`, edit);
    print(`更新最后用户：${oldAuthor}  ➞  ${newAuthor}`);
    break;
  }
}

/**
 *
 * @param startLine 开始的行
 * @param endLine 结束的行
 * @param edit 工作区编辑器
 */
function editFileName(
  startLine: number,
  endLine: number,
  edit: vscode.WorkspaceEdit,
) {
  if (!currentDocument) {
    return;
  }
  const fileNameRegexp = new RegExp(
    '^(\\s*\\*\\s*@file\\s*[:：]?\\s)(.*)$',
    'i',
  );
  const filePath = currentDocument.fileName; // 文件路径
  const fileName = path.basename(filePath); // 文件名
  for (let i = startLine; i <= endLine; i++) {
    const lineText = getLineText(i); // 行文本
    const matchFileName = lineText.match(fileNameRegexp);
    if (!matchFileName) {
      continue;
    }
    const oldFileName = matchFileName[2]; // 旧的文本地址
    if (oldFileName === fileName && !isBusinessEmptyString(fileName)) {
      break;
    }
    let prefix: string = getPrefix(matchFileName);
    updateLine(i, `${prefix}${fileName}`, edit); // 更新行
    print(`更新文本名：${oldFileName} ➞ ${fileName}`);
    break;
  }
}

/**
 * @param lineNumber 行数
 * @param newLineText 新行文本
 * @param edit 工作空间编辑者
 */
function updateLine(
  lineNumber: number,
  newLineText: string,
  edit: vscode.WorkspaceEdit,
) {
  if (!currentDocument) return;
  const originLine = currentDocument.lineAt(lineNumber);
  edit.replace(
    currentDocument.uri,
    new vscode.Range(originLine.range.start, originLine.range.end),
    newLineText,
  );
}

/**
 *
 * @param mdxDoc 是否是 markdown 文档
 * @returns 找到的头部注释的位置 [startPosition, endPosition] ,找不到返回 [1 , 0]
 */
function checkHasHeaderComment(mdxDoc: boolean): [number, number] {
  const unFoundResponse = [1, 0] as [number, number];
  if (!currentDocument) return unFoundResponse;
  let startLine = -1;
  let endLine = -1;
  // 扫描前 30 行，寻找文件头注释块
  for (let i = 0; i < Math.min(30, currentDocument.lineCount); i++) {
    const lineText = currentDocument.lineAt(i).text.trim();
    const isMarkLine = '---' === lineText;
    // 检测是否是注释块开始 /** 或 /*
    if (
      startLine === -1 &&
      (mdxDoc ? isMarkLine : lineText.startsWith('/**'))
    ) {
      startLine = i;
      continue;
    }
    if (startLine !== -1 && (mdxDoc ? isMarkLine : lineText.endsWith('*/'))) {
      endLine = i;
      break;
    }
  }
  if (startLine === -1 || endLine === -1) {
    return unFoundResponse; // 未找到文件头
  }

  return [startLine, endLine];
}

/**
 * ## 获取前置文本
 * @param matchResponse 正则匹配对象
 * @returns 返回文本
 */
function getPrefix(matchResponse: RegExpMatchArray): string {
  let prefix: string = matchResponse[1] || '';
  prefix = prefix.replace(/(\S)$/, '$1 ').replace(/\s+$/, ' ');
  return prefix;
}

/**
 * ## 获取行文本
 * @param lineNumber 行数
 * @returns 返回当前行的文本
 */
function getLineText(lineNumber: number): string {
  if (!currentDocument) return '';
  const line = currentDocument.lineAt(lineNumber);
  // eslint-disable-next-line jsdoc/check-tag-names
  /**  @ts-ignore: 兼容 mdx 文件  */
  const lineText = line['text'] || line['b'];
  return lineText;
}
