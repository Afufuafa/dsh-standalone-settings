# dsh-standalone-settings

中文 | [English](README.en.md)

把 DeepSeek Harness 桌面版的**设置入口**从账号按钮的二级菜单里独立出来：在侧边栏底部
**账号按钮的右端**固定一个独立的设置按钮。

- 目标宿主：DSH 桌面版（Web 版侧边栏同样适用）
- 装完即用，无需配置
- **不改宿主任何文件**：只用官方座位（slot）扩展点，可随时卸载干净

## 写在最前面（人工生成）

本插件的动机是本人太懒了，官方版dsh的设置又藏得深，不想每次都要从用户名进入二级菜单，所以向ai许愿要了一个分离出来的，社区版那样的独立设置按钮。

上传的原因是希望避免有同样需求的人重复浪费token，但由于本人唯一的code能力来源于大一的c++课程，所以本插件由ds v4.1 flash全权负责，不保证后续持续跟进，欢迎issue/pr/fork

## 为什么需要它

DSH 桌面版把账号启动器（`@deepseek-ai/dsh-client-ui-settings-account` 的账号菜单）组合进了
壳层的设置座位 `settings.launcher`。这个座位是 `single` 类型，账号启动器一占用，就顶掉了宿主
自带的「设置」齿轮触发器——结果是**设置只能从账号菜单里进**。

很多用户更想要一个一直看得见、点一下就开的按钮。本插件用官方座位把这件事补回来。

## 它做什么

| 场景 | 行为 |
| --- | --- |
| 侧边栏展开（宽栏） | 设置按钮钉在底部**账号 / 用户行的右端**，也就是账号按钮右边；账号行右端提前让出宽度，不会压住账号按钮 |
| 侧边栏收起（56px 轨道） | 按钮让位不显示（轨道里放不下并排；Windows 上收起时整个底部区域本来就是隐藏的），此时**账号菜单保留自己的「设置」行**，入口不会丢失 |
| 点击按钮 | 运行宿主自己的 `settings.open` 命令，打开的就是原来的设置面板——不复制、不拦截、不模拟点击别的插件 UI |
| 按钮显示期间 | 按「设置命令的快捷键 + 无障碍组合」精确隐藏账号菜单里重复的那一行设置项，避免出现两个入口 |

按钮是 32px 的图标按钮，样式只使用主题 token（`--dsw-alias-*`、`--dsw-radius-md`），跟随明暗主题
和界面语言；悬停显示「设置（Ctrl+,）」这样的原生提示。

> 仓库内没有截图。它只改一个按钮的位置和可见性，实际效果在你自己的侧边栏底部一眼可见。

## 安装

### 桌面版（推荐）

在 DSH 的插件页面按包名或仓库地址安装：

```
dsh-standalone-settings
```

### 命令行

`dsh plugin` 会把参数原样转发给 profile 目录里的 pnpm：

```bash
# 从 npm（发布之后）
dsh plugin --profile <profile> add dsh-standalone-settings

# 直接从 GitHub 仓库
dsh plugin --profile <profile> add git+https://github.com/Afufuafa/dsh-standalone-settings.git
```

> `desktop` profile 由 Desktop 进程自己管理：命令行管理它需要从 Desktop 载体启动，否则会被拒绝。
> 桌面版用户请优先用上面的插件页面。

### 本地目录（自己改着用）

```bash
dsh plugin --profile <profile> add /path/to/dsh-standalone-settings
```

装好后如果按钮没出现，刷新一次页面（客户端插件代码不会热更新）。

## 卸载

- 在插件页面把 `dsh-standalone-settings` 关掉或删除；或
- `dsh plugin --profile <profile> remove dsh-standalone-settings`

卸载后按钮、注入的样式和隐藏菜单项的规则全部随之消失，宿主回到原样。

## 配置

没有配置文件：两个开关是 `client.js` 顶部的常量，改完**刷新页面**生效。

| 常量 | 默认 | 作用 |
| --- | --- | --- |
| `INLINE_WITH_ACCOUNT` | `true` | 是否把按钮钉在账号行右端。设为 `false` 就退回座位默认的整行按钮样式（两种栏宽都显示）。 |
| `HIDE_ACCOUNT_MENU_ENTRY` | `true` | 是否隐藏账号菜单里自带的「设置」行。 |

