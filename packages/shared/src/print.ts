import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

/**
 * 设置输出
 * @param extensionName 扩展名
 */
export function setOutPutChannel(extensionName: string) {
  outputChannel = vscode.window.createOutputChannel(extensionName);
}

/**
 * ## 打印
 * @param messages 打印的内容
 */
export function print(...messages: unknown[]): void {
  console.log(...messages);
  messages.forEach(msg => {
    outputChannel.appendLine(`[💡 ${new Date().toISOString()}]: ${msg}`);
  });
}
/**
 * ## 打印警示信息
 * @param messages 打印的内容
 */
export function printWarn(...messages: unknown[]): void {
  console.error(...messages);
  messages.forEach(msg => {
    outputChannel.appendLine(`[⚠️ ${new Date().toISOString()}]: ${msg}`);
  });
}
/**
 * ## 打印错误信息
 * @param messages 打印的内容
 */
export function printError(...messages: unknown[]): void {
  console.error(...messages);
  messages.forEach(msg => {
    outputChannel.appendLine(`[❌ ${new Date().toISOString()}]: ${msg}`);
  });
}
