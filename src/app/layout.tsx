import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { ProvedorQuery } from '@/componentes/comum/ProvedorQuery';
import { ProvedorTema } from '@/componentes/layout/ProvedorTema';
import { ProvedorToast } from '@/componentes/ui/Toast';
import { AppShell } from '@/componentes/layout/AppShell';

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

export const metadata: Metadata = {
  title: 'Fluxo · Gerenciamento de Projetos e Recebimentos',
  description:
    'Workspace pessoal para gestão de projetos, extração de planilhas em PDF e controle de prazos financeiros.',
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
      <body>
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
