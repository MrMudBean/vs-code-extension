import { runOtherCode } from 'a-node-tools';
import { extensionContext } from './context';
import { vsCodeConfig } from './get-config';

// 插件全局使用数据键 -- user-info
const key_userInfo = 'user-info';

export type UserInfo = {
  name: string;
  email: string;
};

/**
 * ## 设定用户的信息
 *
 * 触发时机：
 *
 * - 扩展在初始化的时候进行设定值
 * - 用户在使用使用重启命令
 */
export async function setAuthorInfo() {
  let authorName = vsCodeConfig.authorName(); // 主动设定的用户名
  let authorEmail = vsCodeConfig.authorEmail(); // 主动设定的用于邮箱
  // 没有主动设定值时从设备的 git 设置中获取用户名
  if (!authorName) {
    const res = await runOtherCode('git config --global user.name');
    if (res.success && res.data.trim()) {
      authorName = res.data.trim();
    }
  }
  // 没有主动设定邮箱值是从设备的 git 设置中获取用户邮箱
  if (!authorEmail) {
    const res = await runOtherCode('git config --global user.email');
    if (res.success && res.data.trim()) {
      authorEmail = res.data.trim();
    }
  }
  // 在用户名及用户邮箱存在时
  if (authorName && authorEmail) {
    const userInfo: UserInfo = {
      name: authorName || '',
      email: authorEmail || '',
    };
    extensionContext.globalState.update(key_userInfo, userInfo);
  }
}

/**
 *
 * @returns 用户的信息
 */
export function getAuthorInfo(): UserInfo {
  const authorName = vsCodeConfig.authorName(); // 用户名
  const authorEmail = vsCodeConfig.authorEmail(); // 用户邮箱
  // 用户名和用户邮箱都具备时直接返回
  if (authorName && authorEmail) {
    return {
      name: authorName,
      email: authorEmail,
    };
  }
  // 获取存储在全局状态的数据
  const authorInfo = extensionContext.globalState.get<UserInfo | undefined>(
    key_userInfo,
  );

  return {
    name: authorName || authorInfo?.name || '',
    email: authorEmail || authorInfo?.email || '',
  };
}
