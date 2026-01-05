import { colorText, magentaPen, randomPen, yellowPen } from 'color-pen';
import * as vscode from 'vscode';

/**
 * ## 注册可执行命令
 *
 * 这类命令在
 *
 * - 用户执行 Command + Shift + P 建输入该命令的 title 展示并执行
 * - 注册到菜单、功能按钮、按钮栏触发
 * @param param0 注册命令的属性
 * @param param0.name 注册命令名
 * @param param0.callback 注册命令回调方法
 * @returns vscode.Disposable
 */
export function registerCommand<T extends string>({
  callback,
  name,
}: {
  /** 命令名称 */
  name: T;
  /** 该命令对应的回调 */
  callback: () => void;
}): vscode.Disposable {
  console.log(
    ...colorText(
      `${magentaPen`扩展 Super File Header 命令 ${randomPen(name)}`}${yellowPen`注册成功 ！！`}`,
    ),
  );
  return vscode.commands.registerCommand(name, callback);
}
