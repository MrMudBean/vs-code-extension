/**
 * @module  _
 * @file class-template-service.ts
 * @description _
 * @author MrMudBean <Mr.MudBean@outlook.com>
 * @copyright  2026 ©️ MrMudBean
 * @since 2026-01-14 13:01
 * @version 0.3.1
 * @lastModified 2026-01-14 21:16
 */
import { basename, extname, posix } from 'node:path';
import { getPackageJsonSync } from 'a-node-tools';
import { print } from 'zza';
import { DocumentMeta } from './class-document-meta';
import { DocumentTemplateType } from './enum-document-template-type';
import {
  currentDate,
  mdxHeaderType,
  useJsPlainStyle,
  useMdBlogStyle,
  useMdDocStyle,
  usePackageDocumentationStyle,
} from './get-config';
import { getAuthorInfo } from './util-author-info';

// =================== 模版生成类（纯逻辑层） ==========================

/**
 * ## 模版
 */
export class TemplateService {
  /** 文档类型 */
  private templateType: DocumentTemplateType = DocumentTemplateType.Plain;
  /** 版本号 */
  private version: string;
  /**
   * ## 锁定模版类型
   * 限定数组优先，高于使用参数设定（但是仅限于 JS 类型文件）
   */
  private lockTemplateType: boolean = false;

  /**
   * 模块名称
   */
  private moduleName?: string;

  /**
   * ## 构建模版服务
   * @param meta 文档元信息
   * @param authorInfo 作者信息
   */
  constructor(
    private readonly meta: DocumentMeta, // 依赖注入元信息
    private readonly authorInfo = getAuthorInfo(), // 依赖注入作者信息
  ) {
    print('🔁 初始化模版信息');
    this.templateType = this.checkCreateMode();
    // 》〉》〉》
    //  之前 version 在 `constructor` 中注入 version
    // 但是构造函数的默认值计算时机要早于赋值的 `private readonly meta: DocumentMeta`
    // 而导致在 `this.getVersion()` 中 `this.meta` 值是 `undefined`
    // private readonly version = this.getVersion(); // 依赖注入版本号
    this.version = this.getVersion();
    // 《〈《〈《
    print('初始化模版信息：', this.templateType);
  }

  /**
   * 获取版本号信息
   * @returns 版本号
   */
  private getVersion(): string {
    console.log('初始化获取版本号：', this.meta?.normalizedFilePath);
    const packageJson = getPackageJsonSync(this.meta.normalizedFilePath);
    this.moduleName = packageJson?.content?.name || undefined;
    return packageJson?.content?.version || '';
  }

  /**
   * 校验当前的模版类型（Plain/Package/Page/Blog）
   * @returns 检测的类型
   */
  private checkCreateMode(): DocumentTemplateType {
    print(`当前是否为 js 类型文档：${this.meta.isJs}`);
    return this.meta.isJs ? this.checkJsMode() : this.checkMdMode();
  }

  /**
   * @returns js 规则
   */
  private checkJsMode(): DocumentTemplateType {
    const plainStyle = useJsPlainStyle(),
      packageStyle = usePackageDocumentationStyle();
    // 校验没有规则，直接返回常规模式
    const minPackageLength = processingArray(
      packageStyle,
      this.meta.normalizedFilePath,
    );
    const minPlainLength = processingArray(
      plainStyle,
      this.meta.normalizedFilePath,
    );
    this.lockedTemplateType([minPackageLength, minPlainLength]); // 检测到有配置项
    if (minPackageLength < minPlainLength) {
      return DocumentTemplateType.Package; // 常规模式未校验出或检验剩余值大于包文档模式
    } else {
      return DocumentTemplateType.Plain;
    }
  }

  /**
   *  校验在 markdown/mdx 文件中使用
   * @returns 使用的 mdx 的模式
   */
  private checkMdMode(): DocumentTemplateType {
    const docStyle = useMdDocStyle(),
      blogStyle = useMdBlogStyle();
    const settingMdxType = mdxHeaderType() as DocumentTemplateType; // 设定的 mdx/markdown 的类型
    const minBlogLength = processingArray(
      blogStyle,
      this.meta.normalizedFilePath,
    );
    const minDocLength = processingArray(
      docStyle,
      this.meta.normalizedFilePath,
    );
    // 》〉》〉》 仅在 JS 类型文件中强制锁定类型，在 markdown 文件中放行
    // this.lockedTemplateType([minBlogLength, minDocLength]);
    //《〈《〈《
    if (minBlogLength < minDocLength) {
      return DocumentTemplateType.Blog;
    } else {
      if (minDocLength === Infinity) {
        return settingMdxType;
      } else {
        return DocumentTemplateType.Page;
      }
    }
  }

