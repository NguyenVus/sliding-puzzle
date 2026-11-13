export interface PicturePreset {
  id: string;
  name: string;
  thumbnail: string;
  url: string;
}

// Crisp, lightweight vector art data URIs
const FUJI_SUNSET_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f1c2c"/>
      <stop offset="35%" stop-color="#923956"/>
      <stop offset="65%" stop-color="#e8615a"/>
      <stop offset="90%" stop-color="#f8a563"/>
      <stop offset="100%" stop-color="#ffd59b"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff5db"/>
      <stop offset="100%" stop-color="#ff455b"/>
    </linearGradient>
    <linearGradient id="fuji" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d1c3a"/>
      <stop offset="100%" stop-color="#100a1c"/>
    </linearGradient>
    <linearGradient id="snow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2d2f9"/>
    </linearGradient>
    <linearGradient id="lake" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3d1e44"/>
      <stop offset="100%" stop-color="#170d24"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="600" fill="url(#sky)"/>

  <!-- Sun -->
  <circle cx="300" cy="270" r="130" fill="url(#sun)" opacity="0.95"/>

  <!-- Mount Fuji -->
  <polygon points="120,490 300,190 480,490" fill="url(#fuji)"/>
  <!-- Snow Cap -->
  <path d="M260,256 L300,190 L340,256 Q320,270 305,250 Q290,275 275,255 Z" fill="url(#snow)"/>

  <!-- Silhouette Hills & Lake -->
  <path d="M0,470 Q160,430 310,480 T600,460 L600,600 L0,600 Z" fill="url(#lake)"/>
  <path d="M0,520 Q200,500 400,530 T600,515 L600,600 L0,600 Z" fill="#0d0614"/>

  <!-- Cherry Blossom Branch Silhouette -->
  <path d="M0,90 Q80,70 150,110 T240,120" stroke="#16081e" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M80,80 Q100,50 130,40" stroke="#16081e" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M150,110 Q190,95 210,80" stroke="#16081e" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Blossoms -->
  <circle cx="120" cy="40" r="14" fill="#ff9ebb" opacity="0.9"/>
  <circle cx="140" cy="45" r="12" fill="#ffc2d4" opacity="0.95"/>
  <circle cx="150" cy="100" r="15" fill="#ff8fa8" opacity="0.9"/>
  <circle cx="180" cy="95" r="13" fill="#ffb4c8" opacity="0.9"/>
  <circle cx="210" cy="80" r="12" fill="#ff7096" opacity="0.85"/>
  <circle cx="235" cy="120" r="14" fill="#ffaec0" opacity="0.9"/>
  <circle cx="95" cy="75" r="11" fill="#ffb4c8" opacity="0.9"/>
  <circle cx="65" cy="85" r="13" fill="#ff8fa8" opacity="0.95"/>

  <!-- Birds -->
  <path d="M380,140 Q390,130 400,136 Q410,130 420,140 Q410,133 400,138 Q390,133 380,140 Z" fill="#2d1c3a"/>
  <path d="M430,165 Q437,157 445,162 Q453,157 460,165 Q453,160 445,164 Q437,160 430,165 Z" fill="#2d1c3a"/>
</svg>
`)}`;

const PINE_FOREST_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b1a2b"/>
      <stop offset="45%" stop-color="#14344d"/>
      <stop offset="80%" stop-color="#23586a"/>
      <stop offset="100%" stop-color="#4e8782"/>
    </linearGradient>
    <linearGradient id="pineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffeaa7"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="600" fill="url(#nightSky)"/>

  <!-- Crescent Moon -->
  <circle cx="480" cy="120" r="45" fill="url(#pineGlow)"/>
  <circle cx="495" cy="110" r="42" fill="#0e2338"/>

  <!-- Distant Stars -->
  <circle cx="100" cy="80" r="2" fill="#ffffff" opacity="0.8"/>
  <circle cx="160" cy="130" r="2.5" fill="#ffffff" opacity="0.9"/>
  <circle cx="230" cy="65" r="1.8" fill="#ffffff" opacity="0.7"/>
  <circle cx="340" cy="95" r="2.2" fill="#ffffff" opacity="0.85"/>
  <circle cx="280" cy="150" r="1.5" fill="#ffffff" opacity="0.6"/>

  <!-- Mountain Backdrop -->
  <polygon points="-40,420 180,240 380,420" fill="#16394f" opacity="0.85"/>
  <polygon points="160,420 370,210 590,420" fill="#1b455b" opacity="0.9"/>

  <!-- Layer 1 Pines (Distant) -->
  <path d="M60,450 L100,340 L140,450 Z M180,460 L220,330 L260,460 Z M340,470 L380,350 L420,470 Z M460,460 L500,335 L540,460 Z" fill="#133644"/>

  <!-- Layer 2 Pines (Mid) -->
  <path d="M-10,510 L40,370 L90,510 Z M120,520 L170,360 L220,520 Z M280,515 L330,375 L380,515 Z M410,520 L460,365 L510,520 Z M520,510 L570,380 L620,510 Z" fill="#0d2633"/>

  <!-- Layer 3 Pines (Foreground) -->
  <path d="M30,600 L110,410 L190,600 Z M200,600 L280,400 L360,600 Z M380,600 L460,420 L540,600 Z" fill="#061620"/>
  <rect x="0" y="560" width="600" height="40" fill="#061620"/>
</svg>
`)}`;

const OCEAN_WAVE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="oceanSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffecd2"/>
      <stop offset="50%" stop-color="#fcb69f"/>
      <stop offset="100%" stop-color="#e27c73"/>
    </linearGradient>
    <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#19547b"/>
      <stop offset="100%" stop-color="#0f3443"/>
    </linearGradient>
    <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2c82a3"/>
      <stop offset="100%" stop-color="#14495e"/>
    </linearGradient>
    <linearGradient id="waveFoam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#d4f1f9"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="600" fill="url(#oceanSky)"/>

  <!-- Glowing Sun -->
  <circle cx="300" cy="220" r="85" fill="#ffffff" opacity="0.95"/>
  <circle cx="300" cy="220" r="115" fill="#fff275" opacity="0.3"/>

  <!-- Horizon Water -->
  <rect x="0" y="320" width="600" height="280" fill="#205a75"/>

  <!-- Big Swirling Wave -->
  <path d="M0,440 Q150,310 320,380 T600,360 L600,600 L0,600 Z" fill="url(#wave2)"/>
  
  <path d="M0,500 Q180,360 380,440 T600,430 L600,600 L0,600 Z" fill="url(#wave1)"/>
  <!-- Foam Crests -->
  <path d="M140,415 Q170,395 210,410 Q240,390 280,410 Q320,395 360,420" stroke="url(#waveFoam)" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M20,470 Q60,450 110,465 Q160,445 220,465" stroke="url(#waveFoam)" stroke-width="10" fill="none" stroke-linecap="round"/>
</svg>
`)}`;

export const DEFAULT_PICTURE_PRESETS: PicturePreset[] = [
  {
    id: 'preset-fuji',
    name: 'Núi Phú Sĩ',
    thumbnail: FUJI_SUNSET_SVG,
    url: FUJI_SUNSET_SVG,
  },
  {
    id: 'preset-pine',
    name: 'Rừng Thông',
    thumbnail: PINE_FOREST_SVG,
    url: PINE_FOREST_SVG,
  },
  {
    id: 'preset-wave',
    name: 'Sóng Biển',
    thumbnail: OCEAN_WAVE_SVG,
    url: OCEAN_WAVE_SVG,
  },
];
