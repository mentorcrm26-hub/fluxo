import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { ProvedorQuery } from '@/componentes/comum/ProvedorQuery';
import { ProvedorTema } from '@/componentes/layout/ProvedorTema';
import { ProvedorToast } from '@/componentes/ui/Toast';
import { AppShell } from '@/componentes/layout/AppShell';
import { RegistroPWA } from '@/componentes/comum/RegistroPWA';

const inter = Inter({
  subsets: ['latin'],
  variable: '--fonte-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--fonte-mono',
  display: 'swap',
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0D0E15',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Fluxo · Gerenciamento de Projetos e Recebimentos',
  description:
    'Workspace pessoal para gestão de projetos, extração de planilhas em PDF e controle de prazos financeiros.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-apple.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fluxo',
  },
  applicationName: 'Fluxo',
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body>
        <RegistroPWA />
        <ProvedorQuery>
          <ProvedorTema>
            <ProvedorToast>
              <AppShell>{children}</AppShell>
            </ProvedorToast>
          </ProvedorTema>
        </ProvedorQuery>
      </body>
    </html>
  );
}
