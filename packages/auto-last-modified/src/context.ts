import * as vscode from 'vscode';

/** 扩展上下文 */
export let extensionContext: vscode.ExtensionContext;

/** 当前是否是中文环境 */
export let isCn: boolean;
/**
 * 保留上下文状态
 * @param context 扩展上下文
 */
export function setContext(context: vscode.ExtensionContext) {
  extensionContext = context;
  isCn = vscode.env.language === 'zh-cn';
}
