import { colorText, randomPen, yellowPen } from 'color-pen';
import * as vscode from 'vscode';
import { print } from 'zza';
import { currentDate, vsCodeConfig } from './getConfig';
import { isJs, isMarkdown, isMdx } from './getLang';

/**
 * 更新文件头注释中指定字段的日期
 * @param document 文档上下文
 * @returns void
 */
export async function updateFileHeader(document: vscode.TextDocument) {
  const editor = vscode.window.activeTextEditor; // 活动文本编辑器
  const mdxDoc = isMdx(document) || isMarkdown(document); // markdown 类型文档
  const isEffectiveDoc = mdxDoc || isJs(document); // 有效文档类型
  if (
    document.isUntitled || // 文件未命名
    document.isDirty === false || // 文件是干净的
    !editor || // 但前编译器
    editor.document !== document || // 当前活动窗口已非保存时的窗口
    !isEffectiveDoc // 非有效环境
  ) {
    // 不满足条件直接退出
    return;
  }

  const tagName = mdxDoc ? 'last_update' : vsCodeConfig.updatedTag();

  // 构建正则：匹配 @updated: ... 或 @updated ...
  const tagRegex = new RegExp(
    mdxDoc
      ? `^(\\s*${tagName}\\s*[:：]?\\s*)(.*)$`
      : `^(\\s*\\*\\s*@${tagName}\\s*[:：]?\\s*)(.*)$`,
    'i',
  );

  let startLine = -1;
  let endLine = -1;
  // 扫描前 30 行，寻找文件头注释块
  for (let i = 0; i < Math.min(30, document.lineCount); i++) {
    const lineText = document.lineAt(i).text.trim();
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
    return; // 未找到文件头
  }

  // 在注释块中查找 @updated 行
  for (let i = startLine; i <= endLine; i++) {
    const line = document.lineAt(i); // 行数据
    // eslint-disable-next-line jsdoc/check-tag-names
    /**  @ts-ignore: 兼容 mdx 文件  */
    const match = line[mdxDoc ? 'b' : 'text'].match(tagRegex); // 获取旧日期
    if (!match) {
      continue; // 没有匹配则退出本次循环
    }
    const oldValue = match[2].trim(); // 旧的日期
    const newValue = currentDate(); // 新的当前日期
    // 如果日期没变，跳过
    if (oldValue === newValue) {
      return;
    }

    // 构造新行
    let prefix: string = match[1];
    prefix = prefix.replace(/(\S)$/, '$1 ');
    const newLine = `${prefix}${newValue}`;

    // 替换该行
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(line.range.start, line.range.end),
      newLine,
    );

    await vscode.workspace.applyEdit(edit);

    print(
      ...colorText(
        `更新 ${document.fileName} @${yellowPen(tagName)} 为新日期： ${randomPen(newValue)}`,
      ),
    );
    return;
  }

  // 可选：如果没找到 @updated，可以选择插入（这里暂不实现）
}
