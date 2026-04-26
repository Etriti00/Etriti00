import type { Metadata } from 'next';
import { TRPCProvider } from '~/components/trpc-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'nextjs-trpc-tailwind-playground',
  description: 'Next.js + tRPC + Tailwind + Postgres playground',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
