'use client';
import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Suspense>
      <NextUIProvider navigate={router.push}>{children}</NextUIProvider>
    </Suspense>
  );
}
