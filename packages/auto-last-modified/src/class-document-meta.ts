/**
 * @module  _
 * @file class-document-meta.ts
 * @description _
 * @author MrMudBean <Mr.MudBean@outlook.com>
 * @copyright  2026 ©️ MrMudBean
 * @since 2026-01-14 13:02
 * @version 0.3.1
 * @lastModified 2026-01-14 16:00
 */
import { basename, posix } from 'node:path';
import * as vscode from 'vscode';
import { printError } from 'zza';
import { forciblyInsert } from './get-config';

// ======================= 元信息类（纯状态层） =================
/**
 * 文档元信息类：仅负责封装文档的状态、类型、路径等纯数据，无业务逻辑
 */
export class DocumentMeta {
  /** 标准化后的文件路径（统一用 / 分割）  */
  readonly normalizedFilePath: string;
  /** 文档是否为空 */
  isEmpty: boolean;
  /** 是否是 JS/TS/JSX/TSX 类型 */
  readonly isJs: boolean;
  /** 是否是 MDX 文件 */
  readonly isMdx: boolean;
  /** 是否是 MD 文件 */
  readonly isMd: boolean;
  /** 是否是 MDX/MD 文件 */
  readonly isMarkDown: boolean;
  /** 是否为支持的类型 */
  readonly isEffective: boolean;
  /** 文档语言 ID */
  readonly langId: string;

  /**
   *
   * @param doc 当前文本文档
   */
  constructor(private readonly doc: vscode.TextDocument) {
    if (!doc) {
      const msg = '实例化文档元信息时没找到文档';
      printError(msg);
      throw RangeError(msg);
    }

    this.langId = doc.languageId;
    // 》〉》〉》使用 path.posix 代替手动替换
    // this.#filename = this.#doc.fileName.split(sep).join('/');
    this.normalizedFilePath = posix.normalize(doc.fileName);
    // 《〈《〈《
    this.isEmpty = this.checkIsEmpty();
    this.isJs = this.#checkIsJs();
    this.isMdx = this.langId === 'mdx';
    this.isMd = this.langId === 'markdown';
    this.isMarkDown = this.isMd || this.isMdx;
    this.isEffective = this.isJs || this.isMarkDown;
  }

  /**
   * 校验当前是否是 JS/TS/TSX/JSX
   * @returns 是 js
   */
  #checkIsJs(): boolean {
    return [
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
    ].includes(this.langId);
  }

  /**
   * ## 校验当前文档是否为空
   * @returns 当前文档状态
   */
  checkIsEmpty() {
    const isEmpty = this.doc.getText().trim().length === 0 || false;
    // version 0.3.0 这里添加了非空文档的允许渲染
    // 注册变量： showCommand ➞ 可在 when 表达式中直接使用
    toggleShowCommandState(isEmpty);
    this.isEmpty = isEmpty;
    return isEmpty;
  }
  /**
   * 文件名（仅文件名，不含路径）
   * @returns 文件名
   */
  get fileName(): string {
    return basename(this.doc.fileName);
  }

  /**
   * 获取文档实例（只读）
   * @returns 文档实例
   */
  get document(): vscode.TextDocument {
    return this.doc;
  }
}
/**
 * ## 切换当前命令显示状态
 * @param isEmpty 是否是孔文档
 */
function toggleShowCommandState(isEmpty: boolean) {
  vscode.commands.executeCommand(
    'setContext',
    'autoLastModified.showCommand',
    isEmpty || forciblyInsert(),
  );
}