## 工作原理

1. **座位**：按钮注册进壳体声明的 `sidebar.footer.action` 座位（官方描述为
   "Optional actions beside Settings at the sidebar foot"），用 `ctx.slots.inject()` 声明感知地挂载。
2. **打开面板**：点击时运行宿主自己的 `settings.open` 命令，面板状态仍归设置壳层所有。
3. **并排定位**：座位不是直接渲染组件——`renderSlot()` 会在每个座位外面包一层
   `<div data-slot="<座位名>" style="display:contents">` 出口（outlet）。所以本插件的格子的**父元素是
   这个出口**、**祖父元素才是壳体用来堆叠「操作行 + 设置行」的那一行**。定位直接以本座位自己的出口为锚：

   ```css
   div:has(> [data-slot="sidebar.footer.action"]) { position: relative }   /* 操作行成为定位上下文 */
   [data-dsh-standalone-settings][data-wide="true"] {
     position: absolute; right: 0; top: 100%; margin-top: 10px;
     width: auto;              /* 撤销座位整行格子的 width:100%，让盒子收缩到按钮本身 */
     justify-content: flex-end;
     pointer-events: none;     /* 盒子不拦点击，只有按钮本身是命中区 */
   }
   [data-dsh-standalone-settings][data-wide="true"] .dshss-button { pointer-events: auto }
   /* 账号行右端让出宽度，避免长用户名钻到按钮下面 */
   div:has(> [data-slot="sidebar.footer.action"] [data-dsh-standalone-settings][data-wide="true"]) + div {
     max-width: calc(100% - 44px);
   }
   ```

   `top: 100%` 相对操作行**自身高度**下移，落点必然是下一行（账号行），所以操作行里有没有别的
   插件按钮都不影响落点。
4. **不越界**：所有选择器都以本插件自己的标记属性和宿主发布的座位出口属性为锚，没有写死任何
   哈希类名。卸载插件后没有任何规则残留。

## 兼容性

| 项目 | 值 |
| --- | --- |
| 开发与验证环境 | DSH 桌面版 `0.2.0-rc.2`（Windows x64） |
| `engines.dsh` | `>=0.2.0-rc.1 <0.3.0-0` |
| 依赖的宿主契约 | 座位 `sidebar.footer.action`（props `{ wide }`）· 命令目录里的 `settings.open` · `locale` / `shortcuts` / `slots` 三个客户端服务 |

本插件贴在宿主 UI 细节上，有三处耦合点，**按脆弱度排序**：

1. 打开面板走的是快捷键服务实例上的命令注册表（`ctx.shortcuts.registry.invoke`）。这不是公开文档
   化的接口，是最可能在版本更新后失效的一处；失效时点击会在控制台给出提示，而不是静默出错。
2. 定位锚点 `[data-slot="sidebar.footer.action"]` 与账号行 44px 的行高。
3. 隐藏菜单项依赖「设置」命令当前绑定了快捷键（没有绑定就没有可利用的无障碍组合，那一行会重新出现）。

三处失效都只会让按钮**退回座位默认的整行样式**或让重复入口重新出现，不会崩溃，也不会让设置入口消失。

## 已知边界

- 只在**宽栏**下并排显示；56px 轨道里让位给账号菜单（理由见上表）。
- 面板总是"打开"，不做开关切换：重复点击等于再次调用一次「打开设置」，不会把已打开的面板关掉。
- 不改动账号菜单本身的功能：联系/退出登录/登录等行原样保留。
- 仓库内不含截图；视觉效果需要你自己确认。
- 改动 `client.js` 后需要刷新页面（或重启应用）才会载入新的客户端模块。

## 支持与贡献

立场上面那段说完了，这里只说怎么动手：

- 想改就直接 fork，改名、再发布都随便，不用问。
- 修好了欢迎提 PR，尤其是适配新版本 DSH 的改动。
- 自己修也不难：改 `client.js`，刷新页面。没有构建步骤，没有依赖。

## 许可

[MIT](LICENSE)
