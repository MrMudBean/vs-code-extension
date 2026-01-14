import { colorText, magentaPen, randomPen, yellowPen } from 'color-pen';
import * as vscode from 'vscode';
import {
  print,
  printWarn,
  registerCommand,
  setOutPutChannel,
  showInformationMessage,
} from 'zza';
import { CurrentDocument } from './class-current-document';
import { extensionContext, isCn, setContext } from './context.js';
import { CommandNameType } from './enum-command-name';
import { DocumentTemplateType } from './enum-document-template-type.js';
import { setAuthorInfo } from './util-author-info.js';

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

  // 注册回调
  context.subscriptions.push(
    ...registerCommandList(),
    ...registerWindowList(),
    ...registerWorkspaceList(),
  );

  await setAuthorInfo();
  // 激活插件是检测当前已打开的（当前活跃）文档（防止遗漏）
  if (vscode.window.activeTextEditor?.document) {
    const document = vscode.window.activeTextEditor.document;
    const currentDocument = new CurrentDocument(document);
    console.log('初始化某些设定');
    // 使用当前的额激活的文档触发自动添加文档头注释
    await currentDocument.autoInsertFileHeader();
  }
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    const rootPath = workspaceFolder.uri.fsPath;
    console.log('工作区：', vscode.workspace.workspaceFolders);
    console.log('工作区跟路径', rootPath);
  } else {
    console.log('当前没有打开的工作区文件夹');
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
 * @returns 注册的命令列表
 */
function registerCommandList(): vscode.Disposable[] {
  return [
    // 注册在 JS/JSX/TS/TSX 中构建文件头事件
    registerCommand({
      name: CommandNameType.CREATE_JAVASCRIPT_HEADER,
      callback: () =>
        CurrentDocument.currentActiveTextEditor(
          CommandNameType.CREATE_JAVASCRIPT_HEADER,
        )?.buildFileHeaderOnActiveTextEditor(),
    }),

    // 注册在 mdx/markdown 中构建默认类型的文件头事件
    registerCommand({
      name: CommandNameType.CREATE_MDX_HEADER,
      callback: () =>
        CurrentDocument.currentActiveTextEditor(
          CommandNameType.CREATE_MDX_HEADER,
        )?.buildFileHeaderOnActiveTextEditor(),
    }),
    // 注册在 mdx/markdown 中构建 page 类型的文件头事件
    registerCommand({
      name: CommandNameType.CREATE_MDX_PAGE_HEADER,
      callback: () =>
        CurrentDocument.currentActiveTextEditor(
          CommandNameType.CREATE_MDX_PAGE_HEADER,
        )?.buildFileHeaderOnActiveTextEditor(DocumentTemplateType.Page),
    }),

    // 注册在 mdx/markdown 中构建 blog 类型的文件头事件
    registerCommand({
      name: CommandNameType.CREATE_MDX_BLOG_HEADER,
      callback: () =>
        CurrentDocument.currentActiveTextEditor(
          CommandNameType.CREATE_MDX_BLOG_HEADER,
        )?.buildFileHeaderOnActiveTextEditor(DocumentTemplateType.Blog),
    }),

    //  注册重启扩展事件
    registerCommand({
      name: CommandNameType.RESET_EXTENSION_DATA,
      callback: () => {
        setAuthorInfo();
      },
    }),
  ];
}

/**
 * @returns 注册的 window 事件
 */
function registerWindowList(): vscode.Disposable[] {
  return [
    //  当当前活动的文本编辑器发生变化时，更新注册变量控制右键功能键的显示
    vscode.window.onDidChangeActiveTextEditor(async editor => {
      if (!editor?.document) {
        printWarn('非标准环境跳过本次事件');
        return;
      }
      console.log(
        '当前触发了切换活动文本编辑类型：',
        editor?.document.languageId,
      );
      print(`触发编辑器切换活动文本编辑：${editor.document.fileName}`);
      const currentDocument = new CurrentDocument(editor.document, editor);
      // 使用当前的额激活的文档触发自动添加文档头注释
      await currentDocument.autoInsertFileHeader();
    }),
  ];
}
/**
 * @returns 注册的 workspace 事件
 */
function registerWorkspaceList(): vscode.Disposable[] {
  return [
    // 监听“即将保存”事件
    vscode.workspace.onWillSaveTextDocument(event => {
      // const reason = event.reason;
      // if (reason == 3) {
      //   // 失焦保存时不触发该事件
      //   return;
      // }
      console.log(event);
      if (!event?.document) {
        printWarn(`保存事件没有捕获到事件文档信息`);
        return;
      }

      const currentDocument = new CurrentDocument(event.document);
      print(`触发保存事件：${currentDocument.filePath}`);

      if (currentDocument.isEmpty) {
        event.waitUntil(currentDocument.autoInsertFileHeader()); // 空文件执行插入
      } else {
        // 使用 waitUntil 却被本次修改本包含于本次修改中
        event.waitUntil(currentDocument.updateFileHeader()); // 同步事件
      }
      currentDocument.isEmpty; // 重要：在保存时更新状态
    }),

    // 空白文档新建文件头事件
    vscode.workspace.onDidOpenTextDocument(document =>
      new CurrentDocument(document).autoInsertFileHeader(),
    ),
  ];
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
