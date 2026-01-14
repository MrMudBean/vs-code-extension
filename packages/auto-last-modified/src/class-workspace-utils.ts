/**
 * @module @auto-last-modified/class-workspace-utils
 * @file class-workspace-utils.ts
 * @description 工作区类，用于判定当前工作区（编辑器）的打开目录
 * @author MrMudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ MrMudBean
 * @since 2026-01-14 22:15
 * @version 0.3.1
 * @lastModified 2026-01-14 22:34
 *
 * 本来想在版本 v0.3.1 中使用，但是后来放弃了这个想法
 */

import { dirname } from 'node:path';
import * as vscode from 'vscode';

/**
 * ## 工作区
 */
export class WorkSpaceUtils {
  /**
   *
   * @param _editor 文本编辑器
   * @returns 返回获取到的工作区的根（打开文件夹），没有文本编辑器返回 `undefined`
   */
  static getActiveRootPath(_editor?: vscode.TextEditor): string | undefined {
    const editor = _editor || vscode.window.activeTextEditor;
    if (!editor) return undefined;

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(
      editor.document.uri,
    );
    if (workspaceFolder) return workspaceFolder.uri.fsPath;

    // 无工作区青情况： 返回文件所在的目录作为“根”
    return dirname(editor.document.uri.fsPath);
  }

  /**
   * 获取所有工作区的根路径
   * @returns 根路径数组
   */
  static getAllRootPaths(): string[] {
    return vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders.map(folder => folder.uri.path)
      : [];
  }

  /**
   * 监听工作区变化
   * @param callback 回调方法
   * @returns 返回一个可 `push` 进 `context.subscriptions` 的 `vscode.Disposable`
   */
  static onWorkspaceFoldersChanged(
    callback: (event: vscode.WorkspaceFoldersChangeEvent) => void,
  ) {
    return vscode.workspace.onDidChangeWorkspaceFolders(callback);
  }
}
