'use client';

import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1 pb-20 md:pt-16 md:pb-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Navigation />
    </ThemeProvider>
  );
}
