import { basename } from 'node:path';
import { isBusinessEmptyString } from 'a-type-of-js';
import * as vscode from 'vscode';
import { print, printError } from 'zza';
import { DocumentMeta } from './class-document-meta';
import { currentDate, vsCodeConfig } from './get-config';
import { getAuthorInfo } from './util-author-info';

// =================== 编辑操作类 ===========================

const unFoundResponse = [1, 0] as [1, 0];

const maxLineNumbers = 30;
/** 匹配在 markdown 中的正则字符串 */
const dateRegexpStr = '^(\\s+date\\s*[:：]?\\s*)(.*)$';
/** 查找文件正则 */
const fileNameRegexp = new RegExp('^(\\s*\\*\\s*@file\\s*[:：]?\\s)(.*)$', 'i');

// 匹配 ` author: `
const authorRegexp = new RegExp('^(\\s+author\\s*[:：]?\\s*)(.*)$', 'i');
/**
 * 编辑操作类，仅负责 vs Code 的文本编辑操作，无状态/模版逻辑
 */
export class HeaderEditor {
  /**
   * 文档编辑器
   * @returns 文档编辑器
   */
  get editor() {
    return (
      this._editor ||
      vscode.window.visibleTextEditors.find(
        i => i.document === this.meta.document,
      )
    );
  }

  /**
   *
   * @param meta 文本文档元信息
   * @param _editor vscode 编辑器
   */
  constructor(
    private readonly meta: DocumentMeta, // 依赖注入元信息
    private readonly _editor?: vscode.TextEditor, // 编辑器实例
  ) {}

