/**
 * Standalone Settings button at the DSH sidebar foot.
 *
 * Desktop composes the account launcher into the shell's settings seat
 * (`settings.launcher`), which shadows the shipped Settings trigger and leaves
 * Settings reachable only as a row of the account menu. This plugin puts the entry
 * back as a control of its own: it renders into the shell's
 * `sidebar.footer.action` seat ("actions beside Settings at the sidebar foot") and,
 * while the sidebar is wide, pins that cell to the trailing edge of the
 * user/account row — beside the account button instead of behind it.
 *
 * Two knobs, both plain constants so the behavior is visible in one place:
 *   INLINE_WITH_ACCOUNT — pin the cell onto the account/user row while the sidebar is
 *     wide (false = leave it in the seat's own action row, the shape the other
 *     sidebar-foot actions use).
 *   HIDE_ACCOUNT_MENU_ENTRY — drop the account menu's own Settings row so the entry is
 *     not offered twice. It is matched by the Settings command's accessible key
 *     combination, never by host markup, and the requirement stands down whenever the
 *     pinned cell does (see PLACEMENT_CSS), so Settings is always reachable.
 *
 * Contracts used: the `sidebar.footer.action` slot (props `{ wide }`, registration
 * `{ name, id, order, label, locale, inject }`), the injected `locale` and
 * `shortcuts` services, and the `settings.open` command in the shortcuts catalog.
 * No Harness Client package is imported; no DOM outside this component is written.
 */
