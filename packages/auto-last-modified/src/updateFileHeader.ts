import {
  bgBrightBlackPen,
  bluePen,
  brightGreenPen,
  colorText,
  randomPen,
  yellowPen,
} from 'color-pen';
import * as vscode from 'vscode';
import { print } from 'zza';
import { getAuthorInfo } from './authorInfo';
import { currentDocument } from './context';
import { currentDate, vsCodeConfig } from './getConfig';
import { isJs, isMarkdown, isMdx } from './getLang';

/**
 * 更新文件头注释中指定字段的日期
 * @returns void
 */
export async function updateFileHeader() {
  if (!currentDocument) return;
  const editor = vscode.window.activeTextEditor; // 活动文本编辑器
  /** 当前为 .mdx/.md 文档 */
  const mdxDoc = isMdx() || isMarkdown(); // markdown 类型文档
  const isEffectiveDoc = mdxDoc || isJs(); // 有效文档类型
  if (
    currentDocument.isUntitled || // 文件未命名
    currentDocument.isDirty === false || // 文件是干净的
    !editor || // 但前编译器
    editor.document !== currentDocument || // 当前活动窗口已非保存时的窗口
    !isEffectiveDoc // 非有效环境
  ) {
    // 不满足条件直接退出
    return;
  }

  // 查找注释位置
  const [startLine, endLine] = checkHasHeaderComment(mdxDoc);
  if (startLine > endLine) return; // 不满足条件

  const tagName = vsCodeConfig.lastModifiedTag();

  // 构建正则：匹配 @lastModified: ... 或 @lastModified ...
  const dateRegex = new RegExp(
    mdxDoc
      ? '^(\\s+date\\s*[:：]?\\s*)(.*)$'
      : `^(\\s*\\*\\s*@${tagName}\\s*[:：]?\\s*)(.*)$`,
    'i',
  );
  // 匹配 ` author: `
  const authorRegexp = new RegExp('^(\\s+author\\s*[:：]?\\s*)(.*)$', 'i');

  let findDate = false,
    findAuthor = false;

  // 在注释块中查找 @lastModified 行
  for (let i = startLine; i <= endLine; i++) {
    const line = currentDocument.lineAt(i); // 行数据
    // eslint-disable-next-line jsdoc/check-tag-names
    /**  @ts-ignore: 兼容 mdx 文件  */
    const matchDate = line[mdxDoc ? 'b' : 'text'].match(dateRegex); // 获取旧日期
    if (matchDate) {
      findDate = true;
      const oldValue = matchDate[2].trim(); // 旧的日期
      const newValue = currentDate(); // 新的当前日期
      // 如果日期没变，跳过
      if (oldValue === newValue) {
        if (mdxDoc && !findAuthor) {
          continue;
        } else {
          break;
        }
      }
      let prefix: string = matchDate[1]; // 构造新行
      prefix = prefix.replace(/(\S)$/, '$1 '); // 没有空格就追加空格
      await updateLine(line, `${prefix}${newValue}`);
      print(
        ...colorText(
          `更新 ${currentDocument.fileName} @${yellowPen(tagName)} 为新日期： ${randomPen(newValue)}`,
        ),
      );
      if (mdxDoc && !findAuthor) {
        continue;
      } else {
        break;
      }
    }
    // eslint-disable-next-line jsdoc/check-tag-names
    /**  @ts-ignore: 故意的  */
    const matchAuthor = line[mdxDoc ? 'b' : 'text'].match(authorRegexp);
    if (matchAuthor) {
      findAuthor = true;
      const oldAuthor = matchAuthor[2].trim(); // 旧人
      const newAuthor = getAuthorInfo().name.trim(); // 新人
      if (oldAuthor === newAuthor) {
        if (mdxDoc && !findDate) {
          continue;
        } else {
          break;
        }
      }
      let prefix: string = matchAuthor[1];
      prefix = prefix.replace(/(\S)$/, '$1 ');
      await updateLine(line, `${prefix}${newAuthor}`);
      print(
        ...colorText(
          `更新最后更新用户 ${bgBrightBlackPen(oldAuthor)} ${bluePen`➞`} ${brightGreenPen(newAuthor)}`,
        ),
      );

      if (mdxDoc && !findDate) {
        continue;
      } else {
        break;
      }
    }
  }

  // TODO ：如果没找到 @lastModified ，可以选择插入
}

/**
 * @param originLine 原始行数据
 * @param newLineText 新行文本
 */
async function updateLine(originLine: vscode.TextLine, newLineText: string) {
  if (!currentDocument) return;
  // 替换该行
  const edit = new vscode.WorkspaceEdit();
  edit.replace(
    currentDocument.uri,
    new vscode.Range(originLine.range.start, originLine.range.end),
    newLineText,
  );

  await vscode.workspace.applyEdit(edit);
}

/**
 *
 * @param mdxDoc 是否是 markdown 文档
 * @returns 找到的头部注释的位置 [startPosition, endPosition] ,找不到返回 [1 , 0]
 */
function checkHasHeaderComment(mdxDoc: boolean): [number, number] {
  const unFoundResponse = [1, 0] as [number, number];
  if (!currentDocument) return unFoundResponse;
  let startLine = -1;
  let endLine = -1;
  // 扫描前 30 行，寻找文件头注释块
  for (let i = 0; i < Math.min(30, currentDocument.lineCount); i++) {
    const lineText = currentDocument.lineAt(i).text.trim();
    const isMarkLine = '---' === lineText;
    // 检测是否是注释块开始 /** 或 /*
    if (
      startLine === -1 &&
      (mdxDoc ? isMarkLine : lineText.startsWith('/**'))
    ) {
      startLine = i;
      continue;
    }
    if (startLine !== -1 && (mdxDoc ? isMarkLine : lineText.endsWith('*/'))) {
      endLine = i;
      break;
    }
  }
  if (startLine === -1 || endLine === -1) {
    return unFoundResponse; // 未找到文件头
  }

  return [startLine, endLine];
}
