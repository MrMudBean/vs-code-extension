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
