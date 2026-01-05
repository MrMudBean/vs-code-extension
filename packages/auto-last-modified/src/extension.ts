/**
 *
 * [microsoft vs code extension api](https://code.visualstudio.com/api/get-started/extension-anatomy)
 */
import { colorText, magentaPen, randomPen, yellowPen } from 'color-pen';
import * as vscode from 'vscode';
import { registerCommand, showInformationMessage } from 'zza';
import { setAuthorInfo } from './authorInfo.js';
import { changeFileIsEmpty } from './changeFileIsEmpty.js';
import { isCn, setContext } from './context.js';
import {
  buildFileHeaderOnActiveTextEditor,
  insertFileHeader,
} from './insertFileHeader.js';
import { updateFileHeader } from './updateFileHeader.js';

/**
 * ## 扩展的入口函数
 *
 * 该方法将在插件被激活时触发，也会在首次打开编辑器窗口时触发
 * @param context 上下文
 */
export async function activate(context: vscode.ExtensionContext) {
  const packageJSON = context.extension.packageJSON;
  sayHello(packageJSON); // 扩展激活欢迎语
  setContext(context); // 设置扩展上下文

  //  当当前活动的文本编辑器发生变化时，更新注册变量控制右键功能键的显示
  vscode.window.onDidChangeActiveTextEditor(editor => {
    changeFileIsEmpty(editor?.document);
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

  const resetExtensionData = registerCommand({
    name: 'autoLastModified.resetExtensionData',
    callback: async () => {
      await setAuthorInfo();
    },
  });

  // 监听“即将保存”事件
  const onWillSave = vscode.workspace.onWillSaveTextDocument(event => {
    const document = event.document;
    // 使用 waitUntil 却被本次修改本包含于本次修改中
    event.waitUntil(updateFileHeader(document));
    changeFileIsEmpty(document); // 重要：在保存时更新状态
  });

  // 空白文档新建文件头事件
  const createHeader = vscode.workspace.onDidOpenTextDocument(document => {
    insertFileHeader(document);
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

  // 激活插件是检测当前已打开的（当前活跃）文档（防止遗漏）
  if (vscode.window.activeTextEditor) {
    const document = vscode.window.activeTextEditor.document;
    await setAuthorInfo();
    // 使用当前的额激活的文档触发自动添加文档头注释
    await insertFileHeader(document);
    // 初始化时激活当前文档是否应展示菜单项
    changeFileIsEmpty(document);
  }
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
 * @param packageJSON 配置文件
 */
function sayHello(packageJSON: any) {
  console.log('');
  console.log(
    ...colorText(
      `${magentaPen`扩展 「${randomPen(packageJSON.name)}(${packageJSON.displayName})」 开启`}${yellowPen`成功 ！！`}`,
    ),
  );
  console.log('');
}
