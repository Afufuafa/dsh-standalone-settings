# Changelog

本项目遵循[语义化版本](https://semver.org/lang/zh-CN/)。0.x 期间次要版本可能带来行为变化。

## [0.1.0] - 2026-10-01

首个版本。

- 通过官方座位 `sidebar.footer.action` 贡献一个独立的设置按钮
- 宽栏时把按钮钉在侧边栏底部账号 / 用户行的右端（账号按钮右边）
- 56px 轨道里按钮让位，账号菜单保留自己的「设置」行，入口不丢失
- 点击运行宿主自己的 `settings.open` 命令打开原设置面板
- 按钮显示时按快捷键的无障碍组合隐藏账号菜单里重复的「设置」行
- 全部样式使用主题 token（`--dsw-alias-*`），跟随明暗主题与界面语言
- 只用 JS + 主题 token，不 import 任何 Harness Client 包
- README 顶部增加作者**手写说明**：插件动机、由 ds v4.1 flash 全权生成、不保证后续跟进、欢迎 issue/PR/fork
