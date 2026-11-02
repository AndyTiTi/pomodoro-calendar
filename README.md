# 桌面番茄日历（Pomodoro Calendar）

一个把「番茄钟专注」和「内容发布节奏排期」合二为一的 Windows 桌面应用。
日历提醒严格对齐 [`code-blog`](../code-blog) 的《内容发布节奏与官网植入规划》——D0 官网首发 → D1 掘金 → D2 CSDN → D3–D4 知乎 → D5 公众号 → 周末复盘。

- 前端：React 19 + TypeScript + Vite 8 + Tailwind v4 + shadcn/ui
- 桌面壳：Electron 45 + electron-builder 26（NSIS 安装版 + 绿色免安装版）
- 数据：localStorage 本地持久化，支持 JSON 导入 / 导出（可纳入 git 管理）

---

## 下载

发布页：<https://github.com/AndyTiTi/pomodoro-calendar/releases/tag/v0.1.0>

| 附件 | 说明 |
|------|------|
| `pomodoro-calendar-setup-<version>.exe` | NSIS 安装版，可选安装目录、创建桌面快捷方式 |
| `pomodoro-calendar-portable-<version>.zip` | 绿色免安装版，解压后运行 `桌面番茄日历.exe` |

---

## 功能

- **番茄钟**：专注 / 短休 / 长休三模式，可配置时长与长休间隔，自动开始；每完成一个专注计入当日番茄数。
- **发布节奏排期**：一键为选定周生成 7 天分发流水线（`src/lib/rhythm.ts`），平台、时间、注意事项均来自 code-blog 规划。
- **日历浏览**：单击某天在右侧面板浏览当天日程，右侧「添加日程」按钮再打开新建 / 编辑弹窗。
- **到点提醒**：带时间的未完成日程，在提前 N 分钟与准点各提醒一次；桌面端走 Electron 原生通知，浏览器端走 Web Notification，均静默降级。
- **导入 / 导出**：整份日历数据（任务 + 番茄记录 + 设置）以 JSON 结构导出，可再导入。

---

## 架构

```
渲染进程 (React SPA, HashRouter)
  │  window.electronAPI.{isElectron, notify}   ← 唯一原生桥
  ▼
preload.cjs  (contextBridge 暴露，contextIsolation: true)
  │  ipcRenderer.send('notify', {title, body})
  ▼
main.cjs  (Electron 主进程)
  ├─ BrowserWindow：dev 加载 http://localhost:27890，prod 加载 dist-electron/renderer/index.html
  ├─ Tray：关闭即最小化到托盘，番茄钟与提醒在后台继续运行
  ├─ 单实例锁：二次启动聚焦已有窗口
  └─ ipcMain 'notify' → 系统 Notification
```

主进程**只依赖 Electron 内置模块**（`electron` / `node:path`），不引入任何 npm 运行时依赖；渲染层由 Vite 打包，因此 `app.asar` 仅约 520 KB（已通过 `files` 白名单排除 147 MB 生产 `node_modules`）。

### 前端数据流

```
CalendarProvider (src/store)          唯一状态源：tasks / pomodoro / settings
  ├─ 初始化：storage.get(KEY, SEO_PLAN 默认值)   ← 首启注入 SEO 排期种子数据
  ├─ useEffect：任意状态变更即写回 localStorage
  └─ Context 暴露 add/update/delete/toggle、addPomodoro、import/exportData
       ▲
       │ useCalendar()
  页面 / 组件：HomePage（工作台）、CalendarPage（日历）
  Hooks：usePomodoro（计时状态机）、useReminders（20s 轮询到点提醒）
```

- 数据模型集中在 [`src/data/types.ts`](src/data/types.ts)：`ITask` / `ISettings` / `ICalendarData`，业务代码以此为准。
- localStorage 命名空间前缀见 `src/data/constants.ts`（`STORAGE_KEYS`）。

---

## 目录结构

```
src/
├── index.tsx                 # 入口（Provider 层级，勿改）
├── app.tsx                   # 路由表（仅在 <Routes> 内增删 <Route>）
├── components/
│   ├── Layout.tsx            # 全局布局（导航 + <Outlet />）
│   ├── PomodoroTimer.tsx     # 番茄钟
│   ├── RhythmDialog.tsx      # 生成发文节奏
│   ├── TaskDialog.tsx        # 新建 / 编辑日程
│   └── SettingsDialog.tsx    # 设置
├── pages/
│   ├── HomePage/             # 工作台
│   ├── CalendarPage/         # 日历（点击浏览 + 右侧添加）
│   └── NotFoundPage/
├── store/                    # CalendarProvider + Context
├── hooks/                    # usePomodoro / useReminders / use-mobile
├── lib/                      # date / rhythm / notify / storage / import-export / utils
├── data/                     # types / constants / seo-plan（种子数据）
public/data/seo-plan-2026-11.json   # SEO 排期原始 JSON
electron/                     # main.cjs + preload.cjs（桌面壳）
```

