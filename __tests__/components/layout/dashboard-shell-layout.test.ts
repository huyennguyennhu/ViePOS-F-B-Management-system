import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readProjectFile = (filePath: string): string =>
  readFileSync(path.join(process.cwd(), filePath), 'utf8');

describe('dashboard shell layout contract', () => {
  it('defines the canonical desktop shell dimensions and contrast-safe active color', () => {
    const css = readProjectFile('app/dashboard.css');

    expect(css).toContain('--dashboard-sidebar-width: 225px');
    expect(css).toContain('--dashboard-topbar-height: 60px');
    expect(css).toContain('--dashboard-sidebar-bg: #143d00');
    expect(css).toContain('--dashboard-active-bg: #256e05');
  });

  it('uses semantic shell landmarks instead of the old centered dashboard card', () => {
    const shell = readProjectFile('components/layout/dashboard-shell.tsx');
    const clientShell = readProjectFile('components/layout/dashboard-shell-client.tsx');
    const sidebar = readProjectFile('components/layout/dashboard-sidebar.tsx');
    const topbar = readProjectFile('components/layout/dashboard-topbar.tsx');

    expect(shell).not.toContain('dashboard-card');
    expect(sidebar).toContain('<aside');
    expect(sidebar).toContain('<nav');
    expect(topbar).toContain('<header');
    expect(clientShell).toContain('<main');
  });

  it('keeps the mobile drawer accessible and closes it on navigation', () => {
    const clientShell = readProjectFile('components/layout/dashboard-shell-client.tsx');
    const sidebar = readProjectFile('components/layout/dashboard-sidebar.tsx');
    const topbar = readProjectFile('components/layout/dashboard-topbar.tsx');

    expect(topbar).toContain('aria-expanded');
    expect(sidebar).toContain('aria-hidden');
    expect(sidebar).toContain('inert');
    expect(clientShell).toContain('setIsDrawerOpen(false)');
    expect(clientShell).toContain('dashboard-drawer-backdrop');
  });

  it('inerts background content while the mobile drawer is open and restores menu focus', () => {
    const clientShell = readProjectFile('components/layout/dashboard-shell-client.tsx');
    const topbar = readProjectFile('components/layout/dashboard-topbar.tsx');

    expect(clientShell).toContain('menuButtonRef');
    expect(clientShell).toContain('menuButtonRef.current?.focus()');
    expect(clientShell).toContain('hideShellBehindDrawer');
    expect(clientShell).toContain('hideFromAssistiveTech={hideShellBehindDrawer}');
    expect(clientShell).toContain('aria-hidden={hideShellBehindDrawer}');
    expect(clientShell).toContain('inert={hideShellBehindDrawer}');
    expect(topbar).toContain('menuButtonRef');
    expect(topbar).toContain('aria-hidden={hideFromAssistiveTech}');
    expect(topbar).toContain('inert={hideFromAssistiveTech}');
  });

  it('uses exact current-page aria state instead of marking parent sections current', () => {
    const sidebar = readProjectFile('components/layout/dashboard-sidebar.tsx');

    expect(sidebar).toContain('isItemCurrent');
    expect(sidebar).toContain("aria-current={current ? 'page' : undefined}");
  });
});