  /**
   * ## 插入文件头
   * 插入完成后将自动更新状态
   * @param template 模版字符串
   */
  async insertHeader(template: string): Promise<void> {
    if (!this.editor || !this.meta.document) {
      const msg = `插入头部文件头时，未能正确获取编辑器/文档实例 : ${!this.editor ? 'editor 编译器未获取' : 'document 文档未正确获取'}`;
      printError(msg);
      // throw new RangeError(msg);
      return;
    }

    await safeExecute(async () => {
      if (!this.editor) return;

      await this.editor.edit(editBuilder => {
        const fullRange = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, 0),
        );
        editBuilder.replace(fullRange, template);
      });
    }, '初始化空文件夹失败');

    this.meta.checkIsEmpty(); // 重要：更改右键状态
    print(`插入文件头事件完成： ${this.meta.normalizedFilePath}`);
  }

  /**
   * 更新文件头
   */
  async updateHeaderFields(): Promise<void> {
    if (!this.meta.document) {
      const msg = '自动更新文件头没有找到文档';
      printError(msg);
      // throw new RangeError(msg);
      return;
    }

    const doc = this.meta.document;
    const filePath = this.meta.normalizedFilePath;
    // 前置校验
    if (
      doc.isUntitled || // 文件未命名
      doc.isDirty === false || // 文件是干净的
      this.editor?.document !== doc || // 当前活动窗口已非保存时的窗口
      !this.meta.isEffective // 非有效环境
    ) {
      console.warn(
        `不满足自动更新文件头： ${doc.isUntitled ? '文件未命名' : doc.isDirty === false ? '文件不干净' : this.editor?.document !== doc ? '当前文档非当前编译器文档' : '当前非有效文件环境' + this.meta.langId}`,
      );
      // 不满足条件直接退出
      return;
    }
    print(`更新文件头事件触发：${filePath}`);
    // 查找注释位置
    const [startLine, endLine] = this.checkHasHeaderComment();
    if (startLine > endLine) return; // 不满足条件
    const edit = new vscode.WorkspaceEdit();
    this.editLastModified(startLine, endLine, edit);
    if (this.meta.isMarkDown) {
      this.editAuthor(startLine, endLine, edit);
    }
    if (this.meta.isJs) {
      this.editFileName(startLine, endLine, edit);
    }
    await vscode.workspace.applyEdit(edit);
    print(`更新文件头事件完成：${filePath}`);
    // 更新文件头，文件是否空状态没有改变
  }

  /**
   * @returns 找到的头部注释的位置 [startPosition, endPosition] ,找不到返回 [1 , 0]
   */
  private checkHasHeaderComment(): [number, number] {
    const doc = this.meta.document;

    let startLine = -1;
    let endLine = -1;
    // 扫描前 30 行，寻找文件头注释块
    for (let i = 0; i < Math.min(maxLineNumbers, doc.lineCount); i++) {
      const lineText = doc.lineAt(i).text.trim();
      const isMarkLine = '---' === lineText;
      // 检测是否是注释块开始 /** 或 /*
      if (
        startLine === -1 &&
        (this.meta.isMarkDown ? isMarkLine : lineText.startsWith('/**'))
      ) {
        startLine = i;
        continue;
      }
      if (
        startLine !== -1 &&
        (this.meta.isMarkDown ? isMarkLine : lineText.endsWith('*/'))
      ) {
        endLine = i;
        break;
      }
    }
    return startLine === -1 || endLine === -1
      ? // 未找到文件头
        unFoundResponse
      : [startLine, endLine];
  }

  /**
   *
   * @param startLine 开始行数
   * @param endLine 结束行数
   * @param edit 文本编辑
   */
  private editLastModified(
    startLine: number,
    endLine: number,
    edit: vscode.WorkspaceEdit,
  ) {
    const tagName = vsCodeConfig.lastModifiedTag();
    // 构建正则：匹配 @lastModified: ... 或 @lastModified ...
    const dateRegex = new RegExp(
      this.meta.isMarkDown
        ? dateRegexpStr
        : `^(\\s*\\*\\s*@${tagName}\\s*[:：]?\\s*)(.*)$`,
      'i',
    );

    // 在注释块中查找 @lastModified 行
    for (let i = startLine; i <= endLine; i++) {
      const lineText = this.meta.document.lineAt(i).text; // 行文本
      const matchDate = lineText.match(dateRegex); // 获取旧日期
      if (!matchDate) continue;

      const oldValue = matchDate[2]; // 旧的日期
      const newValue = currentDate(); // 新的当前日期
      // 如果日期没变，跳过
      if (oldValue === newValue) break;

      let prefix: string = getPrefix(matchDate); // 构造新行
      this.updateLine(i, `${prefix}${newValue}`, edit);
      print(`更新 @${tagName} 为新日期： ${newValue}`);
      break;
    }
  }

  /**
   * ## 在指定行区域内查找特定的人名并替换
   * @param startLine 开始行
   * @param endLine 结束的行
   * @param edit 工作区编译器
   */
  private editAuthor(
    startLine: number,
    endLine: number,
    edit: vscode.WorkspaceEdit,
  ) {
    for (let i = startLine; i <= endLine; i++) {
      const lineText = this.meta.document.lineAt(i).text;
      const matchAuthor = lineText.match(authorRegexp);
      if (!matchAuthor) continue;

      const oldAuthor = matchAuthor[2];
      const newAuthor = getAuthorInfo().name.trim();
      if (oldAuthor === newAuthor) break;

      let prefix: string = getPrefix(matchAuthor);
      this.updateLine(i, `${prefix}${newAuthor}`, edit);
      print(`更新最后用户：${oldAuthor}  ➞  ${newAuthor}`);
      break;
    }
  }

  /**
   *
   * @param startLine 开始的行
   * @param endLine 结束的行
   * @param edit 工作区编辑器
   */
  private editFileName(
    startLine: number,
    endLine: number,
    edit: vscode.WorkspaceEdit,
  ) {
    const filePath = this.meta.normalizedFilePath; // 文件路径
    const fileName = basename(filePath); // 文件名
    for (let i = startLine; i <= endLine; i++) {
      const lineText = this.meta.document.lineAt(i).text; // 行文本
      const matchFileName = lineText.match(fileNameRegexp);
      if (!matchFileName) continue;

      const oldFileName = matchFileName[2]; // 旧的文本地址
      if (oldFileName === fileName && !isBusinessEmptyString(fileName)) break;

      let prefix: string = getPrefix(matchFileName);
      this.updateLine(i, `${prefix}${fileName}`, edit); // 更新行
      print(`更新文本名：${oldFileName} ➞ ${fileName}`);
      break;
    }
  }

  /**
   * @param lineNumber 行数
   * @param newLineText 新行文本
   * @param edit 工作空间编辑者
   */
  private updateLine(
    lineNumber: number,
    newLineText: string,
    edit: vscode.WorkspaceEdit,
  ) {
    const originLine = this.meta.document.lineAt(lineNumber);
    edit.replace(
      this.meta.document.uri,
      new vscode.Range(originLine.range.start, originLine.range.end),
      newLineText,
    );
  }
}
/**
 * ## 获取前置文本
 * @param matchResponse 正则匹配对象
 * @returns 返回文本
 */
function getPrefix(matchResponse: RegExpMatchArray): string {
  let prefix: string = matchResponse[1] || '';
  prefix = prefix.replace(/(\S)$/, '$1 ').replace(/\s+$/, ' ');
  return prefix;
}

/**
 * ## 安全执行
 * @param fn 执行回调方法
 * @param errorMessage 错误信息
 * @returns 执行成功时返回回调方法自身的返回值，执行失败返回 null
 */
async function safeExecute(fn: Function, errorMessage: string) {
  try {
    return await fn();
  } catch (error) {
    printError(`${errorMessage}: ${(error as Error).message}`);
    console.error(errorMessage, error);
    return null;
  }
}
