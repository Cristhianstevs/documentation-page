import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';

export const metadata: Metadata = {
  title: 'Base de conhecimento fictícia',
  description: 'Experimento do leitor Next.js da Etapa 1.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="pt-BR">
      <head>
        <link href="/legacy-custom.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
