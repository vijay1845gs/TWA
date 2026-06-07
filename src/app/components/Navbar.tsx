'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../LanguageContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">SBT</Link>
      </div>
      <ul className={styles.navLinks}>
        <li><Link href="/" className={styles.navItem}>{t('home')}</Link></li>
        <li><Link href="/#collections" className={styles.navItem}>{t('collections')}</Link></li>
        <li><Link href="/#gallery" className={styles.navItem}>{t('gallery')}</Link></li>
        <li><Link href="/#contact" className={styles.navItem}>{t('contact')}</Link></li>
        
        <li>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
            className={styles.languageSelect}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
          </select>
        </li>
        
        <li>
          <Link href="/billing" className={styles.billingBtn}>
            {t('billing')}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
