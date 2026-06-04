import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'theme_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly currentTheme = signal<ThemeMode>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  getTheme(): ThemeMode {
    return this.currentTheme();
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    this.writeTheme(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  private resolveInitialTheme(): ThemeMode {
    const storedTheme = this.readTheme();

    if (storedTheme) {
      return storedTheme;
    }

    if (this.isBrowser() && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    if (!this.isBrowser()) {
      return;
    }

    const root = this.document.documentElement;
    root.classList.toggle('dark-theme', theme === 'dark');
    root.classList.toggle('light-theme', theme === 'light');
    root.style.colorScheme = theme;
  }

  private readTheme(): ThemeMode | null {
    if (!this.isBrowser()) {
      return null;
    }

    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  }

  private writeTheme(theme: ThemeMode): void {
    if (this.isBrowser()) {
      localStorage.setItem(THEME_KEY, theme);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
