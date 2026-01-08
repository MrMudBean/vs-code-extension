import * as vscode from 'vscode';
import { currentDocument } from './context';

/**
 * 更改文本文档的对菜单栏变量
 */
export function changeFileIsEmpty() {
  const isDocEmpty = currentDocument?.getText().trim().length === 0 || false;
  // 注册变量： editorIsEmptyDoc ➞ 可在 when 表达式中直接使用
  vscode.commands.executeCommand(
    'setContext',
    'autoLastModified.editorIsEmptyDoc',
    isDocEmpty,
  );
}
