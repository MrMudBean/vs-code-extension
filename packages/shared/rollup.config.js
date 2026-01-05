import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import { external } from '@qqi/rollup-external';

export default {
  input: {
    index: './src/index.ts', // 默认：聚合导出入口
  },
  output: ['es'].map(e => ({
    format: e, // ESM 模式
    entryFileNames: '[name].js', // 打包文件名
    preserveModules: true, // 保留独立模块结构（关键）
    preserveModulesRoot: 'src', // 保持 src 目录结构
    sourcemap: false, // 正式环境：关闭 source map
    exports: 'named', // 导出模式
    dir: `dist/`,
  })),
  // 配置需要排除的包
  external: external({
    ignore: ['node:', 'vscode'],
    exclude: ['vscode'],
  }),
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['node_modules', 'test'],
    }),
    // 去除无用代码
    cleanup(),
  ],
};
