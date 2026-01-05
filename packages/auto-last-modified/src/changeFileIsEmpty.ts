import * as vscode from 'vscode';

/**
 * 更改文本文档的对菜单栏变量
 * @param document 文本文档
 */
export function changeFileIsEmpty(document: vscode.TextDocument | undefined) {
  const isDocEmpty = document?.getText().trim().length === 0 || false;
  // 注册变量： editorIsEmptyDoc ➞ 可在 when 表达式中直接使用
  vscode.commands.executeCommand(
    'setContext',
    'autoLastModified.editorIsEmptyDoc',
    isDocEmpty,
  );
}
