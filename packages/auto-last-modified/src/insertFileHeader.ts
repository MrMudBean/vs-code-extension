import { basename, extname, sep } from 'node:path';
import * as vscode from 'vscode';
import { print, showErrorMessage } from 'zza';
import { getAuthorInfo } from './authorInfo';
import { changeFileIsEmpty } from './changeFileIsEmpty';
import {
  crossPlatformPath,
  currentDocument,
  setCurrentDocument,
} from './context';
import {
  autoInsert,
  currentDate,
  mdxHeaderType,
  useJsPlainStyle,
  useMdBlogStyle,
  useMdDocStyle,
  usePackageDocumentationStyle,
} from './getConfig';
import { isJs, isMarkdown, isMdx } from './getLang';

/**
 * ## 新建文件插入文件头
 *
 * 本文件主要起到了校验的作用，用以判定当前文档的编辑器
 */
export async function autoInsertFileHeader() {
  if (!currentDocument) {
    return;
  }
  /** MDX 文档类型 */
  const mdxDoc = isMdx();
  /** 有效的文档类型 */
  const isEffectiveDoc = mdxDoc || isJs();
  if (
    !autoInsert() || // 不允许自动插入（用户手动关闭了该项）
    !isEffectiveDoc || // 当前非支持文档类型
    currentDocument.getText().replace(/\s/g, '') !== '' || // 当前非新（空）文档
    currentDocument.isDirty // 当前文档不干净
  ) {
    // 不符合要求退出
    return;
  }
  //  使用延迟保证能正确获取当前的编辑
  setTimeout(() => {
    /** 当前编辑者 */
    const editor = vscode.window.visibleTextEditors.find(
      e => e.document === currentDocument,
    );

    if (!editor) {
      // 没有找到编辑者，可能文件过大或其他原因
      return;
    }
    // 构建文件头
    buildFileHeader({ editor });
  }, 248);
}

/**
 * ## 主动构建文件头
 *
 * 由于是主动，当前尽能从当前活动的上下为编辑中获取文本文档
 *
 * **本方法内部实现设置当前文本文档上下文**
 * @param type 创建的标头类型，主要用于区别 docusaurus 的 page、blog 类型
 */
export function buildFileHeaderOnActiveTextEditor(type?: 'page' | 'blog') {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document) return;
  setCurrentDocument(editor.document); // 重要：构建当前文本文档
  buildFileHeader({ editor, type });
}

type OptionType = 'plain' | 'package' | 'page' | 'blog';

type Option = {
  /** vscode 文本编辑 */
  editor: vscode.TextEditor;
  /** 可选参数：类型 */
  type?: OptionType;
};

/**
 * ## 文档构建者
 * @param editor 参数
 * @param editor.editor vscode 文本编辑
 * @param editor.type  创建的标头类型，主要用于区别 docusaurus 的 page、blog 类型
 * @returns Promise<void>
 */
async function buildFileHeader({ editor, type }: Option) {
  if (!currentDocument) {
    return print('没有找到 document');
  }

  let template = getTemplate({ type }); // 模版片段
  try {
    await editor.edit(editBuilder => {
      if (!currentDocument) return;
      const fullRange = new vscode.Range(
        new vscode.Position(0, 0),
        currentDocument.positionAt(currentDocument.getText().length),
      );
      editBuilder.replace(fullRange, template); // 替换文本
    });
    await currentDocument.save(); // 保存写入
  } catch (error: any) {
    console.error('初始化空文件失败', error);
    showErrorMessage(`初始化空文件失败： ${error.message}`);
  }
  changeFileIsEmpty(); // 重要：更改右键状态
}

/**
 * @param option 参数
 * @param option.type 选择的 markdown 的类型，主要针对 docusaurus 的 blog、page 类型
 * @returns 插入模版
 */
