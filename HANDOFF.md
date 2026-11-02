# 桌面番茄日历 — 开发交接文档

> 本文是给接手 AI 的唯一权威说明。数据模型、文件路径、编码铁律以本文为准；
> 若与早期对话记忆冲突，以磁盘文件 + 本文为准。

## 1. 项目目标

构建一个纯前端「桌面番茄日历」，两个核心能力：

1. **番茄钟**：专注 / 短休息 / 长休息计时，完成专注自动计数并写入当日番茄数。
2. **发布日历**：管理文章在各平台的写作与发布日程，发布日在月历上用番茄标记，支持提醒。

数据不接服务端、不做账号体系。持久化方式：

- 运行时用 **localStorage（带命名空间）** 保存；
- 通过 **JSON 导入 / 导出** 落地成文件，用户把该 JSON 纳入 **git** 管理，多台工作电脑 pull/push 同步。

## 2. 采用的 Skill 与链路

- 主 Skill：**doubao-app-builder**，走「本地 webapp 开发链路」（非 app_builder_agent、非 html 链路）。
- Skill 根目录：
  `C:\Users\Andy\AppData\Local\Doubao\User Data\Profile 2\.doubao\agent_mode\workspace\.skills\doubao-app-builder`
- 动手前必读：
  - `reference\webapp-develop.md`（链路规则、数据存哪、质检三项、交付方式）
  - `reference\webapp\stack\react-standard-webapp.md`（模板约定、路径铁律、导出名、类型摩擦）
  - `reference\steering\frontend-design.md`（视觉方法论）
- 判定结论：无需运行时 AI、无需服务端，因此本地亲自写代码；**默认不发布**。

## 3. 技术栈

React 19 + Vite + TypeScript（strict）+ Tailwind CSS v4 + shadcn/ui（55 组件，new-york/neutral）
+ react-router-dom 7。路径别名 `@/` → `src/`。已含 lucide-react、sonner、date-fns、zod、
react-hook-form、framer-motion、echarts、recharts、react-day-picker 等依赖，按需 import，勿重复安装。

## 4. 视觉方向（已落地，勿推翻）

- 主色 = 番茄红 `--primary`；强调 / 成功 = 番茄叶绿 `--accent`；基底 = 暖纸张 `--background`；
  文字 = 炭灰 `--foreground`。完整 HSL 已写入 `src/tailwind-theme.css`。
- 数字 / 标题字体 = Space Grotesk（自托管镜像 miaoda.feishu.cn，已在 `src/index.css` 首行 @import），
  中文回退系统字体栈。
- 签名元素：番茄钟圆形进度环 + 日历上的「番茄圆点」，统一主题语言。
- 禁止使用 emoji；图标一律用 lucide-react。

## 5. 权威数据模型（src/data/types.ts，不得脑补字段）

- `Platform = 'official' | 'juejin' | 'csdn' | 'zhihu' | 'wechat' | 'other'`
- `TaskType = 'writing' | 'publish' | 'review' | 'other'`
- `TimerMode = 'focus' | 'short' | 'long'`
- `ITask { id, title, date(YYYY-MM-DD), time?(HH:mm), platform, type, done, note? }`
- `ISettings { focusMin, shortBreakMin, longBreakMin, longBreakInterval, autoStart, notifyEnabled, remindBeforeMin }`
- `ICalendarData { version, tasks: ITask[], pomodoro: Record<string,number>(date→番茄数), settings: ISettings }`
  —— 这就是导入 / 导出 JSON 的完整结构。

元数据标签在 `src/data/constants.ts`（PLATFORM_META / TASK_TYPE_META / PLATFORM_ORDER /
TASK_TYPE_ORDER / DEFAULT_SETTINGS / STORAGE_KEYS / DATA_VERSION）。

## 6. 已完成文件清单（直接复用，勿重写）

| 文件 | 职责 |
| --- | --- |
| `src/data/types.ts` | 全部类型定义 |
| `src/data/constants.ts` | 命名空间、存储键、默认设置、平台/类型元数据 |
| `src/data/sample.ts` | 6 条示例日程（D0–D5 节奏，可整体删除） |
| `src/lib/storage.ts` | `storage.get/set`，自动加命名空间、try/catch |
| `src/lib/date.ts` | `dateKey/todayKey/parseKey/monthLabel/getMonthGrid(42格,周一起点)/WEEK_HEADERS` |
| `src/lib/import-export.ts` | `buildExportData/parseImport/downloadJson/genId` |
| `src/lib/notify.ts` | `ensureNotifyPermission/sendNotification` |
| `src/store/calendar-context.ts` | Context 类型 + `useCalendar()` hook |
| `src/store/CalendarProvider.tsx` | 全局状态：tasks/pomodoro/settings 及全部操作、自动持久化 |
| `src/hooks/usePomodoro.ts` | 计时逻辑：递减、结算、模式自动切换、通知 |
| `src/components/PomodoroTimer.tsx` | 番茄钟圆形进度环 + 开始/暂停/重置 + 模式切换 |
| `src/components/TaskDialog.tsx` | 日程新建/编辑/删除弹窗（受控，props 见下） |

`useCalendar()` 暴露：`tasks, pomodoro, settings, addTask, updateTask, deleteTask,
toggleDone, updateSettings, addPomodoro, importData, exportData`。

`TaskDialog` props：`{ open:boolean, onOpenChange:(open)=>void, editingTask?:ITask|null,
defaultDate?:string }`。editingTask 有值即编辑模式，null 即新建。

## 7. 剩余功能（按此实现，范围之外不要加戏）

