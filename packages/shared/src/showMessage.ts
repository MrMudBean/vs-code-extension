import * as vscode from 'vscode';

/**
 * ## 展示消息
 * @param msg 将展示的消息
 */
export function showInformationMessage(msg: string) {
  vscode.window.showInformationMessage(msg);
}

/**
 * ## 展示警示消息
 * @param msg 将展示的消息
 */
export function showWarningMessage(msg: string): void {
  vscode.window.showWarningMessage(msg);
}

/**
 * ## 展示错误信息
 * @param msg 将展示的消息
 */
export function showErrorMessage(msg: string) {
  vscode.window.showErrorMessage(msg);
}
