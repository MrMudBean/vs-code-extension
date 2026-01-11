import * as vscode from 'vscode';
import { print } from 'zza';
import { currentDocument } from './context';
import { forciblyInsert } from './getConfig';

/** 当前文档是否为空状态 */
export let currentDocumentIsEmpty = false;

/**
 * 更改文本文档的对菜单栏变量
 */
export function checkCurrentDocumentIsEmpty() {
  currentDocumentIsEmpty =
    currentDocument?.getText().trim().length === 0 || false;

  setShowCommand();
}

/**
 * 是否展示可执行命令
 */
function setShowCommand() {
  // version 0.3.0 这里添加了非空文档的允许渲染
  print(`当前是否允许显示 ${currentDocumentIsEmpty} ${forciblyInsert()}`);
  // 注册变量： showCommand ➞ 可在 when 表达式中直接使用
  vscode.commands.executeCommand(
    'setContext',
    'autoLastModified.showCommand',
    currentDocumentIsEmpty || forciblyInsert(),
  );
}
