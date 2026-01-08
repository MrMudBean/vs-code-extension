import { sep } from 'node:path';
import * as vscode from 'vscode';

/** 扩展上下文 */
export let extensionContext: vscode.ExtensionContext;

/**
 *
 * @param context 扩展上下文
 */
export function setContext(context: vscode.ExtensionContext) {
  extensionContext = context;
}

/** 当前是否是中文环境 */
export const isCn = vscode.env.language === 'zh-cn';

/** 当前文档 */
export let currentDocument: vscode.TextDocument | undefined;

/**
 *
 * @param document 文本文档
 */
export function setCurrentDocument(document: vscode.TextDocument | undefined) {
  currentDocument = document;
}

/**
 * 获取当前跨平台的文件路径
 * @returns 文件路径
 */
export function crossPlatformPath() {
  if (!currentDocument) return '';
  return currentDocument.fileName.split(sep).join('/');
}
