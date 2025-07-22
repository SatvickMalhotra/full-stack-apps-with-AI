// src/components/header.tsx
"use client";

import Link from 'next/link';
import { PackagePlus } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher'; // New
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <PackagePlus className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            {t('appName')}
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild className="text-xs sm:text-sm px-2 sm:px-3">
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" asChild className="text-xs sm:text-sm px-2 sm:px-3">
            <Link href="/admin">{t('admin')}</Link>
          </Button>
        </nav>
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