`@/` 别名 → `src/`。shadcn/ui 内置组件位于 `src/components/ui/*`，版本锁定，勿改。

---

## 开发

```bash
npm install                 # registry 已指向 npmmirror（见 .npmrc）

# 1) 启动渲染层 dev server（Electron 主进程默认连 27890 端口）
npm run dev -- --port 27890

# 2) 另开一个终端启动 Electron 壳
npm run electron:dev
```

纯浏览器调试（不含原生通知，通知会降级为 Web Notification）直接访问 dev server 即可。
如 dev server 用了别的端口，可设 `ELECTRON_DEV_URL` 覆盖：`ELECTRON_DEV_URL=http://localhost:5173 npm run electron:dev`。

---

## 构建与打包

### 质检

```bash
npm run lint        # 并行执行 typecheck（tsc）+ eslint
npm run typecheck
npm run build       # 妙搭托管 Web 产物 → dist/client
```

### 桌面端打包（Windows）

```bash
npm run electron:build
# = vite build --config electron.vite.config.ts   （渲染层 → dist-electron/renderer，base:'./' 走 file://）
# + electron-builder --win                        （NSIS 安装包 → release/）
```

产物：

- `release/pomodoro-calendar-setup-<version>.exe` — 安装版
- `release/win-unpacked/` — 绿色免安装目录（打 zip 即得便携版）

#### electron-builder 关键配置（package.json `build`）

| 配置 | 作用 |
|------|------|
| `files: [electron/**, dist-electron/renderer/**, !node_modules/**]` | 排除生产 `node_modules`，`app.asar` 147 MB → 520 KB |
| `electronLanguages: ["zh-CN","en-US"]` | 只保留中英文 `.pak`，安装包 117 MB → 109 MB |
| `extraResources: build/icon.png` | 打包后主进程从 `process.resourcesPath` 取图标 |
| `asar: true` / `nsis.oneClick: false` | asar 归档；安装版允许改目录、建桌面快捷方式 |

#### 国内网络加速（可选镜像）

```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
```

#### 已知坑：杀毒软件锁定 `default_app.asar`

Windows Defender 实时扫描会锁定 Electron 缓存里的 `default_app.asar`，导致 electron-builder 清理阶段报 `EBUSY/EPERM`。绕过办法：把 Electron 发行包解压到一个自定义目录并跳过 `default_app.asar`，再用 `--config.electronDist` 指向它（该路径走 `copyDir`，不触发删除）：

```bash
npx electron-builder --win --config.electronDist=.electron-dist
```

---

## 打包体积优化评估（Electron vs Tauri）

当前 Electron 安装包 109 MB、便携版主程序约 238 MB，体积几乎全部来自 Chromium + Node 运行时。

**Tauri 方案**：复用系统 WebView2（Win10/11 多已内置），后端用 Rust，安装包通常 **3–15 MB**，是数量级的缩减。本应用尤其适合迁移，因为：

- 原生面很窄——主进程只有「窗口 + 托盘 + 单实例 + 通知」，全部有 Tauri 官方插件对应（`tauri-plugin-notification`、tray、`tauri-plugin-single-instance`）。
- React 前端几乎零改动；`src/lib/notify.ts` 已做优雅降级，只需把 `window.electronAPI.notify` 桥换成 Tauri `invoke` / 通知插件。
- WebView2 基于 Chromium，渲染表现与 Electron 一致。

**代价与风险**：需引入 Rust 工具链与 Tauri CLI；老旧 Windows 可能需随包分发 WebView2 Evergreen 引导安装器；打包链从 electron-builder 切到 Tauri bundler（NSIS/MSI）。整体工作量约 1 天。

**结论**：若以「小体积、可直接下载分发」为主要目标，值得迁移到 Tauri；现有 Electron 版可继续作为过渡产物。迁移可在 `src-tauri/` 下并行进行，不影响当前 React 代码。

---

## 发布流程（维护者）

1. 改 `package.json` 的 `version`。
2. `npm run electron:build` 生成安装包；将 `release/win-unpacked/` 打成 `pomodoro-calendar-portable-<version>.zip`。
3. 建 git tag `v<version>`，在 GitHub Releases 上传 `.exe` 与便携 `.zip` 两个附件。

> 单文件超 100 MB，Gitee Release 放不下，故用 GitHub Releases 分发；仓库已设为公开，附件可匿名直接下载。
