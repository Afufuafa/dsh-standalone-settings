# 发布与维护备忘（给你自己看的，不是给用户看的）

这份文件只面向仓库维护者。用法、行为、兼容性这些面向用户的说明在
[README.md](README.md) 里。

---

## 1. 作者与仓库地址（已完成）

作者信息与仓库地址已经按 GitHub 用户名 **`Afufuafa`** 填好，不需要再做任何替换：

| 文件 | 位置 |
| --- | --- |
| `LICENSE` | 第 3 行版权行 |
| `package.json` | `author` / `repository` / `homepage` / `bugs` |
| `README.md` | 「从 GitHub 安装」那条命令 |
| `README.en.md` | 同上（英文版） |

`package.json` 里的仓库地址是
`https://github.com/Afufuafa/dsh-standalone-settings`——**在 GitHub 上建仓库时请用
`dsh-standalone-settings` 这个名字**，否则地址要对不上。

<details>
<summary>以后要是改了 GitHub 用户名或仓库名，用这段脚本一次性同步</summary>

把 `$old` 换成旧用户名（现在是 `Afufuafa`）、`$new` 换成新的，仓库名同理：

```powershell
$old = 'Afufuafa'
$new = '新用户名'
$dir = 'C:\Users\52230\Documents\deepseek-harness\default-workspace\dsh-standalone-settings'
foreach ($f in 'LICENSE','package.json','README.md','README.en.md') {
  $p = Join-Path $dir $f
  (Get-Content $p -Raw).Replace($old, $new) | Set-Content $p -Encoding utf8NoBOM
  "updated $f"
}
```

**别用 Windows 自带的 Windows PowerShell 5.1 跑**：它写文件会用别的编码，中文会乱码。
请用 PowerShell 7（`pwsh`），跑完用编辑器打开 `README.md` 确认中文正常。

</details>

同时确认 `LICENSE` 里的年份（现在是 2026）和 `package.json` 里的 `version`
（现在是 `0.1.0`）符合你的预期。

## 2. 推到 GitHub

先在 GitHub 网页上新建一个空仓库，名字用 `dsh-standalone-settings`，
**不要**勾选 "Add a README / .gitignore / license"，避免和本地文件冲突。
然后在 PowerShell 里：

```powershell
cd C:\Users\52230\Documents\deepseek-harness\default-workspace\dsh-standalone-settings

# 这台机器还没配置过 git 身份，第一次必须设置这两行。
# 它们会作为每次提交的「作者」公开显示。用 GitHub 提供的隐私邮箱
# <用户名>@users.noreply.github.com 可以不暴露真实邮箱。
git config --global user.name  "Afufuafa"
git config --global user.email "Afufuafa@users.noreply.github.com"

git init -b main
git add .
git commit -m "feat: standalone settings button for the DSH sidebar foot"
git remote add origin https://github.com/Afufuafa/dsh-standalone-settings.git
git push -u origin main
```

第一次 push 会弹出浏览器让你登录 GitHub（Git for Windows 自带的凭据管理器负责这一步）。

推上去之后，仓库首页就是 `README.md` 的内容。**这份 `PUBLISHING.md` 也会公开可见**，
如果你不想让别人看到，删掉它再推，或者把它放进 `.gitignore`。

### 如果 `git push` 报 "Failed to connect to github.com port 443"

这是网络层的问题，不是 git 或账号的问题（典型症状：卡 20 秒后 `Could not connect to server`）。
**关键是：浏览器能用系统代理，但终端里的 git 不读系统代理，它是直连的。**

先确认代理端口，再把它配给 git（下面用 `7897` 举例，换成你自己代理客户端的端口）：

```powershell
# 1) 看系统代理指向哪个端口（浏览器用的就是它）
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' |
  Select-Object ProxyEnable, ProxyServer

# 2) 用 curl 实测该代理能不能访问 github.com（返回 HTTP 200 就是能）
curl.exe -x http://127.0.0.1:7897 -sS -o NUL -w "HTTP %{http_code}`n" https://github.com

# 3) 配给 git，并用公开仓库验证（返回一串 SHA 即成功，不需要登录）
git config --global http.proxy  http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
git ls-remote https://github.com/git/git.git HEAD

# 4) 重新推送
git push -u origin main
```

注意两点：

- **代理客户端必须开着**，否则 git 会因为连不上代理而失败（报错会变成连 `127.0.0.1:7897` 失败）。
- 想撤销这个设置：`git config --global --unset http.proxy` 和 `--unset https.proxy`。

如果实在没有可用的代理，还有两条退路：`ssh.github.com:443` 在很多网络下是通的（需要改用
SSH 方式推送，并在 GitHub 添加公钥）；或者把仓库放到 Gitee，`dsh plugin` 接受任意 git 地址，
只是社区用户大多从 GitHub 安装。

## 3. （可选）发布到 npm

包名 `dsh-standalone-settings` 目前**没有被占用**（发布前可以自己去
`https://www.npmjs.com/package/dsh-standalone-settings` 确认一下）。发上 npm 之后，
用户就能用最短的那条命令安装。

```powershell
npm login          # 按提示登录，没有账号先在 npmjs.com 注册
npm publish        # 无需 --access public，因为不是 scope 包
```

发布内容由 `package.json` 的 `files` 白名单决定，只会带上
`index.js`、`client.js`、`cordis.patch.yml`、`icon.svg` 和文档，不会带上这份备忘。

## 4. （可选）登记到社区市场

你 profile 里装的 `dsh-plugin` 就是社区插件市场（介绍里写的是 dsh-plugin.org）。
登记方式以该市场自己的说明为准——去它的仓库/页面找提交入口，把你的 GitHub 仓库地址填进去。
这一步没有任何强制要求，不做也不影响别人直接用仓库地址安装。

## 5. 以后要改东西

1. 改 `package.json` 的 `version`（0.x 期间：修 bug 加 patch，改行为加 minor）；
2. 往 `CHANGELOG.md` 顶部加一段；
3. 改代码；
4. 提交并推送。

如果发了 npm，还要 `npm publish` 一次，用户用 `dsh plugin ... add dsh-standalone-settings@latest`
就能拿到新版。

## 6. 改完怎么装回你自己这台

- **只改了 `client.js`**：刷新页面即可（你的 profile 装的是指向本目录的 link，文件就是跑的那份）。
- **改了 `package.json`（名字、版本、依赖）**：需要在 DSH 的插件页面重装这个插件。
- **替换了已安装的包**：一般要重启应用，才会载入新的客户端模块。

## 7. 三个必须记住的坑

1. **包名必须三处完全一致**，否则**客户端半边会静默不加载**（不报错、Host 行也正常，
   但按钮就是不出现）：
   - `package.json` 的 `name`
   - `client.js` 里 `window.__ModuleLoader__.load({ id: ... })`
   - `cordis.patch.yml` 里那一行的 `name`
2. **别把 `"private": true` 加回来**：它会让 `npm publish` 直接失败。
3. **别随手把 `engines.dsh` 放宽成 `*`**：它是你的兼容性护栏，也是"我只测到这个版本"的
   公开声明。要放宽，先在对应版本的 DSH 上真跑通再改。
