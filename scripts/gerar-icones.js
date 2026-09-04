const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirIcons = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(dirIcons)) {
  fs.mkdirSync(dirIcons, { recursive: true });
}

// SVG do logotipo Fluxo moderno
const svgLogo = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141524" />
      <stop offset="50%" stop-color="#0E0F1A" />
      <stop offset="100%" stop-color="#07080D" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8F7BFF" />
      <stop offset="50%" stop-color="#6A5AF0" />
      <stop offset="100%" stop-color="#4E3DC8" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#6A5AF0" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${size * 0.04}" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Fundo com cantos arredondados -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bgGrad)" />
  <rect width="${size - 4}" height="${size - 4}" x="2" y="2" rx="${size * 0.22}" stroke="#6A5AF0" stroke-width="2" stroke-opacity="0.25" fill="none" />

  <!-- Símbolo Fluxo estilizado (ondas de progresso e finalização rápida) -->
  <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${size / 512 * 0.7})">
    <!-- Efeito de brilho de fundo -->
    <circle cx="256" cy="256" r="160" fill="#6A5AF0" opacity="0.22" filter="url(#glow)" />

    <!-- Barra superior do F / Fluxo -->
    <rect x="120" y="110" width="270" height="52" rx="26" fill="url(#primaryGrad)" />
    
    <!-- Barra intermediária -->
    <rect x="120" y="210" width="200" height="52" rx="26" fill="url(#primaryGrad)" />

    <!-- Coluna vertical conectando o fluxo -->
    <rect x="120" y="110" width="56" height="290" rx="28" fill="url(#primaryGrad)" />

    <!-- Ponto dinâmico de destaque / aceleração de fluxo -->
    <circle cx="360" cy="350" r="32" fill="url(#accentGrad)" />
  </g>
</svg>
`;

async function gerar() {
  console.log('Gerando ícones PWA...');
  
  // 512x512
  const svg512 = Buffer.from(svgLogo(512));
  await sharp(svg512).png().toFile(path.join(dirIcons, 'icon-512x512.png'));
  console.log('Criado: icon-512x512.png');

  // 192x192
  const svg192 = Buffer.from(svgLogo(192));
  await sharp(svg192).png().toFile(path.join(dirIcons, 'icon-192x192.png'));
  console.log('Criado: icon-192x192.png');

  // 180x180 (Apple touch icon)
  const svg180 = Buffer.from(svgLogo(180));
  await sharp(svg180).png().toFile(path.join(dirIcons, 'icon-apple.png'));
  console.log('Criado: icon-apple.png');

  // Favicon 48x48
  const svg48 = Buffer.from(svgLogo(48));
  await sharp(svg48).png().toFile(path.join(__dirname, '..', 'public', 'favicon.png'));
  console.log('Criado: favicon.png');

  console.log('Todos os ícones gerados com sucesso!');
}

gerar().catch((err) => {
  console.error('Erro ao gerar ícones:', err);
  process.exit(1);
});
