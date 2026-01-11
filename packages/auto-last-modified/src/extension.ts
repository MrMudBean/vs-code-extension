import path from 'node:path';
import { colorText, magentaPen, randomPen, yellowPen } from 'color-pen';
import * as vscode from 'vscode';
import { registerCommand, setOutPutChannel, showInformationMessage } from 'zza';
import { setAuthorInfo } from './authorInfo.js';
import {
  checkCurrentDocumentIsEmpty,
  currentDocumentIsEmpty,
} from './checkCurrentDocumentIsEmpty.js';
import {
  extensionContext,
  isCn,
  setContext,
  setCurrentDocument,
} from './context.js';
import {
  autoInsertFileHeader,
  buildFileHeaderOnActiveTextEditor,
} from './insertFileHeader.js';
import { updateFileHeader } from './updateFileHeader.js';

/**
 * ## 扩展的入口函数
 *
 * 该方法将在插件被激活时触发，也会在首次打开编辑器窗口时触发
 * @param context 上下文
 */
export async function activate(context: vscode.ExtensionContext) {
  setOutPutChannel('Auto Last Modified');
  setContext(context); // 设置扩展上下文
  sayHello(); // 扩展激活欢迎语

  //  当当前活动的文本编辑器发生变化时，更新注册变量控制右键功能键的显示
  vscode.window.onDidChangeActiveTextEditor(async editor => {
    setCurrentDocument(editor?.document); // 重要：设置当前文本文档
    // 使用当前的额激活的文档触发自动添加文档头注释
    await autoInsertFileHeader();
    checkCurrentDocumentIsEmpty();
  });

  // 注册在 JS/JSX/TS/TSX 中构建文件头事件
  const createJSHeaderComment = registerCommand({
    name: 'autoLastModified.createJavaScriptHeaderComment',
    callback: buildFileHeaderOnActiveTextEditor,
  });

  // 注册在 mdx/markdown 中构建默认类型的文件头事件
  const createMarkdownHeaderComment = registerCommand({
    name: 'autoLastModified.createMdxHeaderComment',
    callback: buildFileHeaderOnActiveTextEditor,
  });

  // 注册在 mdx/markdown 中构建 page 类型的文件头事件
  const crateMarkdownPageModeHeaderComment = registerCommand({
    name: 'autoLastModified.createMdxPageHeaderComment',
    callback: () => {
      buildFileHeaderOnActiveTextEditor('page');
    },
  });

  // 注册在 mdx/markdown 中构建 blog 类型的文件头事件
  const createMarkdownBlogModeHeaderComment = registerCommand({
    name: 'autoLastModified.createMdxBlogHeaderComment',
    callback: () => {
      buildFileHeaderOnActiveTextEditor('blog');
    },
  });

  /** 重启扩展 */
  const resetExtensionData = registerCommand({
    name: 'autoLastModified.resetExtensionData',
    callback: () => {
      setAuthorInfo();
    },
  });

  // 监听“即将保存”事件
  const onWillSave = vscode.workspace.onWillSaveTextDocument(event => {
    setCurrentDocument(event.document);
    checkCurrentDocumentIsEmpty(); // 重要：在保存时更新状态
    if (currentDocumentIsEmpty) {
      event.waitUntil(autoInsertFileHeader()); // 空文件执行插入
    } else {
      // 使用 waitUntil 却被本次修改本包含于本次修改中
      event.waitUntil(updateFileHeader()); // 同步事件
    }
    checkCurrentDocumentIsEmpty(); // 重要：在保存时更新状态
  });

  // 空白文档新建文件头事件
  const createHeader = vscode.workspace.onDidOpenTextDocument(document => {
    setCurrentDocument(document);
    autoInsertFileHeader();
  });

  // 注册回调
  context.subscriptions.push(
    createHeader,
    onWillSave,
    resetExtensionData,
    createJSHeaderComment,
    createMarkdownHeaderComment,
    crateMarkdownPageModeHeaderComment,
    createMarkdownBlogModeHeaderComment,
  );

  await setAuthorInfo();
  // 激活插件是检测当前已打开的（当前活跃）文档（防止遗漏）
  if (vscode.window.activeTextEditor) {
    setCurrentDocument(vscode.window.activeTextEditor.document);
    // 使用当前的额激活的文档触发自动添加文档头注释
    await autoInsertFileHeader();
    // 初始化时激活当前文档是否应展示菜单项
    checkCurrentDocumentIsEmpty();
  }

  console.log('当前的路径：', path.resolve(), process);
  console.log('当前的执行环境', process.env);
}

/**
 * 扩展被停用时调用该方法
 */
export function deactivate() {
  showInformationMessage(
    isCn ? '拜拜了您嘞' : 'Looking forward to seeing you again ! Bye-bye !!',
  );
}

/**
 * 扩展激活语
 */
function sayHello() {
  const packageJSON = extensionContext.extension.packageJSON;

  console.log('');
  console.log(
    ...colorText(
      `${magentaPen`扩展 「${randomPen(packageJSON.name)}(${packageJSON.displayName})」 开启`}${yellowPen`成功 ！！`}`,
    ),
  );
  console.log('');
}
