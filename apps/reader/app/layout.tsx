import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';

export const metadata: Metadata = {
  title: 'Base de conhecimento fictícia',
  description: 'Experimento do leitor Next.js da Etapa 1.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var stored=localStorage.getItem('documentation-page-theme');document.documentElement.dataset.theme=stored==='light'||stored==='dark'?stored:matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'})()`,
          }}
        />
        <link href="/legacy-custom.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
