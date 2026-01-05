import * as vscode from 'vscode';

/**
 * ## 获取用户配置文件
 * @returns 用户的配置文件
 */
export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('autoLastModified');
}

/**
 * ## 获取设定的用户名
 * @returns 获取设定的用户名
 */
export const authorName = () => getConfig().get<string>('authorName', '');

/**
 * ## 获取用户设定的邮箱
 * @returns 获取到的用户邮箱
 */
export const authorEmail = () => getConfig().get<string>('authorEmail', '');

/**
 * ## 获取用户设定自动插入空文档
 * @returns 用户设定自动插入状态
 */
export const autoInsert = () =>
  getConfig().get<boolean>('autoInsertOnNewFile', true);

/**
 * ## 用户设定的日期格式
 * @returns 用户设定的日期格式
 */
export const dateFormat = () =>
  getConfig().get<string>('dateFormat', 'YYYY-MM-DD');

/**
 * 格式化后的当前日期
 * @returns 当前的日期
 */
export function currentDate() {
  const date_format = dateFormat(); // 用户输入的格式
  const now_time = new Date();
  const now_year = now_time.getFullYear().toString();
  const now_month = (now_time.getMonth() + 1).toString().padStart(2, '0');
  const now_date = now_time.getDate().toString().padStart(2, '0');

  return date_format
    .replace(/YYYY/, now_year)
    .replace(/MM/, now_month)
    .replace(/DD/, now_date);
}

/**
 * 更新日期的字段（使用还需要结合 isMdx ）
 * @returns 更新设定标签
 */
export const updatedTag = () =>
  getConfig().get<string>('updatedTag', 'updated') || 'updated';

export const mdxHeaderType = () =>
  getConfig().get<'page' | 'blog'>('mdxHeaderType', 'page') || 'page';

/**
 * 配置值
 */
export const vsCodeConfig = {
  /** 获取用户的用户名 */
  authorName,
  /** 获取获取到的用户邮箱地址 */
  authorEmail,
  /** 是否自动插入空文档 */
  autoInsert,
  /** 当前配置日期格式 */
  dateFormat,
  /** 格式化后的当前日期 */
  currentDate,
  /** 更新日期的字段（使用还需结合 isMdx ） */
  updatedTag,
  /** 默认构建的 Mdx 的文件头类型 */
  mdxHeaderType,
};