  /**
   * 设置最终的文件头模型字符串
   * @returns 最终应用模版
   */
  generateTemplate(): string {
    const isBLog = this.templateType === DocumentTemplateType.Blog;
    const isPlain = this.templateType === DocumentTemplateType.Plain;
    const currentNow = currentDate();
    const { name, email } = this.authorInfo;

    return this.meta.isMarkDown
      ? this.generateMarkdownTemplate(isBLog, currentNow, name)
      : this.generateJSTemplate(isPlain, currentNow, name, email);
  }

  /**
   * @param arr 待校验的数组
   */
  private lockedTemplateType(arr: number[]) {
    if (arr.some(e => e !== Infinity)) this.lockTemplateType = true; // 检测到有配置项
  }

  /**
   * 设定文档类型（支持手动设定）
   * @param type 指定的类型
   */
  setTemplateType(type: DocumentTemplateType): void {
    if (this.lockTemplateType) return; // 某些情况下将锁定类型设定

    this.templateType = type;
  }

  /**
   *
   * @param isBlog 是否是 博客模式
   * @param currentNow 当前时间
   * @param authorName 作者姓名
   * @returns 构建的模版字符串
   */
  private generateMarkdownTemplate(
    isBlog: boolean,
    currentNow: string,
    authorName: string,
  ) {
    const filePath = this.meta.normalizedFilePath;

    const fileName = basename(filePath, extname(filePath)); // 文件名，没有后缀

    return [
      '---',
      `title: ${fileName}`, // 移除末尾的空格（默认插入的为文件名）
      isBlog && `authors: [${authorName}]`, // 用户信息
      'description: _', // 描述文本
      isBlog && 'keys: []', // 在 blog 模式下显示
      'hide_title: true', // 默认隐藏主标题
      `date: ${currentNow}`, // 构建日期
      `last_update:`, // 最后更新
      ` date: ${currentNow}`, // 更新日期
      ` author: ${authorName}`, // 更新用户信息
      // blog 模式不显示不支持的 pagination_prev
      !isBlog && 'pagination_prev: null',
      // blog 模式不显示不支持的 pagination_next
      !isBlog && 'pagination_next: null',
      '---',
      '',
      // 博客模式下显示摘要内容的标记
      // 该标记在 markdown 文件个 MDX 文件中不一致
      isBlog && (this.meta.isMd ? '<!-- truncate  -->' : '{/* {truncate} */}'), // 插入摘要标记
      '', // 添加一个空行
    ]
      .filter(e => e !== false)
      .join('\n');
  }

  /**
   *
   * @param isPlain 当前文件头的格式
   * @param currentNow 当前的时间
   * @param name 开发者姓名
   * @param email 开发者邮箱
   * @returns 构建字符串
   */
  private generateJSTemplate(
    isPlain: boolean,
    currentNow: string,
    name: string,
    email: string,
  ) {
    const filePath = this.meta.normalizedFilePath;
    const fileBasename = basename(filePath); // 文件名，带后缀
    const fileName = basename(filePath, extname(filePath)); // 文件名，没有后缀
    let module: string;
    if (this.moduleName) {
      if (this.moduleName.startsWith('@'))
        module = `${this.moduleName}/${fileName}`;
      else module = `@${this.moduleName}/${fileName}`;
    } else module = fileName;
    return [
      '/**',
      !isPlain && ' * @packageDocumentation', // TS 行业规则，必须放在首行
      ` * @module ${module}`, // 模块
      ` * @file ${fileBasename}`, // 文件名
      ' * @description _', // 描述
      ` * @author ${name || '📇'} <${email || '📮'}>`, // 账户信息
      !isPlain && ' * @license MIT',
      ` * @copyright  ${new Date().getFullYear()} ©️ ${name || '📇'}`, // 版权信息
      ` * @since ${currentNow}`, // 构建时间
      this.version && ` * @version ${this.version}`, // 版本信息
      ` * @lastModified ${currentNow}`, // 最后编辑时间
      ' */',
      '',
    ]
      .filter(e => e !== false)
      .map(e => e.replace(/\s+/g, ' '))
      .join('\n');
  }
}

/**
 * ## 对比数组剩余可用字段长度
 * @param arr 校验数组
 * @param pathStr 当前文档的路径
 * @returns 返回检验出剩余最小长度
 */
function processingArray(arr: string[], pathStr: string): number {
  return arr.reduce((previousValue, currentValue) => {
    const rulesAfterOrganization = posix
      .normalize(currentValue)
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
