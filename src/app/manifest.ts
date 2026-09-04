import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fluxo · Gerenciamento de Projetos e Recebimentos',
    short_name: 'Fluxo',
    description: 'Workspace pessoal para gestão de projetos, tarefas e prazos financeiros.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0E15',
    theme_color: '#6A5AF0',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-apple.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