### A. 挂载 Provider — 改 `src/index.tsx`
在 `BrowserRouter` 内、`ErrorBoundary` 内用 `CalendarProvider` 包裹 `<App />`
（`import CalendarProvider from '@/store/CalendarProvider'`）。

### B. 布局与导航 — 改 `src/components/Layout.tsx`
- 顶部栏：品牌名「桌面番茄日历」；两个 **NavLink**（`to="/"` 今日工作台、`to="/calendar"`
  发布日历），用 className 回调高亮 active；右侧设置按钮（lucide Settings）打开设置弹窗。
- 主体渲染 `<Outlet />`。NavLink 禁止换成裸 `<a>`。
- Layout 持有设置弹窗 open state，渲染下面的 `SettingsDialog`。

### C. 路由 — 改 `src/app.tsx`
- `index` → HomePage；`path="calendar"` → CalendarPage；保留 `path="*"` → NotFoundPage。
- 只改 `<Routes>` 内部，外层 BrowserRouter 已在 index.tsx 配好。

### D. 日历页 — 新建 `src/pages/CalendarPage/CalendarPage.tsx`
- state：`year/month`（初始今天）、`selectedKey`、弹窗 open、`editingTask`。
- 用 `getMonthGrid(year, month)` 渲染 42 格，表头用 `WEEK_HEADERS`。
- 每格：日期数字；该 key 存在任务时显示番茄圆点（`var(--primary)` 实心小圆点）；
  今天高亮（ring 或 primary 底色）；非本月格子文字用 muted-foreground。
- 点击空白格子：设 selectedKey 并以新建模式打开 TaskDialog（`defaultDate=key`、editingTask=null）。
- 上下月按钮（ChevronLeft/Right）调整 year/month，注意 1 月上一月翻到上年 12 月、反之亦然。
- 页面侧（或下方）列出 selectedKey 当天任务，点击单条任务以编辑模式打开弹窗；
  平台用 Badge + `PLATFORM_META` 显示。
- 提供「新建日程」按钮。

### E. 今日工作台 — 重写 `src/pages/HomePage/HomePage.tsx`
- 左侧渲染 `<PomodoroTimer />`。
- 右侧：今日番茄数（`pomodoro[todayKey()] ?? 0`）；今日发布提醒（筛选 `date===today`
  且 `type==='publish'` 且未 done，置顶强调）；今日全部任务列表，每条可 `toggleDone`，
  显示时间与平台标签。
- 无任务时显示空态文案（行动邀请式，不渲染情绪）。

### F. 设置弹窗 — 新建 `src/components/SettingsDialog.tsx`
- 番茄时长：`focusMin / shortBreakMin / longBreakMin`（数字输入或 Slider，1–120 合理范围）；
  `longBreakInterval`（2–8）；`autoStart`、`notifyEnabled` 用 Switch；`remindBeforeMin`。
- 打开通知开关时调用 `ensureNotifyPermission()` 请求权限，被拒绝则回退开关并说明。
- 数据管理：
  - 导出：`downloadJson(exportData(), 'pomodoro-calendar-YYYYMMDD.json')`；
  - 导入：隐藏 `<input type="file" accept="application/json">`，File API 读取文本 →
    `parseImport` → `importData`；失败用 sonner toast 提示，不白屏。
- 变更通过 `updateSettings` 落地（可即时保存或底部统一保存，二选一保持一致）。

## 8. 编码铁律（违反会导致 lint / 白屏 / 发布 404）

1. 路径一律 `@/` 别名或相对路径；**禁止裸根路径**（`src="/..."`、`href="/..."`、`@/logo.png` 之类），
   静态资源引用要相对路径，发布后子路径才不会 404。
2. render 必须是纯函数：禁止在组件体内直接 new Date / 随机数 / 写 localStorage；
   日期在事件回调或 useState 初始化器里生成。
3. 业务文件 / 页面 / Provider 用 **default export**；shadcn ui 组件保持 **named export**。
4. 导出组件的文件只能导出 React 组件，不要同时导出常量 / 函数（react-refresh 会报错）；需共享则拆文件。
5. 导航用 `NavLink`，不用裸 `<a>`；图标用 lucide-react，不用 emoji。
6. 所有写入 localStorage 走 `storage.set`，读取走 `storage.get`（带 fallback）。
7. 不主动新增用户没要求的功能（账号、云同步、数据分析、多语言、拖拽、富文本均不做）。

## 9. 环境怪癖（Windows）

- PowerShell 的 `Get-ChildItem`、`Format-Table`、部分管道可能渲染为空；
  改用 `[System.IO.Directory]::GetFiles(...)`、`cmd /c dir`、`Write-Output` 或直接 git 输出。
- 本机 shell 为 PowerShell（pwsh），无 Bash；路径用反斜杠，参数注意 `@'...'@` here-string。

## 10. 质检与交付（webapp-develop.md 三项，各只做一次）

1. 跑 `npm run lint`，只看 error 级，**0 error** 即停（warning 不阻塞但需留意）。
2. 全仓扫一遍裸根路径（lint 查不出，发布后会整片 404）。
3. 起 dev server，浏览器打开首页确认**无白屏**、控制台无致命报错；拿不到浏览器能力就如实说明，
   不要用 curl 冒充。
4. dev 端口在 **20000–39999** 随机选空闲端口，并同步更新工程内 `spark.json` 的 `dev.port`。
5. 用 `present_files` 交付 localhost 地址（source 填地址），正文一两句说明即可，不裸贴 URL。
6. 交付说明讲清：数据存当前浏览器、换设备不共享、当前为示例数据、默认未发布。