function getTemplate({
  type,
}: {
  /** 模版的类型 */
  type?: OptionType;
}): string {
  if (!currentDocument) {
    return '';
  }
  // 非手动触发
  type ??= checkCreateMode();
  const { name, email } = getAuthorInfo(); // 用于信息
  const filePath = currentDocument.fileName; // 文件路径
  const currentNow = currentDate(); // 当前的时间
  const isBlog = type === 'blog'; // 是否是 blog 模式
  const isPlain = type === 'plain'; // 是否是常规模式

  return !isJs()
    ? [
        '---',
        `title: ${basename(filePath, extname(filePath))}`, // 移除末尾的空格
        isBlog && `authors: [${name}]`,
        '# description: xx',
        isBlog && '# keys: []',
        'hide_title: true',
        `date: ${currentNow}`,
        `last_update:`,
        ` date: ${currentNow}`,
        ` author: ${name}`,
        // blog 模式不显示不支持的 pagination_prev
        !isBlog && 'pagination_prev: null',
        // blog 模式不显示不支持的 pagination_next
        !isBlog && 'pagination_next: null',
        '---',
        '',
        // 博客模式下显示摘要内容的标记
        // 该标记在 markdown 文件个 MDX 文件中不一致
        isBlog && (isMarkdown() ? '<!-- truncate  -->' : '{/* {truncate} */}'), // 插入摘要标记
      ]
        .filter(e => e !== false)
        .join('\n')
    : [
        '/**',
        ` * @file ${basename(filePath)}`,
        ' * @description xx',
        ` * @author ${name || '📇'} <${email || '📮'}>`,
        ' * @license MIT',
        ` * @copyright  ${new Date().getFullYear()} ©️ ${name || '📇'}`,
        !isPlain && ' * @packageDocumentation',
        ' * @module  xx',
        ` * @since ${currentNow}`,
        ` * @lastModified ${currentNow}`,
        ' **/',
      ]
        .filter(e => e !== false)
        .join('\n');
}

/**
 * @returns 返回加载的模式
 */
function checkCreateMode(): OptionType {
  if (isJs()) {
    return checkJsMode();
  } else {
    return checkMdMode();
  }
}

/**
 *
 * @returns js 规则
 */
function checkJsMode(): OptionType {
  if (!currentDocument) return 'plain'; // 容错
  const plainStyle = useJsPlainStyle(),
    packageStyle = usePackageDocumentationStyle(),
    // 转换文件路径，跨平台兼容
    documentPath = crossPlatformPath();
  // 校验没有规则，直接返回常规模式
  const minPackageLength = processingArray(packageStyle, documentPath);
  const minPlainLength = processingArray(plainStyle, documentPath);
  if (minPackageLength < minPlainLength) {
    return 'package'; // 常规模式未校验出或检验剩余值大于包文档模式
  } else {
    return 'plain';
  }
}

/**
 *  校验在 markdown/mdx 文件中使用
 * @returns 使用的 mdx 的模式
 */
function checkMdMode(): OptionType {
  if (!currentDocument) return 'page'; // 容错
  const docStyle = useMdDocStyle(),
    blogStyle = useMdBlogStyle(),
    documentPath = crossPlatformPath(); // 跨平台文件路径
  const settingMdxType = mdxHeaderType(); // 设定的 mdx/markdown 的类型
  const minBlogLength = processingArray(blogStyle, documentPath);
  const minDocLength = processingArray(docStyle, documentPath);
  if (minBlogLength < minDocLength) {
    return 'blog';
  } else {
    if (minDocLength === Infinity) {
      return settingMdxType;
    } else {
      return 'page';
    }
  }
}

/**
 *
 * @param arr 校验数组
 * @param pathStr 当前文档的路径
 * @returns 返回检验出剩余最小长度
 */
function processingArray(arr: string[], pathStr: string): number {
  return arr.reduce((previousValue, currentValue) => {
    const rulesAfterOrganization = currentValue
      .split(sep)
      .join('/')
      .replace(/[*]+/g, '.*');
    const rulerReg = new RegExp(rulesAfterOrganization + '(.*)$');
    const matchResponse = pathStr.match(rulerReg);

    // 未靶中
    if (matchResponse === null) {
      return previousValue;
    } else {
      // 返回较小值
      return Math.min(previousValue, matchResponse[1]?.length || Infinity);
    }
  }, Infinity);
}