window.__ModuleLoader__.load({
  id: 'dsh-standalone-settings',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'standalone-settings';
    /** Marker attribute that scopes every stylesheet rule this plugin injects. */
    const MARKER = 'data-dsh-standalone-settings';
    /** The shipped command that opens (and focuses) the settings panel. */
    const SETTINGS_COMMAND = 'settings.open';

    /** Pin the control onto the account/user row while the sidebar is wide. */
    const INLINE_WITH_ACCOUNT = true;
    /** Hide the account menu's own Settings row whenever the pinned cell shows it. */
    const HIDE_ACCOUNT_MENU_ENTRY = true;

    /** Simplified Chinese dictionary (the key-set source of truth). */
    const zh = { label: '设置' };
    /** English dictionary, checked complete against the zh key set. */
    const en = { label: 'Settings' };

    /** Host-shaped face for the control itself. */
    const BASE_CSS = `
.dshss-cell{box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 100%;width:100%;min-width:0}
.dshss-cell[data-wide="false"]{flex:none;width:auto}
.dshss-button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;margin:0;padding:0;border:none;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit}
.dshss-button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshss-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dshss-cell[data-wide="false"] .dshss-button{width:28px;height:28px;border-radius:50%}
.dshss-button svg{display:block;flex:none}
`;

    /**
     * Rules that move the cell onto the account/user row while the sidebar is wide.
     *
     * Every seat renders through a display:contents outlet carrying its slot key, so a
     * cell's parent is that outlet and its grandparent is the row the shell stacks
     * directly above the settings seat. Anchoring on this seat's own outlet therefore
     * names that row without assuming a wrapper depth; offsetting by the row's own
     * height lands the cell on the next row down — the settings row, where the account
     * button lives — at the sidebar's trailing edge. The trailing margin on the settings
     * seat keeps a long account name from running under the control.
     *
     * A 56px rail has no room beside the account button (on Windows the whole foot is
     * hidden there), so the pinned cell stands down in that state and the account menu
     * keeps its own Settings row, which is the entry the rail already offers.
     *
     * The pinned cell is sized to the control (`width:auto` undoes the seat's full-width
     * cell) and it lets pointer events through, so a box that outgrows the control can
     * never cover the account button: only the button itself is a hit target.
     */
    const PLACEMENT_CSS = `
div:has(> [data-slot="sidebar.footer.action"]){position:relative}
[${MARKER}][data-wide="true"]{position:absolute;right:0;top:100%;margin-top:10px;z-index:2;width:auto;min-width:0;justify-content:flex-end;pointer-events:none}
[${MARKER}][data-wide="true"] .dshss-button{pointer-events:auto}
div:has(> [data-slot="sidebar.footer.action"] [${MARKER}][data-wide="true"]) + div{max-width:calc(100% - 44px)}
[${MARKER}][data-wide="false"]{display:none}
`;

    /** Settings gear artwork, copied from the host icon set (16px box, 1.3px stroke). */
    function GearIcon() {
      return h('svg', {
        width: 16,
        height: 16,
        viewBox: '0 0 16 16',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
        'aria-hidden': 'true',
        strokeWidth: 1.3,
      }, h('path', {
        d: 'M8 9.75012C8.9665 9.75012 9.75 8.96662 9.75 8.00012C9.75 7.03362 8.9665 6.25012 8 6.25012C7.0335 6.25012 6.25 7.03362 6.25 8.00012C6.25 8.96662 7.0335 9.75012 8 9.75012Z',
        stroke: 'currentColor',
      }), h('path', {
        d: 'M13.0107 7.79377C12.9505 7.89401 12.9205 7.94413 12.9205 7.99951C12.9205 8.0549 12.9505 8.10502 13.0106 8.20528L13.9849 9.83006C14.045 9.93029 14.0751 9.9804 14.0751 10.0358C14.0751 10.0911 14.045 10.1413 13.9849 10.2415L13.0037 11.8777C12.9468 11.9726 12.9184 12.0201 12.8725 12.0461C12.8267 12.072 12.7713 12.072 12.6607 12.072H10.6704C10.5598 12.072 10.5045 12.072 10.4586 12.098C10.4128 12.1239 10.3843 12.1714 10.3274 12.2662L9.33825 13.9142C9.28133 14.009 9.25287 14.0564 9.20703 14.0823C9.16118 14.1083 9.10588 14.1083 8.99529 14.1083H7.00486C6.89426 14.1083 6.83896 14.1083 6.79312 14.0823C6.74727 14.0564 6.71881 14.009 6.6619 13.9142L5.67273 12.2662C5.61581 12.1714 5.58735 12.1239 5.54151 12.098C5.49566 12.072 5.44036 12.072 5.32977 12.072H3.33945C3.2288 12.072 3.17347 12.072 3.12761 12.0461C3.08176 12.0201 3.0533 11.9726 2.9964 11.8777L2.0152 10.2415C1.9551 10.1413 1.92505 10.0911 1.92505 10.0358C1.92505 9.9804 1.9551 9.93029 2.0152 9.83006L2.98951 8.20528C3.04963 8.10502 3.07969 8.0549 3.07969 7.99951C3.07968 7.94413 3.04961 7.89401 2.98946 7.79377L2.01529 6.17011C1.95514 6.06987 1.92507 6.01975 1.92507 5.96437C1.92506 5.90899 1.95512 5.85886 2.01524 5.7586L2.9964 4.1224C3.0533 4.0275 3.08176 3.98005 3.12761 3.95408C3.17347 3.92811 3.2288 3.92811 3.33945 3.92811H5.32977C5.44036 3.92811 5.49566 3.92811 5.54151 3.90216C5.58735 3.87621 5.61581 3.82879 5.67273 3.73397L6.6619 2.08599C6.71881 1.99116 6.74727 1.94375 6.79312 1.9178C6.83896 1.89185 6.89426 1.89185 7.00486 1.89185H8.99529C9.10588 1.89185 9.16118 1.89185 9.20703 1.9178C9.25287 1.94375 9.28133 1.99116 9.33825 2.08599L10.3274 3.73397C10.3843 3.82879 10.4128 3.87621 10.4586 3.90216C10.5045 3.92811 10.5598 3.92811 10.6704 3.92811H12.6607C12.7713 3.92811 12.8267 3.92811 12.8725 3.95408C12.9184 3.98005 12.9468 4.0275 13.0037 4.1224L13.9849 5.7586C14.045 5.85886 14.0751 5.90899 14.0751 5.96437C14.0751 6.01975 14.045 6.06987 13.9849 6.17011L13.0107 7.79377Z',
        stroke: 'currentColor',
        strokeMiterlimit: '10',
      }));
    }

    /** Select the catalog row of the command this button runs. */
    function selectSettingsRow(rows) {
      return Array.isArray(rows) ? rows.find((row) => row.id === SETTINGS_COMMAND) : undefined;
    }

    /** Read-only rows used when the shortcuts catalog is unavailable, keeping the hook unconditional. */
    const NO_ROWS = [];
    const fallbackHook = (selector) => selector(NO_ROWS);

    /**
     * Hide one menu row by the accessible key combination of the Settings command.
     * Binding a combination is unique per command in the catalog, so the rule names
     * the Settings row and nothing else; an unbound command yields no rule and leaves
     * the account menu untouched.
     * @param aria - the catalog row's `aria` value, when the command is bound.
     * @returns the stylesheet text for the row, or an empty string.
     */
    function menuRowRule(aria) {
      if (!HIDE_ACCOUNT_MENU_ENTRY || typeof aria !== 'string' || aria === '') return '';
      const value = aria.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `[role="menuitem"][aria-keyshortcuts="${value}"]{display:none}`;
    }

    /**
     * The footer-action cell: a Settings button, plus the stylesheet it owns.
     * @param props - slot props: locale reader, column state, catalog hook and the open callback.
     * @returns the cell element tree.
     */
    function SettingsAction(props) {
      const { t, wide, openSettings } = props;
      const useRows = typeof props.useShortcuts === 'function' ? props.useShortcuts : fallbackHook;
      const row = useRows(selectSettingsRow);
      const label = t('label');
      const keys = row !== undefined && Array.isArray(row.keys) ? row.keys : [];
      // `keys` is already a display sequence: Windows bindings carry their own "+"
      // entries, macOS uses symbol keycaps, so the labels are only concatenated.
      const title = keys.length > 0 ? `${label} (${keys.join('')})` : label;
      // The account menu keeps its Settings row whenever the pinned cell is not showing
      // it, so the entry is never unreachable: always without the pin, and in the rail.
      const showMenuEntry = !INLINE_WITH_ACCOUNT || wide;
      const style = BASE_CSS
        + (INLINE_WITH_ACCOUNT ? PLACEMENT_CSS : '')
        + (showMenuEntry ? menuRowRule(row === undefined ? undefined : row.aria) : '');
      return h('div', {
        className: 'dshss-cell',
        [MARKER]: '1',
        'data-wide': wide ? 'true' : 'false',
      },
      h('style', { key: 'style' }, style),
      h('button', {
        key: 'button',
        type: 'button',
        className: 'dshss-button',
        title,
        'aria-label': title,
        'aria-haspopup': 'dialog',
        onClick: (event) => {
          event.stopPropagation();
          openSettings();
        },
      }, h(GearIcon, { key: 'icon' })));
    }

    /**
     * Open the settings panel by running its own registered command.
     *
     * The panel's state belongs to the settings shell, whose only supported entry
     * points are its own trigger and this command; running the command is the one
     * route that neither duplicates the panel nor reaches into another plugin's UI.
     * @param ctx - this plugin's client context.
     */
    function openSettings(ctx) {
      const registry = ctx.shortcuts.registry;
      if (registry !== undefined && typeof registry.invoke === 'function') {
        // `modal: null` keeps the call idempotent: the command opens the panel and
        // never treats the button as a second press of its shortcut.
        registry.invoke(SETTINGS_COMMAND, { region: 'page', modal: null, source: 'menu' });
        return;
      }
      console.warn('[standalone-settings] the shortcuts registry is unavailable; cannot open Settings');
    }

    /**
     * Register the button in the sidebar foot's action seat.
     * @param ctx - client root context carrying `slots`, `locale` and `shortcuts`.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'standalone-settings: dictionaries');
      const t = ctx.locale.bind(NS);
      // The catalog is a live observable: a Settings command registered later still
      // reaches the component, and its shortcut is re-read on every change.
      const catalog = ctx.shortcuts.catalog;
      ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'standalone-settings',
        order: 20,
        label: () => t('label'),
        locale: NS,
        inject: () => ({
          hooks: { shortcuts: catalog },
          openSettings: () => openSettings(ctx),
        }),
      }, SettingsAction));
    }

    return { inject: ['slots', 'locale', 'shortcuts'], apply };
  },
});
