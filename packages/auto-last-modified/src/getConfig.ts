import * as vscode from 'vscode';

/** 被提取的校验数组 */
const checkDataFormatArr: ['YYYY', 'MM', 'DD'] = ['YYYY', 'MM', 'DD'],
  /** 校验日期的时分秒的数组 */
  checkDataFormatTimeArr: ['hh', 'mm', 'ss'] = ['hh', 'mm', 'ss'],
  /** 默认的日期格式 */
  defaultDatFormat: 'YYYY-MM-DD' = 'YYYY-MM-DD',
  emptyArr: [] = [];

Object.freeze(emptyArr);

export { defaultDatFormat, emptyArr };

/**
 *
 * @param date 要处理的时间
 * @returns 除了后格式化的时间
 */
function formatDate(date: number): string {
  return date.toString().padStart(2, '0');
}

/**
 * ## 获取用户配置文件
 * @returns 用户的配置文件
 */
export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('autoLastModified');
}
/**
 *
 * @param key 获取的键
 * @param defaultValue 默认值
 * @returns 返回获取的值
 */
function _get<T>(
  /** 获取的键 */
  key: string,
  /** 默认值 */
  defaultValue: T,
) {
  return getConfig().get<T>(key, defaultValue) || defaultValue;
}

/**
 * ## 获取设定的用户名
 * @returns 获取设定的用户名
 */
export const authorName = () => _get<string>('authorName', '');

/**
 * ## 获取用户设定的邮箱
 * @returns 获取到的用户邮箱
 */
export const authorEmail = () => _get<string>('authorEmail', '');

/**
 * ## 获取用户设定自动插入空文档
 * @returns 用户设定自动插入状态
 */
export const autoInsert = () => _get<boolean>('autoInsertOnNewFile', true);

/**
 * ## 允许空文件保存时自动插入空文档
 * @returns 当前是否允许空文件保存时触发插入
 */
export const allowInsertOnEmptyFileSave = () =>
  _get<boolean>('allowInsertOnEmptyFileSave', false);

export const forciblyInsert = () => _get<boolean>('forciblyInsert', false);

/**
 * ## 用户设定的日期格式
 * @returns 用户设定的日期格式
 */
export const dateFormat = () => _get<string>('dateFormat', defaultDatFormat);

/**
 * 更新日期的字段（使用还需要结合 isMdx ）
 * @returns 更新设定标签
 */
export const lastModifiedTag = () =>
  _get<string>('lastModifiedTag', 'lastModified');

/**
 * @returns 获取到的 markdown 类型文件的默认构建类型
 */
export const mdxHeaderType = () =>
  _get<'page' | 'blog'>('mdxHeaderType', 'page');

/**
 * @returns 使用 js/ts/jsx/tsx 的普通模式路径
 */
export const useJsPlainStyle = () =>
  _get<string[]>('useJsPlainStyle', emptyArr);

/**
 *
 * @returns 使用 js/ts/jsx/tsx 的包文档模式路径
 */
export const usePackageDocumentationStyle = () =>
  _get<string[]>('usePackageDocumentationStyle', emptyArr);
/**
 * @returns 使用 md/mdx 的 doc 模式
 */
export const useMdDocStyle = () => _get<string[]>('useMdDocStyle', emptyArr);

/**
 * @returns 使用 md/mdx 的 blog 模式
 */
export const useMdBlogStyle = () => _get<string[]>('useMdBlogStyle', emptyArr);

/**  配置值  */
export const vsCodeConfig = {
  /** 获取用户的用户名 */
  authorName,
  /** 获取获取到的用户邮箱地址 */
  authorEmail,
  /** 是否自动插入空文档 */
  autoInsert,
  /** 允许空文件保存时触发插入 */
  allowInsertOnEmptyFileSave,
  /** 是否允许强制插入 */
  forciblyInsert,
  /** 当前配置日期格式 */
  dateFormat,
  /** 格式化后的当前日期 */
  currentDate,
  /** 更新日期的字段（使用还需结合 isMdx ） */
  lastModifiedTag,
  /** 默认构建的 Mdx 的文件头类型 */
  mdxHeaderType,
  /**  使用 js/ts/jsx/tsx 的普通模式路径 */
  useJsPlainStyle,
  /** 使用 js/ts/jsx/tsx 的包文档模式路径  */
  usePackageDocumentationStyle,
  /** 使用 markdown/mdx 的 doc 风格 */
  useMdDocStyle,
  /** 使用 markdown/mdx 的 blog 风格 */
  useMdBlogStyle,
};

/**
 * 格式化后的当前日期
 * @returns 当前的日期
 */
export function currentDate() {
  let date_format = dateFormat(); // 用户输入的格式
  date_format = checkDataFormatArr.some(e => !date_format.includes(e))
    ? defaultDatFormat
    : date_format;
  const now_time = new Date();
  const now_year = now_time.getFullYear().toString();
  const now_month = formatDate(now_time.getMonth() + 1);
  const now_date = formatDate(now_time.getDate());
  const now_hours = formatDate(now_time.getHours());
  const now_minutes = formatDate(now_time.getMinutes());
  const now_seconds = formatDate(now_time.getSeconds());

  // 若用户主动设置了 “时、分、秒”，将转化为实际的值
  if (checkDataFormatTimeArr.some(e => date_format.includes(e))) {
    return date_format
      .replace(/YYYY/, now_year)
      .replace(/MM/, now_month)
      .replace(/DD/, now_date)
      .replace(/hh/, now_hours)
      .replace(/mm/, now_minutes)
      .replace(/ss/, now_seconds);
  } else {
    return date_format
      .replace(/YYYY/, now_year)
      .replace(/MM/, now_month)
      .replace(/DD/, now_date);
  }
}
