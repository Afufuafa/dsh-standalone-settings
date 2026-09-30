# dsh-standalone-settings

[中文](README.md) | English

Lift DeepSeek Harness's **Settings entry** out of the account button's dropdown menu and pin it as
its own button at the **trailing end of the account/user row** in the sidebar foot.

- Target host: DSH desktop (the Web sidebar composition behaves the same)
- Works out of the box, nothing to configure
- Touches **no host file**: it contributes through the official slot extension points only, and
  uninstalls cleanly

## Why

DSH desktop composes the account launcher (`@deepseek-ai/dsh-client-ui-settings-account`) into the
shell's settings seat `settings.launcher`. That seat is `single`, so occupying it shadows the shipped
Settings gear trigger — leaving Settings reachable only from inside the account menu. This plugin
puts a always-visible Settings button back through the shell's `sidebar.footer.action` seat.

## Behaviour

| Situation | What happens |
| --- | --- |
| Sidebar expanded (wide) | The button sits at the **trailing end of the account/user row** — right of the account button. The row reserves width so the account button is never covered. |
| Sidebar collapsed (56px rail) | The button stands down (no room beside the account button; on Windows the whole foot is hidden there) and the **account menu keeps its own Settings row**, so the entry stays reachable. |
| Click | Runs the host's own `settings.open` command. The shipped settings panel opens — nothing is duplicated or intercepted. |
| While the button shows | Hides the account menu's duplicate Settings row, matched by the command's accessible key combination. |

Styling uses theme tokens only (`--dsw-alias-*`, `--dsw-radius-md`) and follows light/dark and the
active locale. No screenshot ships with this repository.

## Install

Through the DSH plugin page, by package name:

```
dsh-standalone-settings
```

Or with the CLI (arguments are forwarded verbatim to pnpm in the profile directory):

```bash
dsh plugin --profile <profile> add dsh-standalone-settings
dsh plugin --profile <profile> add git+https://github.com/Afufuafa/dsh-standalone-settings.git
```

> The `desktop` profile is managed by the Desktop process itself; only a Desktop-owned carrier may
> manage it from the CLI. Desktop users should use the plugin page above.

Refresh the page once after installing: client plugin code is not hot-reloaded.

## Configuration

Two constants at the top of `client.js` (change, then refresh the page):

| Constant | Default | Effect |
| --- | --- | --- |
| `INLINE_WITH_ACCOUNT` | `true` | Pin the button onto the account row. `false` restores the seat's default full-width action row in both sidebar states. |
| `HIDE_ACCOUNT_MENU_ENTRY` | `true` | Hide the account menu's own Settings row. |

## How the side-by-side placement works

Every seat renders through a `display:contents` outlet (`<div data-slot="<slot key>">`), so this
cell's **parent is that outlet** and its **grandparent is the row the shell stacks directly above the
settings seat**. Positioning anchors on this seat's own outlet and offsets by that row's own height:

```css
div:has(> [data-slot="sidebar.footer.action"]) { position: relative }
[data-dsh-standalone-settings][data-wide="true"] {
  position: absolute; right: 0; top: 100%; margin-top: 10px;
  width: auto;              /* undo the seat's full-width cell */
  justify-content: flex-end;
  pointer-events: none;     /* only the button is a hit target */
}
[data-dsh-standalone-settings][data-wide="true"] .dshss-button { pointer-events: auto }
div:has(> [data-slot="sidebar.footer.action"] [data-dsh-standalone-settings][data-wide="true"]) + div {
  max-width: calc(100% - 44px);
}
```

No hashed host class name is referenced, and nothing is left behind when the plugin is unloaded.

## Compatibility

| Item | Value |
| --- | --- |
| Developed and verified against | DSH desktop `0.2.0-rc.2` (Windows x64) |
| `engines.dsh` | `>=0.2.0-rc.1 <0.3.0-0` |
| Host contracts used | `sidebar.footer.action` seat (props `{ wide }`) · the `settings.open` command · the `locale`, `shortcuts` and `slots` client services |

Three coupling points, most fragile first:

1. Opening the panel invokes the command registry on the shortcuts service
   (`ctx.shortcuts.registry.invoke`). That is not a documented public API and is the most likely
   thing to change; when it does, clicking warns on the console instead of failing silently.
2. The placement anchor `[data-slot="sidebar.footer.action"]` and the account row's 44px height.
3. Hiding the menu row relies on the Settings command currently having a bound shortcut.

Each failure degrades to the seat's default full-width row or to a duplicate menu entry. Nothing
crashes and the Settings entry never disappears.

## Support

Provided **as-is**. The author does **not** promise fixes, follow-up adaptation, or support.

That is deliberate: it is roughly 200 lines of plain JavaScript and it fails gracefully. If you want
it to keep working:

- **Fork it.** MIT licensed — modify, rename and republish freely, no permission needed.
- **Send a PR.** A fixed version is welcome; merging it is best-effort.
- **Fix it yourself.** Edit `client.js`, refresh the page. No build step, no dependencies.

## License

[MIT](LICENSE)
