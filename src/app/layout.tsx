import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UniDown — Universal Media & File Downloader',
  description:
    'Download video, audio, media, and files from any website, social platform, or direct stream URL. Deployable to Vercel with zero configuration.',
  keywords: ['universal downloader', 'media downloader', 'video downloader', 'vercel downloader', 'file downloader'],
  authors: [{ name: 'UniDown' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-mesh selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
