/**
 * @module class-current-document
 * @file class-current-document.ts
 * @description 通过类构建实例，避免共享全局数据导致数据混乱
 * @author MrMudBean <Mr.MudBean@outlook.com>
 * @copyright  2026 ©️ MrMudBean
 * @date 2026-01-13 11:34
 * @version 0.3.1
 * @lastModified 2026-01-14 21:09
 */
import * as vscode from 'vscode';
import { print, printError, printWarn } from 'zza';
import { DocumentMeta } from './class-document-meta';
import { HeaderEditor } from './class-header-editor';
import { TemplateService } from './class-template-service';
import { DocumentTemplateType } from './enum-document-template-type';
import { allowInsertOnEmptyFileSave, autoInsert } from './get-config';

/**
 * ## 当前文档类
 * 作为协调者，组合三个子模块，对外暴露原有接口
 * 保持调用逻辑兼容，内部转发至子模块
 */
export class CurrentDocument {
  private readonly meta: DocumentMeta;
  private readonly templateService: TemplateService;
  private readonly headerEditor: HeaderEditor;

  readonly filePath: string;

  /**
   * 当前文档是否为空
   * @returns 文档是否为（逻辑）空
   */
  get isEmpty(): boolean {
    return this.meta.isEmpty;
  }

  /**
   * @param doc 执行的文本文档上下文
   * @param editor 可选属性，在命令式构建上下文中为已知文本编辑器
   */
  constructor(
    doc: vscode.TextDocument,
    private editor?: vscode.TextEditor,
  ) {
    if (!doc) {
      const msg = '实例化当前文档未正确获取文档';
      printError(msg);
      throw new RangeError(msg);
    }
    this.meta = new DocumentMeta(doc);
    try {
      this.templateService = new TemplateService(this.meta);
    } catch (error) {
      const msg = '初始化模版出错';
      console.error(msg, error);
      printError(msg);
      throw new RangeError(msg);
    }

    this.editor = editor;
    this.headerEditor = new HeaderEditor(this.meta, this.editor);

    this.meta.checkIsEmpty();
    this.filePath = this.meta?.normalizedFilePath || '';
  }

  /**
   * 自动插入
   */
  async autoInsertFileHeader() {
    const notAllowInsert = !autoInsert();
    const notEmpty = !this.meta.checkIsEmpty();
    if (
      notAllowInsert || // 不允许自动插入（用户手动关闭了该项）
      !this.meta.isEffective || // 当前非支持文档类型
      notEmpty || // 当前非新（空）文档
      (!allowInsertOnEmptyFileSave() && this.meta.document.isDirty) // 当前文档不干净
    ) {
      printWarn(
        `不符合要求退出插入：${notAllowInsert ? '🚫 不允许自动插入' : !this.meta.isEffective ? `🙅 非有效文档类型（${this.meta.langId}）` : notEmpty ? '📄 当前文档非空文档' : `🌚 当前是脏文件`} `,
      );
      // 不符合要求退出
      return;
    }

    const template = this.templateService.generateTemplate();
    await this.headerEditor.insertHeader(template);
  }

  /**
   * ## 命令触发主动构建文件头
   *
   * 由于是主动，当前尽能从当前活动的上下为编辑中获取文本文档
   *
   * **本方法内部实现设置当前文本文档上下文**
   * @param type 创建的标头类型，主要用于区别 docusaurus 的 page、blog 类型
   */
  async buildFileHeaderOnActiveTextEditor(type?: DocumentTemplateType) {
    if (!this.meta?.document) {
      const msg = '手动创建时未找到文档';
      printError(msg);
      // throw new RangeError(msg);
      return;
    }

    print(`命令式触发插入文件头事件开始执行：${this.meta?.normalizedFilePath}`);
    // 直接将该方法作为回调函数时，默认会给当前文档信息的值，但是并不是要的
    this.templateService.setTemplateType(type || DocumentTemplateType.Plain);
    const template = this.templateService.generateTemplate();

    await this.headerEditor.insertHeader(template);
  }

  /**
   * 更新文件头
   */
  async updateFileHeader(): Promise<void> {
    await this.headerEditor.updateHeaderFields();
  }

  /**
   * ## 构建命令创建的类
   * 使用静态方法创建类
   * @param commandText 命令文本
   * @returns 返回空或者一个新的对象
   */
  static currentActiveTextEditor(commandText?: string): CurrentDocument | null {
    if (commandText) console.log(`触发登记事件：${commandText}`);

    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.document) return null;
    return new CurrentDocument(editor.document, editor);
  }
}
