# 桌面番茄日历（Pomodoro Calendar）

一个把「番茄钟专注」和「内容发布节奏排期」合二为一的 Windows 桌面应用。
日历提醒严格对齐 [`code-blog`](../code-blog) 的《内容发布节奏与官网植入规划》——D0 官网首发 → D1 掘金 → D2 CSDN → D3–D4 知乎 → D5 公众号 → 周末复盘。

- 前端：React 19 + TypeScript + Vite 8 + Tailwind v4 + shadcn/ui
- 桌面壳：Tauri 2（Rust）+ 系统 WebView2，NSIS 安装包实测 **1.35 MB**
- 数据：localStorage 本地持久化，支持 JSON 导入 / 导出（可纳入 git 管理）

> 历史：v0.1.0 之前用 Electron 封装（安装包 109 MB），现已整体迁移到 Tauri，体积缩减约 80×。Electron 相关代码保留在 git 历史中。

---

## 下载

发布页：<https://github.com/AndyTiTi/pomodoro-calendar/releases>

Tauri NSIS 安装包：`桌面番茄日历_<version>_x64-setup.exe`（约 1.35 MB）。仓库公开，附件可匿名直接下载。

---

## 功能

- **番茄钟**：专注 / 短休 / 长休三模式，可配置时长与长休间隔，自动开始；每完成一个专注计入当日番茄数。
- **发布节奏排期**：一键为选定周生成 7 天分发流水线（`src/lib/rhythm.ts`），平台、时间、注意事项均来自 code-blog 规划。
- **日历浏览**：单击某天在右侧面板浏览当天日程，右侧「添加日程」按钮再打开新建 / 编辑弹窗。
- **到点提醒**：带时间的未完成日程，在提前 N 分钟与准点各提醒一次；桌面端走 Tauri 原生通知，浏览器端走 Web Notification，均静默降级。
- **导入 / 导出**：整份日历数据（任务 + 番茄记录 + 设置）以 JSON 结构导出，可再导入。

---

## 架构

```
WebView2 (React SPA, HashRouter)         ← 复用系统运行时，不打包 Chromium
  │  window.__TAURI_INTERNALS__           ← Tauri JS 桥（探测 + invoke/事件）
  │  动态 import @tauri-apps/plugin-notification
  ▼
Rust core (src-tauri/src/lib.rs)
  ├─ WebviewWindow：dev 加载 http://localhost:27890，prod 加载打包进二进制的 dist-tauri
  ├─ tray-icon：托盘菜单（打开主窗口 / 退出）+ 左键单击唤起
  ├─ 关闭即隐藏到托盘，番茄钟与提醒在后台继续运行
  ├─ tauri-plugin-single-instance：二次启动聚焦已有窗口
  └─ tauri-plugin-notification：系统原生通知
```

Rust 侧只做「窗口 + 托盘 + 单实例 + 通知」，不含业务逻辑；前端由 Vite 打包后嵌入二进制，因此主程序 exe 仅约 3.6 MB。

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
src-tauri/                    # Rust 桌面壳
├── Cargo.toml / build.rs
├── tauri.conf.json           # 窗口、NSIS、frontendDist=../dist-tauri
├── capabilities/default.json # core:default + notification:default
├── icons/                    # npx tauri icon 生成（ico/png/icns）
└── src/{main.rs,lib.rs}      # 单实例 + 通知 + 托盘 + 关闭最小化
tauri.vite.config.ts          # 渲染层构建（base:'./' → dist-tauri）
```

`@/` 别名 → `src/`。shadcn/ui 内置组件位于 `src/components/ui/*`，版本锁定，勿改。

---

## 前置环境（一次性）

- **Rust**（rustup，默认 `x86_64-pc-windows-msvc`）
- **Microsoft C++ Build Tools**，勾选「使用 C++ 的桌面开发」（提供 MSVC 链接器 + Windows SDK）
- **WebView2 运行时**：Win10/11 通常已内置

> 本机 Rust 装在 `D:\rust`，`cargo` 位于 `D:\rust\.cargo\bin`。若在 Git Bash 中 `cargo: command not found`，把该目录加进 PATH：`export PATH="/d/rust/.cargo/bin:$PATH"`。

---

## 开发

```bash
npm install                 # registry 已指向 npmmirror（见 .npmrc）
npm run tauri:dev           # 起 vite(27890) + 编译 Rust + 打开原生窗口（热更新）
```

只想在浏览器里调 UI（无原生通知，通知降级为 Web Notification）：`npm run dev`，然后访问 dev server。

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
npm run tauri:build
# = vite build --config tauri.vite.config.ts   （渲染层 → dist-tauri，base:'./'）
# + cargo build --release + Tauri bundler       （NSIS 安装包）
```

产物：`src-tauri/target/release/bundle/nsis/桌面番茄日历_<version>_x64-setup.exe`（实测 1.35 MB）。
免安装版可直接用 `src-tauri/target/release/pomodoro-calendar.exe`（约 3.6 MB，前端已嵌入）。

首次 release 全量编译约 10 分钟；之后增量编译快很多。

### 更新图标

替换 `build/icon.png` 后运行 `npm run tauri:icon` 重新生成 `src-tauri/icons/` 全套。

### 国内网络加速（可选）

Rust 依赖走 rsproxy 镜像（在 `~/.cargo/config.toml` 配置 `rsproxy-sparse`）；npm 走 npmmirror（见 `.npmrc`）。

---

## 为什么用 Tauri（体积对比）

| 产物 | Electron（旧） | Tauri（现） | 缩减 |
|------|---------:|------:|-----:|
| NSIS 安装包 | 109 MB | **1.35 MB** | ~80× |
| 主程序 exe | 238 MB | 3.59 MB | ~66× |

关键在于 Tauri 复用系统 WebView2、不打包 Chromium + Node，且本应用原生面极窄（窗口/托盘/单实例/通知均有官方插件对应），React 业务代码零改动即可迁移。

---

## 发布流程（维护者）

1. 改版本号，**三处保持一致**：`package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml`。
2. `npm run tauri:build` 生成 NSIS 安装包，并由 `scripts/copy-release.mjs` 自动把当前版本的安装包拷到根目录 `release/`（只拷匹配 `tauri.conf.json` 版本号的，拷贝前清空 `release/`）。
3. 提交并打 tag：`git tag -a v<version> && git push origin main && git push origin v<version>`。
4. 在 GitHub 网页发 Release（无需 token）：
   - 打开 `https://github.com/<owner>/<repo>/releases/new`
   - **Choose a tag** 选刚推的 `v<version>`
   - 填 Release title，**Attach binaries** 拖入 `release/桌面番茄日历_<version>_x64-setup.exe`
   - 粘贴版本说明后 **Publish release**

> 仓库公开，附件可匿名直接下载；安装包仅约 1.35 MB，任何平台的 Release 限制都不再是问题。
> `release/` 已被 `.gitignore` 忽略，只作本地中转，不入库。

