import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 把 Tauri 打好的 NSIS 安装包从深层 target 目录拷到项目根 release/，方便查找与上传。
// 只拷当前版本号对应的安装包（nsis 目录会残留旧版本产物）。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nsisDir = path.join(root, 'src-tauri', 'target', 'release', 'bundle', 'nsis');
const outDir = path.join(root, 'release');

const conf = JSON.parse(readFileSync(path.join(root, 'src-tauri', 'tauri.conf.json'), 'utf8'));
const version = conf.version;

const installers = readdirSync(nsisDir).filter((f) => f.endsWith('.exe') && f.includes(version));
if (installers.length === 0) {
  console.error(`[copy-release] 未找到版本 ${version} 的 NSIS 安装包:`, nsisDir);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const name of installers) {
  const from = path.join(nsisDir, name);
  // 重命名为 ASCII，避免中文文件名在 Release 下载 URL 中被百分号编码、下载工具处理出错
  const to = path.join(outDir, `pomodoro-calendar-${version}-x64-setup.exe`);
  copyFileSync(from, to);
  console.log(`[copy-release] ${name} -> release/pomodoro-calendar-${version}-x64-setup.exe`);
}
