import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideWrapperProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: string;
}

export function SlideWrapper({ eyebrow, title, subtitle, children, footer = 'Dashboard Operacional Predilecta · Maio x Junho/2026' }: SlideWrapperProps) {
  return (
    <motion.section
      className="slide"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <header className="slide__header">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <img src="/assets/logo-predilecta.png" alt="Predilecta" className="slide__logo" />
      </header>
      <main className="slide__body">{children}</main>
      <footer className="slide__footer">{footer}</footer>
    </motion.section>
  );
}
