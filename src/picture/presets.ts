export type PresetCategory = 'animals' | 'nature' | 'space' | 'art';

export interface PicturePreset {
  id: string;
  name: string;
  category: PresetCategory;
  categoryLabel?: string;
  thumbnail: string;
  url: string;
}

// ============================================================================
// 1. Núi Phú Sĩ Bình Minh (Mount Fuji Sunrise) - Category: nature
// ============================================================================
const FUJI_SUNSET_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sky-fuji" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f1c2c"/>
      <stop offset="35%" stop-color="#923956"/>
      <stop offset="65%" stop-color="#e8615a"/>
      <stop offset="90%" stop-color="#f8a563"/>
      <stop offset="100%" stop-color="#ffd59b"/>
    </linearGradient>
    <linearGradient id="sun-fuji" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff5db"/>
      <stop offset="100%" stop-color="#ff455b"/>
    </linearGradient>
    <linearGradient id="fuji-body" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d1c3a"/>
      <stop offset="100%" stop-color="#100a1c"/>
    </linearGradient>
    <linearGradient id="snow-cap" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2d2f9"/>
    </linearGradient>
    <linearGradient id="lake-fuji" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3d1e44"/>
      <stop offset="100%" stop-color="#170d24"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="600" fill="url(#sky-fuji)"/>

  <!-- Sun -->
  <circle cx="300" cy="270" r="130" fill="url(#sun-fuji)" opacity="0.95"/>

  <!-- Mount Fuji -->
  <polygon points="120,490 300,190 480,490" fill="url(#fuji-body)"/>
  <!-- Snow Cap -->
  <path d="M260,256 L300,190 L340,256 Q320,270 305,250 Q290,275 275,255 Z" fill="url(#snow-cap)"/>

  <!-- Silhouette Hills & Lake -->
  <path d="M0,470 Q160,430 310,480 T600,460 L600,600 L0,600 Z" fill="url(#lake-fuji)"/>
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

// ============================================================================
// 2. Mèo Cam Thảnh Thơi (Cute Ginger Cat) - Category: animals
// ============================================================================
const CUTE_GINGER_CAT_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="wall-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="60%" stop-color="#115e59"/>
      <stop offset="100%" stop-color="#134e4a"/>
    </linearGradient>
    <linearGradient id="cushion-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="50%" stop-color="#6d28d9"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
    <linearGradient id="cat-fur" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <linearGradient id="cat-stripe" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c2410c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
    <linearGradient id="floor-wood" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
  </defs>

  <!-- Wall Background -->
  <rect width="600" height="440" fill="url(#wall-grad)"/>

  <!-- Warm Wooden Parquet Floor -->
  <rect y="440" width="600" height="160" fill="url(#floor-wood)"/>
  <!-- Floor Planks -->
  <line x1="120" y1="440" x2="60" y2="600" stroke="#78350f" stroke-width="2"/>
  <line x1="280" y1="440" x2="240" y2="600" stroke="#78350f" stroke-width="2"/>
  <line x1="440" y1="440" x2="420" y2="600" stroke="#78350f" stroke-width="2"/>

  <!-- Circular Sun Window (Top-Left) -->
  <circle cx="120" cy="130" r="75" fill="#fef08a"/>
  <circle cx="120" cy="130" r="75" stroke="#fde047" stroke-width="8" fill="none"/>
  <line x1="45" y1="130" x2="195" y2="130" stroke="#ca8a04" stroke-width="4"/>
  <line x1="120" y1="55" x2="120" y2="205" stroke="#ca8a04" stroke-width="4"/>
  <!-- Little bird silhouette on window -->
  <path d="M140,126 Q150,118 160,120 Q168,118 174,124 Q166,126 162,130 L155,130 Z" fill="#134e4a"/>

  <!-- Golden Sunbeam Beam streaming across -->
  <polygon points="120,130 0,440 220,440" fill="#fef08a" opacity="0.18"/>

  <!-- Hanging Houseplant (Top-Right) -->
  <line x1="480" y1="0" x2="480" y2="90" stroke="#fcd34d" stroke-width="3"/>
  <path d="M455,90 L505,90 L495,120 L465,120 Z" fill="#d97706"/>
  <!-- Trailing Vines/Leaves -->
  <path d="M480,110 Q510,130 520,170" stroke="#15803d" stroke-width="3" fill="none"/>
  <circle cx="520" cy="170" r="10" fill="#22c55e"/>
  <path d="M465,110 Q440,140 435,185" stroke="#15803d" stroke-width="3" fill="none"/>
  <circle cx="435" cy="185" r="12" fill="#16a34a"/>
  <path d="M485,115 Q495,160 480,200" stroke="#15803d" stroke-width="3" fill="none"/>
  <circle cx="480" cy="200" r="11" fill="#4ade80"/>

  <!-- Royal Purple Velvet Cushion -->
  <ellipse cx="300" cy="460" rx="190" ry="70" fill="url(#cushion-grad)"/>
  <ellipse cx="300" cy="455" rx="175" ry="60" fill="#8b5cf6" opacity="0.25"/>

  <!-- Chubby Ginger Cat Body -->
  <ellipse cx="300" cy="410" rx="115" ry="90" fill="url(#cat-fur)"/>

  <!-- White Chest / Belly -->
  <ellipse cx="300" cy="430" rx="60" ry="55" fill="#ffffff"/>

  <!-- Tabby Stripes on Back -->
  <path d="M220,380 Q250,390 240,410" stroke="url(#cat-stripe)" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M210,410 Q240,420 230,440" stroke="url(#cat-stripe)" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M380,380 Q350,390 360,410" stroke="url(#cat-stripe)" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M390,410 Q360,420 370,440" stroke="url(#cat-stripe)" stroke-width="8" stroke-linecap="round" fill="none"/>

  <!-- White Front Paws tucked in -->
  <ellipse cx="270" cy="465" rx="22" ry="16" fill="#ffffff"/>
  <ellipse cx="330" cy="465" rx="22" ry="16" fill="#ffffff"/>

  <!-- Curled Ginger Tail (Right Side) -->
  <path d="M390,440 Q450,440 460,390 Q465,340 435,320" stroke="url(#cat-fur)" stroke-width="26" stroke-linecap="round" fill="none"/>
  <!-- White tail tip -->
  <circle cx="435" cy="320" r="14" fill="#ffffff"/>

  <!-- Cat Head -->
  <circle cx="300" cy="300" r="75" fill="url(#cat-fur)"/>

  <!-- Ears (Triangular with pink inner) -->
  <polygon points="235,270 220,185 280,240" fill="url(#cat-fur)"/>
  <polygon points="238,260 230,200 270,240" fill="#f472b6"/>

  <polygon points="365,270 380,185 320,240" fill="url(#cat-fur)"/>
  <polygon points="362,260 370,200 330,240" fill="#f472b6"/>

  <!-- Head Tabby Markings -->
  <path d="M300,230 L300,255 M285,235 L290,260 M315,235 L310,260" stroke="url(#cat-stripe)" stroke-width="5" stroke-linecap="round"/>

  <!-- Big Emerald Green Eyes -->
  <circle cx="265" cy="295" r="16" fill="#10b981"/>
  <circle cx="265" cy="295" r="10" fill="#064e3b"/>
  <circle cx="269" cy="291" r="5" fill="#ffffff"/>

  <circle cx="335" cy="295" r="16" fill="#10b981"/>
  <circle cx="335" cy="295" r="10" fill="#064e3b"/>
  <circle cx="339" cy="291" r="5" fill="#ffffff"/>

  <!-- White Muzzle & Pink Nose -->
  <ellipse cx="288" cy="330" rx="16" ry="12" fill="#ffffff"/>
  <ellipse cx="312" cy="330" rx="16" ry="12" fill="#ffffff"/>
  <polygon points="300,322 293,314 307,314" fill="#fb7185"/>

  <!-- Whiskers -->
  <path d="M280,328 L210,320 M280,332 L215,336 M280,336 L220,350" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <path d="M320,328 L390,320 M320,332 L385,336 M320,336 L380,350" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

  <!-- Red Collar with Shiny Golden Bell -->
  <path d="M255,365 Q300,385 345,365" stroke="#ef4444" stroke-width="10" stroke-linecap="round" fill="none"/>
  <circle cx="300" cy="380" r="12" fill="#fbbf24"/>
  <circle cx="300" cy="380" r="3" fill="#78350f"/>

  <!-- Magenta Ball of Yarn with loose thread (Bottom-Right) -->
  <circle cx="490" cy="520" r="30" fill="#ec4899"/>
  <path d="M490,490 Q515,520 490,550 Q465,520 490,490" stroke="#db2777" stroke-width="4" fill="none"/>
  <path d="M470,535 Q430,550 400,530 T360,560" stroke="#ec4899" stroke-width="4" stroke-linecap="round" fill="none"/>
</svg>
`)}`;

// ============================================================================
// 3. Cún Corgi Năng Động (Happy Corgi) - Category: animals
// ============================================================================
const HAPPY_CORGI_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="corgi-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="corgi-grass1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="corgi-grass2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="corgi-coat" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="60%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
  </defs>

  <!-- Clear Blue Sky -->
  <rect width="600" height="600" fill="url(#corgi-sky)"/>

  <!-- Fluffy Cloud & Butterfly (Top-Left) -->
  <path d="M80,120 Q95,95 125,100 Q150,85 175,105 Q205,105 210,130 Q215,155 185,160 L95,160 Q75,150 80,120 Z" fill="#ffffff" opacity="0.95"/>
  <!-- Yellow Butterfly -->
  <circle cx="230" cy="115" r="5" fill="#facc15"/>
  <ellipse cx="225" cy="110" rx="7" ry="5" fill="#fde047" transform="rotate(-30 225 110)"/>
  <ellipse cx="235" cy="110" rx="7" ry="5" fill="#fde047" transform="rotate(30 235 110)"/>

  <!-- Radiant Golden Sun (Top-Right) -->
  <circle cx="490" cy="110" r="55" fill="#f59e0b"/>
  <circle cx="490" cy="110" r="70" fill="#fef08a" opacity="0.4"/>
  <!-- Sun Rays -->
  <line x1="490" y1="30" x2="490" y2="45" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <line x1="490" y1="175" x2="490" y2="190" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <line x1="410" y1="110" x2="425" y2="110" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <line x1="555" y1="110" x2="570" y2="110" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <line x1="435" y1="55" x2="445" y2="65" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <line x1="535" y1="155" x2="545" y2="165" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>

  <!-- Rolling Hills -->
  <path d="M0,380 Q180,310 380,350 T600,320 L600,600 L0,600 Z" fill="url(#corgi-grass1)"/>
  <path d="M0,450 Q220,390 440,430 T600,410 L600,600 L0,600 Z" fill="url(#corgi-grass2)"/>

  <!-- Leaping Corgi Dog -->
  <!-- Fluffy Butt & Rear Leg -->
  <ellipse cx="190" cy="370" rx="60" ry="50" fill="url(#corgi-coat)"/>
  <circle cx="145" cy="365" r="16" fill="#ffffff"/>

  <!-- Body -->
  <ellipse cx="280" cy="350" rx="95" ry="60" fill="url(#corgi-coat)"/>
  <!-- White Chest / Underbelly -->
  <path d="M240,380 Q290,410 350,380 L340,340 Q280,350 240,380 Z" fill="#ffffff"/>

  <!-- Hind Legs in Leap -->
  <rect x="180" y="390" width="22" height="40" rx="11" fill="url(#corgi-coat)" transform="rotate(-30 180 390)"/>
  <circle cx="165" cy="435" r="12" fill="#ffffff"/>

  <!-- Front Legs Extended Forward -->
  <rect x="340" y="360" width="22" height="45" rx="11" fill="url(#corgi-coat)" transform="rotate(35 340 360)"/>
  <circle cx="375" cy="410" r="12" fill="#ffffff"/>
  <rect x="360" y="340" width="20" height="45" rx="10" fill="url(#corgi-coat)" transform="rotate(50 360 340)"/>
  <circle cx="405" cy="385" r="11" fill="#ffffff"/>

  <!-- Corgi Head -->
  <circle cx="370" cy="270" r="55" fill="url(#corgi-coat)"/>

  <!-- Big Upright Fox-Like Ears -->
  <polygon points="330,240 310,135 365,210" fill="url(#corgi-coat)"/>
  <polygon points="332,230 320,150 358,210" fill="#fca5a5"/>

  <polygon points="410,240 435,135 380,210" fill="url(#corgi-coat)"/>
  <polygon points="408,230 425,150 388,210" fill="#fca5a5"/>

  <!-- White Blaze on Face & Muzzle -->
  <path d="M360,225 Q370,260 370,300 Q380,260 380,225 Z" fill="#ffffff"/>
  <ellipse cx="370" cy="300" rx="30" ry="22" fill="#ffffff"/>

  <!-- Black Nose -->
  <ellipse cx="370" cy="288" rx="10" ry="7" fill="#0f172a"/>

  <!-- Cheerful Dark Eyes -->
  <circle cx="345" cy="265" r="9" fill="#1e1b4b"/>
  <circle cx="347" cy="263" r="3" fill="#ffffff"/>
  <circle cx="395" cy="265" r="9" fill="#1e1b4b"/>
  <circle cx="397" cy="263" r="3" fill="#ffffff"/>

  <!-- Happy Open Mouth & Pink Tongue -->
  <path d="M358,302 Q370,314 382,302" stroke="#0f172a" stroke-width="3" fill="none"/>
  <path d="M364,306 Q370,332 376,306 Z" fill="#f43f5e"/>

  <!-- Red Polka-Dot Bandana around neck -->
  <polygon points="340,315 410,315 375,355" fill="#ef4444"/>
  <circle cx="365" cy="330" r="3" fill="#ffffff"/>
  <circle cx="385" cy="330" r="3" fill="#ffffff"/>
  <circle cx="375" cy="342" r="2.5" fill="#ffffff"/>

  <!-- Cheerful Spring Daisies (Bottom-Left) -->
  <circle cx="70" cy="510" r="6" fill="#facc15"/>
  <circle cx="60" cy="510" r="5" fill="#ffffff"/>
  <circle cx="80" cy="510" r="5" fill="#ffffff"/>
  <circle cx="70" cy="500" r="5" fill="#ffffff"/>
  <circle cx="70" cy="520" r="5" fill="#ffffff"/>

  <circle cx="120" cy="540" r="7" fill="#facc15"/>
  <circle cx="108" cy="540" r="6" fill="#ffffff"/>
  <circle cx="132" cy="540" r="6" fill="#ffffff"/>
  <circle cx="120" cy="528" r="6" fill="#ffffff"/>
  <circle cx="120" cy="552" r="6" fill="#ffffff"/>

  <!-- Bouncing Neon Tennis Ball (Bottom-Right) -->
  <circle cx="490" cy="490" r="28" fill="#84cc16"/>
  <path d="M472,475 Q495,490 475,510" stroke="#f7fee7" stroke-width="3" fill="none"/>
  <path d="M508,475 Q485,490 505,510" stroke="#f7fee7" stroke-width="3" fill="none"/>
  <path d="M450,515 Q470,525 490,522" stroke="#65a30d" stroke-width="2.5" stroke-dasharray="4,4" fill="none"/>
</svg>
`)}`;

// ============================================================================
// 4. Gấu Trúc Vườn Trúc (Panda Paradise) - Category: animals
// ============================================================================
const PANDA_PARADISE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="panda-mist" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="50%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <linearGradient id="bamboo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="50%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="mountain-mist" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>

  <!-- Misty Sky -->
  <rect width="600" height="600" fill="url(#panda-mist)"/>

  <!-- Distant Karst Mountain Silhouette -->
  <polygon points="120,320 280,140 440,320" fill="url(#mountain-mist)" opacity="0.35"/>
  <polygon points="320,320 460,180 580,320" fill="url(#mountain-mist)" opacity="0.4"/>

  <!-- Left Bamboo Culms -->
  <rect x="30" y="0" width="22" height="600" fill="url(#bamboo-grad)"/>
  <line x1="30" y1="120" x2="52" y2="120" stroke="#14532d" stroke-width="3"/>
  <line x1="30" y1="260" x2="52" y2="260" stroke="#14532d" stroke-width="3"/>
  <line x1="30" y1="400" x2="52" y2="400" stroke="#14532d" stroke-width="3"/>

  <rect x="75" y="0" width="16" height="600" fill="url(#bamboo-grad)"/>
  <line x1="75" y1="180" x2="91" y2="180" stroke="#14532d" stroke-width="3"/>
  <line x1="75" y1="340" x2="91" y2="340" stroke="#14532d" stroke-width="3"/>

  <!-- Bamboo Leaves (Top-Left) -->
  <path d="M50,120 Q90,110 130,130 Q90,130 50,120 Z" fill="#22c55e"/>
  <path d="M50,120 Q100,90 140,95 Q90,110 50,120 Z" fill="#16a34a"/>
  <path d="M90,180 Q140,165 180,185 Q135,185 90,180 Z" fill="#22c55e"/>
  <path d="M90,340 Q130,330 170,350 Q130,350 90,340 Z" fill="#15803d"/>

  <!-- Right Bamboo Culms -->
  <rect x="520" y="0" width="24" height="600" fill="url(#bamboo-grad)"/>
  <line x1="520" y1="140" x2="544" y2="140" stroke="#14532d" stroke-width="3"/>
  <line x1="520" y1="300" x2="544" y2="300" stroke="#14532d" stroke-width="3"/>
  <path d="M520,140 Q470,125 430,140 Q475,145 520,140 Z" fill="#22c55e"/>
  <path d="M520,300 Q460,285 410,305 Q470,310 520,300 Z" fill="#16a34a"/>

  <!-- Grassy Hillocks -->
  <path d="M0,480 Q280,420 600,470 L600,600 L0,600 Z" fill="#16a34a"/>
  <path d="M0,530 Q300,500 600,540 L600,600 L0,600 Z" fill="#15803d"/>

  <!-- Chubby Panda Body -->
  <!-- Black Hind Legs / Paws -->
  <ellipse cx="200" cy="490" rx="45" ry="32" fill="#0f172a"/>
  <ellipse cx="400" cy="490" rx="45" ry="32" fill="#0f172a"/>
  <ellipse cx="200" cy="495" rx="16" ry="12" fill="#334155"/>
  <circle cx="185" cy="475" r="5" fill="#334155"/>
  <circle cx="200" cy="470" r="5" fill="#334155"/>
  <circle cx="215" cy="475" r="5" fill="#334155"/>

  <ellipse cx="400" cy="495" rx="16" ry="12" fill="#334155"/>
  <circle cx="385" cy="475" r="5" fill="#334155"/>
  <circle cx="400" cy="470" r="5" fill="#334155"/>
  <circle cx="415" cy="475" r="5" fill="#334155"/>

  <!-- Panda White Belly -->
  <circle cx="300" cy="410" r="110" fill="#ffffff"/>

  <!-- Black Shoulders & Arms -->
  <path d="M195,350 Q300,310 405,350 Q430,420 370,440 Q300,420 230,440 Q170,420 195,350 Z" fill="#0f172a"/>

  <!-- Panda Head -->
  <circle cx="300" cy="270" r="85" fill="#ffffff"/>

  <!-- Round Black Ears -->
  <circle cx="225" cy="195" r="32" fill="#0f172a"/>
  <circle cx="375" cy="195" r="32" fill="#0f172a"/>

  <!-- Iconic Black Eye Patches -->
  <ellipse cx="260" cy="265" rx="22" ry="28" fill="#0f172a" transform="rotate(-18 260 265)"/>
  <ellipse cx="340" cy="265" rx="22" ry="28" fill="#0f172a" transform="rotate(18 340 265)"/>

  <!-- Sparkling Eyes -->
  <circle cx="262" cy="262" r="7" fill="#ffffff"/>
  <circle cx="263" cy="262" r="4" fill="#020617"/>
  <circle cx="338" cy="262" r="7" fill="#ffffff"/>
  <circle cx="337" cy="262" r="4" fill="#020617"/>

  <!-- Cute Rosy Cheeks -->
  <ellipse cx="235" cy="295" rx="14" ry="9" fill="#fca5a5" opacity="0.6"/>
  <ellipse cx="365" cy="295" rx="14" ry="9" fill="#fca5a5" opacity="0.6"/>

  <!-- Nose & Smile -->
  <ellipse cx="300" cy="290" rx="14" ry="10" fill="#0f172a"/>
  <path d="M290,305 Q300,315 310,305" stroke="#0f172a" stroke-width="3" fill="none"/>

  <!-- Panda Holding Fresh Bamboo Stalk -->
  <path d="M220,440 L380,310" stroke="#4ade80" stroke-width="12" stroke-linecap="round"/>
  <path d="M380,310 Q420,290 440,310 Q400,320 380,310 Z" fill="#22c55e"/>
  <path d="M350,335 Q380,330 400,350 Q365,355 350,335 Z" fill="#16a34a"/>

  <!-- Panda Paws gripping stalk -->
  <circle cx="260" cy="405" r="22" fill="#0f172a"/>
  <circle cx="340" cy="345" r="22" fill="#0f172a"/>

  <!-- Pink Lotus Flower in Bottom-Left -->
  <path d="M100,550 Q80,520 100,490 Q120,520 100,550 Z" fill="#f43f5e"/>
  <path d="M85,550 Q65,530 80,505 Q105,530 85,550 Z" fill="#fb7185"/>
  <path d="M115,550 Q135,530 120,505 Q95,530 115,550 Z" fill="#fb7185"/>
  <circle cx="100" cy="540" r="6" fill="#fde047"/>
</svg>
`)}`;

// ============================================================================
// 5. Phi Hành Gia Ngân Hà (Astronaut in Cosmos) - Category: space
// ============================================================================
const ASTRONAUT_COSMOS_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="space-void" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050515"/>
      <stop offset="40%" stop-color="#0d0826"/>
      <stop offset="80%" stop-color="#190634"/>
      <stop offset="100%" stop-color="#2a0845"/>
    </linearGradient>
    <linearGradient id="nebula-pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="nebula-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="60%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="gold-visor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="suit-white" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>

  <!-- Deep Cosmic Void -->
  <rect width="600" height="600" fill="url(#space-void)"/>

  <!-- Glowing Nebulae -->
  <circle cx="100" cy="120" r="140" fill="url(#nebula-pink)" opacity="0.35"/>
  <circle cx="480" cy="450" r="160" fill="url(#nebula-cyan)" opacity="0.3"/>

  <!-- Distant Spiral Galaxy (Top-Right) -->
  <ellipse cx="480" cy="110" rx="60" ry="24" fill="#a855f7" opacity="0.5" transform="rotate(-25 480 110)"/>
  <ellipse cx="480" cy="110" rx="40" ry="14" fill="#38bdf8" opacity="0.7" transform="rotate(-25 480 110)"/>
  <circle cx="480" cy="110" r="8" fill="#ffffff"/>

  <!-- Starfield & Starbursts -->
  <circle cx="60" cy="60" r="2" fill="#ffffff"/>
  <circle cx="220" cy="70" r="2.5" fill="#ffffff"/>
  <circle cx="150" cy="220" r="1.5" fill="#ffffff"/>
  <circle cx="380" cy="60" r="2" fill="#ffffff"/>
  <circle cx="530" cy="240" r="2" fill="#ffffff"/>
  <circle cx="90" cy="460" r="2" fill="#ffffff"/>
  <!-- Starburst (Top-Left) -->
  <path d="M120,70 L120,94 M108,82 L132,82" stroke="#ffffff" stroke-width="2"/>
  <circle cx="120" cy="82" r="3" fill="#ffffff"/>

  <!-- Earth in Lower Right / Visor Reflection -->
  <circle cx="530" cy="530" r="110" fill="#0284c7"/>
  <circle cx="530" cy="530" r="110" fill="#059669" opacity="0.5"/>
  <path d="M460,480 Q510,460 550,510 T600,530" fill="#22c55e" opacity="0.8"/>
  <path d="M440,540 Q490,520 530,570" fill="#22c55e" opacity="0.8"/>

  <!-- Floating Astronaut Life Support Backpack -->
  <rect x="230" y="240" width="140" height="190" rx="24" fill="#475569"/>
  <rect x="240" y="250" width="120" height="170" rx="18" fill="#64748b"/>
  <!-- Thruster Blue Ion Glow -->
  <ellipse cx="250" cy="435" rx="12" ry="18" fill="#38bdf8" opacity="0.8"/>
  <ellipse cx="350" cy="435" rx="12" ry="18" fill="#38bdf8" opacity="0.8"/>

  <!-- Spacesuit Torso -->
  <rect x="250" y="270" width="100" height="130" rx="20" fill="url(#suit-white)"/>
  <!-- Chest Control Panel & Mission Badge -->
  <rect x="275" y="300" width="50" height="40" rx="6" fill="#1e293b"/>
  <circle cx="288" cy="315" r="4" fill="#ef4444"/>
  <circle cx="300" cy="315" r="4" fill="#3b82f6"/>
  <circle cx="312" cy="315" r="4" fill="#22c55e"/>
  <rect x="285" y="326" width="30" height="6" rx="2" fill="#38bdf8"/>

  <!-- Astronaut Legs -->
  <rect x="245" y="390" width="40" height="100" rx="18" fill="url(#suit-white)" transform="rotate(10 245 390)"/>
  <ellipse cx="235" cy="500" rx="24" ry="16" fill="#334155"/>

  <rect x="315" y="390" width="40" height="90" rx="18" fill="url(#suit-white)" transform="rotate(-15 315 390)"/>
  <ellipse cx="355" cy="490" rx="24" ry="16" fill="#334155"/>

  <!-- Arms Floating Gracefully -->
  <path d="M260,290 Q200,310 170,340" stroke="url(#suit-white)" stroke-width="34" stroke-linecap="round" fill="none"/>
  <circle cx="155" cy="355" r="22" fill="#334155"/>

  <path d="M340,290 Q400,270 425,240" stroke="url(#suit-white)" stroke-width="34" stroke-linecap="round" fill="none"/>
  <circle cx="435" cy="225" r="22" fill="#334155"/>

  <!-- Golden Safety Umbilical Tether (Bottom-Left) -->
  <path d="M250,370 Q140,420 100,500 T30,580" stroke="#f59e0b" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M250,370 Q140,420 100,500 T30,580" stroke="#fef08a" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Helmet -->
  <circle cx="300" cy="200" r="68" fill="url(#suit-white)"/>
  <ellipse cx="300" cy="265" rx="55" ry="12" fill="#64748b"/>

  <!-- Golden Mirrored Visor -->
  <ellipse cx="300" cy="200" rx="52" ry="44" fill="url(#gold-visor)"/>
  <!-- Curved Reflection Flare on Visor -->
  <path d="M270,175 Q310,165 335,185" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
  <!-- Earth reflected inside visor -->
  <circle cx="320" cy="215" r="18" fill="#0284c7" opacity="0.85"/>
  <circle cx="320" cy="215" r="14" fill="#22c55e" opacity="0.6"/>
</svg>
`)}`;

// ============================================================================
// 6. Hành Tinh Kỳ Bí (Cosmic Planet & Nebula) - Category: space
// ============================================================================
const COSMIC_PLANET_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="space-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030014"/>
      <stop offset="50%" stop-color="#12072b"/>
      <stop offset="100%" stop-color="#240046"/>
    </linearGradient>
    <radialGradient id="sun-eclipse" cx="25%" cy="25%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="planet-bands" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f72585"/>
      <stop offset="30%" stop-color="#7209b7"/>
      <stop offset="60%" stop-color="#3a0ca3"/>
      <stop offset="85%" stop-color="#4361ee"/>
      <stop offset="100%" stop-color="#4cc9f0"/>
    </linearGradient>
    <linearGradient id="ring-front" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4cc9f0"/>
      <stop offset="40%" stop-color="#f72585"/>
      <stop offset="70%" stop-color="#ffd166"/>
      <stop offset="100%" stop-color="#4cc9f0"/>
    </linearGradient>
  </defs>

  <!-- Deep Cosmos Background -->
  <rect width="600" height="600" fill="url(#space-bg)"/>

  <!-- Twinkling Starfield -->
  <circle cx="70" cy="90" r="1.5" fill="#ffffff"/>
  <circle cx="160" cy="50" r="2" fill="#ffffff"/>
  <circle cx="280" cy="70" r="1.5" fill="#ffffff"/>
  <circle cx="520" cy="70" r="2" fill="#ffffff"/>
  <circle cx="80" cy="350" r="1.8" fill="#ffffff"/>
  <circle cx="120" cy="520" r="2.2" fill="#ffffff"/>
  <circle cx="530" cy="460" r="1.8" fill="#ffffff"/>

  <!-- Stellar Flare / Starburst behind planet rim (Top-Left) -->
  <circle cx="190" cy="180" r="110" fill="url(#sun-eclipse)" opacity="0.9"/>
  <line x1="190" y1="90" x2="190" y2="270" stroke="#ffffff" stroke-width="3"/>
  <line x1="100" y1="180" x2="280" y2="180" stroke="#ffffff" stroke-width="3"/>

  <!-- Back Portion of Planetary Ring -->
  <ellipse cx="320" cy="320" rx="270" ry="80" fill="none" stroke="url(#ring-front)" stroke-width="38" opacity="0.45" transform="rotate(-25 320 320)"/>
  <ellipse cx="320" cy="320" rx="240" ry="70" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6" transform="rotate(-25 320 320)"/>

  <!-- Colossal Ringed Gas Giant Planet -->
  <circle cx="320" cy="320" r="150" fill="url(#planet-bands)"/>

  <!-- Swirling Storm Bands across Planet Surface -->
  <path d="M190,260 Q320,300 450,260" stroke="#f72585" stroke-width="14" fill="none" opacity="0.8"/>
  <path d="M175,295 Q320,335 465,295" stroke="#4cc9f0" stroke-width="18" fill="none" opacity="0.75"/>
  <path d="M172,335 Q320,375 468,335" stroke="#f59e0b" stroke-width="12" fill="none" opacity="0.7"/>
  <path d="M185,375 Q320,410 455,375" stroke="#7209b7" stroke-width="16" fill="none" opacity="0.85"/>
  <!-- Great Storm Eye Oval -->
  <ellipse cx="370" cy="350" rx="28" ry="16" fill="#f72585"/>
  <ellipse cx="370" cy="350" rx="16" ry="8" fill="#ffd166"/>

  <!-- Planet Shadow on Ring & Front Half of Ring -->
  <ellipse cx="320" cy="320" rx="270" ry="80" fill="none" stroke="url(#ring-front)" stroke-width="38" opacity="0.95" stroke-dasharray="800 900" stroke-dashoffset="-450" transform="rotate(-25 320 320)"/>
  <ellipse cx="320" cy="320" rx="240" ry="70" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.9" stroke-dasharray="700 800" stroke-dashoffset="-380" transform="rotate(-25 320 320)"/>

  <!-- Glowing Turquoise Cratered Moon (Top-Right) -->
  <circle cx="490" cy="160" r="36" fill="#06b6d4"/>
  <circle cx="490" cy="160" r="42" fill="#22d3ee" opacity="0.3"/>
  <circle cx="480" cy="150" r="6" fill="#0891b2"/>
  <circle cx="505" cy="155" r="9" fill="#0891b2"/>
  <circle cx="492" cy="175" r="7" fill="#0e7490"/>

  <!-- Fiery Volcanic Molten Moon (Bottom-Left) -->
  <circle cx="110" cy="460" r="26" fill="#ea580c"/>
  <path d="M98,455 Q110,460 120,450" stroke="#fef08a" stroke-width="3" fill="none"/>
  <path d="M102,468 Q112,475 125,465" stroke="#f97316" stroke-width="3" fill="none"/>
</svg>
`)}`;

// ============================================================================
// 7. Cực Quang Phương Bắc (Aurora Borealis) - Category: nature
// ============================================================================
const AURORA_BOREALIS_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sky-arctic" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="40%" stop-color="#091428"/>
      <stop offset="80%" stop-color="#0f2942"/>
      <stop offset="100%" stop-color="#143e50"/>
    </linearGradient>
    <linearGradient id="aurora-green" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="aurora-magenta" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d946ef"/>
      <stop offset="60%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="mount-rock" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="snow-reflect" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#67e8f9"/>
    </linearGradient>
  </defs>

  <!-- Midnight Sky -->
  <rect width="600" height="600" fill="url(#sky-arctic)"/>

  <!-- Brilliant Stars -->
  <circle cx="80" cy="70" r="2.5" fill="#ffffff"/>
  <circle cx="150" cy="110" r="1.8" fill="#ffffff"/>
  <circle cx="210" cy="50" r="3" fill="#ffffff"/>
  <circle cx="340" cy="80" r="2" fill="#ffffff"/>
  <circle cx="480" cy="60" r="2.5" fill="#ffffff"/>
  <circle cx="530" cy="120" r="1.5" fill="#ffffff"/>
  <circle cx="280" cy="130" r="2.2" fill="#ffffff"/>
  <path d="M210,42 L210,58 M202,50 L218,50" stroke="#ffffff" stroke-width="1.5"/>

  <!-- Crescent Moon in Top-Right -->
  <circle cx="510" cy="90" r="34" fill="#fef08a"/>
  <circle cx="522" cy="84" r="32" fill="#091428"/>

  <!-- Layer 1 Aurora: Magenta/Violet Curtain -->
  <path d="M-50,220 Q120,70 300,160 T650,110 L650,260 Q450,210 280,270 T-50,300 Z" fill="url(#aurora-magenta)" opacity="0.45"/>

  <!-- Layer 2 Aurora: Intense Electric Emerald Ribbon -->
  <path d="M-40,160 Q150,20 320,110 T640,60 L640,190 Q440,140 260,210 T-40,240 Z" fill="url(#aurora-green)" opacity="0.75"/>
  <path d="M120,40 L110,180 M180,60 L170,200 M240,80 L230,220 M310,90 L300,230 M420,70 L410,190 M490,60 L480,180" stroke="#a7f3d0" stroke-width="6" opacity="0.3" stroke-linecap="round"/>

  <!-- Sharp Snowy Mountain Pyramids -->
  <polygon points="-40,430 160,250 360,430" fill="url(#mount-rock)"/>
  <polygon points="120,300 160,250 200,300 180,290 160,310 140,290" fill="url(#snow-reflect)"/>

  <polygon points="180,430 380,210 580,430" fill="url(#mount-rock)"/>
  <polygon points="340,270 380,210 420,270 400,260 380,280 360,260" fill="url(#snow-reflect)"/>

  <!-- Fjord Water Body Reflecting Lights -->
  <rect x="0" y="420" width="600" height="180" fill="#061a29"/>
  <path d="M0,430 Q200,420 400,435 T600,425 L600,480 Q350,470 0,480 Z" fill="#059669" opacity="0.35"/>
  <path d="M100,450 Q300,445 500,450" stroke="#34d399" stroke-width="4" opacity="0.6"/>
  <path d="M50,470 Q250,465 450,470" stroke="#34d399" stroke-width="3" opacity="0.5"/>

  <!-- Snowy Shoreline & Pine Silhouette -->
  <path d="M0,500 Q200,480 350,510 T600,490 L600,600 L0,600 Z" fill="#0b1726"/>
  <path d="M20,530 L50,440 L80,530 Z M70,540 L100,450 L130,540 Z M130,535 L155,465 L180,535 Z" fill="#050c14"/>

  <!-- Cozy Nordic Red Cabin with Chimney & Light -->
  <rect x="420" y="480" width="70" height="50" fill="#b91c1c"/>
  <polygon points="410,480 455,445 500,480" fill="#e0f2fe"/>
  <rect x="475" y="440" width="10" height="18" fill="#450a0a"/>
  <circle cx="482" cy="425" r="7" fill="#ffffff" opacity="0.3"/>
  <circle cx="488" cy="410" r="10" fill="#ffffff" opacity="0.2"/>
  <rect x="435" y="495" width="18" height="18" rx="2" fill="#fbbf24"/>
  <rect x="465" y="495" width="16" height="25" rx="2" fill="#d97706"/>
</svg>
`)}`;

// ============================================================================
// 8. Rừng Phong Mùa Thu (Autumn Forest) - Category: nature (ID: preset-pine)
// ============================================================================
const AUTUMN_FOREST_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sky-autumn" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="30%" stop-color="#991b1b"/>
      <stop offset="60%" stop-color="#d97706"/>
      <stop offset="90%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="stream-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="maple-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="60%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="maple-gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="ground-autumn" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="600" height="600" fill="url(#sky-autumn)"/>

  <!-- Morning Sun Glow -->
  <circle cx="450" cy="180" r="100" fill="#fef08a" opacity="0.8"/>
  <circle cx="450" cy="180" r="140" fill="#fde047" opacity="0.3"/>

  <!-- Distant Mountain Ridges -->
  <polygon points="-50,400 150,260 350,400" fill="#4c1d24" opacity="0.85"/>
  <polygon points="180,400 380,220 580,400" fill="#5c1d27" opacity="0.9"/>
  <polygon points="360,400 500,280 650,400" fill="#3b111e" opacity="0.95"/>

  <!-- Golden Sun Rays -->
  <polygon points="450,180 0,600 80,600" fill="#fef08a" opacity="0.12"/>
  <polygon points="450,180 180,600 280,600" fill="#fef08a" opacity="0.15"/>
  <polygon points="450,180 380,600 480,600" fill="#fef08a" opacity="0.1"/>

  <!-- Riverbank Landscape -->
  <path d="M0,450 Q180,410 320,440 T600,430 L600,600 L0,600 Z" fill="url(#ground-autumn)"/>

  <!-- Winding Azure Stream -->
  <path d="M260,440 Q300,480 340,510 T460,600 L600,600 L600,530 Q480,490 380,440 Z" fill="url(#stream-grad)"/>
  <path d="M330,490 Q380,480 430,500" stroke="#bae6fd" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M390,535 Q440,525 500,545" stroke="#bae6fd" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M480,575 Q530,565 580,580" stroke="#bae6fd" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Big Red Maple Tree (Left) -->
  <path d="M70,470 Q90,360 85,280 Q80,250 50,220" stroke="#291508" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M85,320 Q120,280 160,260" stroke="#291508" stroke-width="12" fill="none" stroke-linecap="round"/>
  <circle cx="50" cy="210" r="65" fill="url(#maple-red)"/>
  <circle cx="110" cy="190" r="75" fill="#dc2626"/>
  <circle cx="160" cy="230" r="60" fill="url(#maple-red)"/>
  <circle cx="100" cy="250" r="55" fill="#991b1b"/>

  <!-- Golden Maple Tree (Center-Right) -->
  <path d="M480,460 Q460,330 450,240 Q440,200 400,160" stroke="#291508" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M460,310 Q490,260 540,230" stroke="#291508" stroke-width="10" fill="none" stroke-linecap="round"/>
  <circle cx="430" cy="150" r="60" fill="url(#maple-gold)"/>
  <circle cx="490" cy="140" r="70" fill="#fbbf24"/>
  <circle cx="530" cy="190" r="55" fill="url(#maple-gold)"/>
  <circle cx="460" cy="210" r="50" fill="#d97706"/>

  <!-- Noble Stag Silhouette on Hill -->
  <path d="M190,420 Q195,405 205,400 Q215,395 220,380 Q225,370 220,365 Q215,360 210,365 Q205,375 195,385 L180,390 Q170,395 165,410 L165,435 L172,435 L175,415 L190,415 L190,435 L197,435 L195,418 Z" fill="#1c1917"/>
  <path d="M220,365 Q225,345 235,340 M225,355 Q235,350 240,355 M222,365 Q215,345 205,342 M218,355 Q208,350 205,356" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- Riverbed Moss Stones -->
  <ellipse cx="290" cy="460" rx="25" ry="14" fill="#3f3f46"/>
  <ellipse cx="320" cy="475" rx="18" ry="10" fill="#52525b"/>
  <ellipse cx="270" cy="470" rx="15" ry="8" fill="#2d6a4f"/>

  <!-- Fallen Maple Leaves -->
  <circle cx="210" cy="460" r="6" fill="#ef4444"/>
  <circle cx="230" cy="475" r="5" fill="#f59e0b"/>
  <circle cx="360" cy="465" r="6" fill="#ef4444"/>
  <circle cx="420" cy="510" r="7" fill="#fbbf24"/>
  <circle cx="490" cy="530" r="6" fill="#dc2626"/>
  <circle cx="340" cy="520" r="5" fill="#f59e0b"/>
  <circle cx="150" cy="480" r="7" fill="#dc2626"/>
  <circle cx="130" cy="510" r="5" fill="#f59e0b"/>
</svg>
`)}`;

// ============================================================================
// 9. Hoàng Hôn Biển Vàng (Golden Ocean Sunset) - Category: nature (ID: preset-wave)
// ============================================================================
const OCEAN_WAVE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="sky-sunset" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#31103f"/>
      <stop offset="30%" stop-color="#72195a"/>
      <stop offset="60%" stop-color="#c73e3a"/>
      <stop offset="85%" stop-color="#f28e2b"/>
      <stop offset="100%" stop-color="#fed976"/>
    </linearGradient>
    <linearGradient id="sun-glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#fff176"/>
      <stop offset="100%" stop-color="#f57c00"/>
    </linearGradient>
    <linearGradient id="wave-deep" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#023e8a"/>
      <stop offset="60%" stop-color="#0077b6"/>
      <stop offset="100%" stop-color="#001845"/>
    </linearGradient>
    <linearGradient id="wave-curl" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00b4d8"/>
      <stop offset="50%" stop-color="#0077b6"/>
      <stop offset="100%" stop-color="#03045e"/>
    </linearGradient>
    <linearGradient id="sun-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fed976"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>

  <!-- Dramatic Sunset Sky -->
  <rect width="600" height="600" fill="url(#sky-sunset)"/>

  <!-- Blazing Sun -->
  <circle cx="420" cy="260" r="110" fill="url(#sun-glow)"/>
  <circle cx="420" cy="260" r="140" fill="#fff59d" opacity="0.3"/>

  <!-- Distant Birds -->
  <path d="M120,130 Q130,120 140,126 Q150,120 160,130 Q150,123 140,128 Q130,123 120,130 Z" fill="#4a154b"/>
  <path d="M170,150 Q177,142 185,147 Q193,142 200,150 Q193,145 185,149 Q177,145 170,150 Z" fill="#4a154b"/>
  <path d="M220,120 Q226,114 232,118 Q238,114 244,120 Q238,116 232,119 Q226,116 220,120 Z" fill="#4a154b"/>

  <!-- Ocean Horizon & Sun Reflection -->
  <rect x="0" y="310" width="600" height="290" fill="#03045e"/>
  <polygon points="380,310 460,310 500,420 340,420" fill="url(#sun-reflection)" opacity="0.7"/>

  <!-- Secondary Ocean Wave -->
  <path d="M0,420 Q160,320 360,370 T600,340 L600,600 L0,600 Z" fill="url(#wave-curl)"/>

  <!-- Massive Cresting Wave Swell -->
  <path d="M0,520 Q180,340 360,400 Q480,440 600,380 L600,600 L0,600 Z" fill="url(#wave-deep)"/>

  <!-- Giant Foamy Wave Lip / Crest -->
  <path d="M0,450 Q120,330 250,340 Q320,345 350,380 Q320,360 260,370 Q160,390 0,510 Z" fill="#ffffff" opacity="0.95"/>
  <circle cx="280" cy="330" r="5" fill="#ffffff"/>
  <circle cx="310" cy="320" r="6" fill="#ffffff"/>
  <circle cx="340" cy="335" r="4" fill="#ffffff"/>
  <circle cx="370" cy="350" r="5" fill="#ffffff"/>
  <circle cx="390" cy="370" r="4" fill="#ffffff"/>
  <circle cx="240" cy="320" r="4" fill="#ffffff"/>
  <circle cx="200" cy="330" r="5" fill="#ffffff"/>

  <!-- Foamy Water Veins -->
  <path d="M50,490 Q140,430 220,440 Q300,450 380,490" stroke="#e0f2fe" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M120,530 Q220,480 320,500 Q420,520 520,540" stroke="#e0f2fe" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M30,570 Q160,530 280,550 T560,580" stroke="#bae6fd" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>
`)}`;

// ============================================================================
// 10. Đêm Đầy Sao (Starry Night Art) - Category: art
// ============================================================================
const STARRY_NIGHT_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="starry-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1128"/>
      <stop offset="40%" stop-color="#101f42"/>
      <stop offset="75%" stop-color="#1c3b70"/>
      <stop offset="100%" stop-color="#2d5986"/>
    </linearGradient>
    <radialGradient id="star-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="cypress-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f261e"/>
      <stop offset="60%" stop-color="#061712"/>
      <stop offset="100%" stop-color="#020a07"/>
    </linearGradient>
    <linearGradient id="hills-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Deep Cobalt Blue Swirling Sky -->
  <rect width="600" height="600" fill="url(#starry-sky)"/>

  <!-- Swirling Wind & Cosmic Nebula Vortex Stream -->
  <path d="M140,240 Q220,130 330,170 Q420,200 480,150 T620,130" stroke="#fef08a" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M120,220 Q240,110 350,150 Q440,180 500,130 T620,110" stroke="#38bdf8" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M160,260 Q260,170 340,200 Q400,220 470,180" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8"/>
  <path d="M290,190 Q340,140 310,110 Q270,90 250,140 Q240,180 290,200" stroke="#fef08a" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.75"/>

  <!-- Blazing Golden Crescent Moon in Concentric Halos (Top-Right) -->
  <circle cx="510" cy="110" r="75" fill="url(#star-halo)" opacity="0.35"/>
  <circle cx="510" cy="110" r="50" fill="url(#star-halo)" opacity="0.6"/>
  <circle cx="510" cy="110" r="32" fill="#fde047"/>
  <circle cx="522" cy="102" r="28" fill="#14264e"/>

  <!-- Brilliant Van Gogh Style Swirling Stars -->
  <circle cx="100" cy="100" r="35" fill="url(#star-halo)" opacity="0.8"/>
  <circle cx="100" cy="100" r="10" fill="#ffffff"/>
  <circle cx="210" cy="80" r="26" fill="url(#star-halo)" opacity="0.75"/>
  <circle cx="210" cy="80" r="8" fill="#ffffff"/>
  <circle cx="390" cy="95" r="28" fill="url(#star-halo)" opacity="0.7"/>
  <circle cx="390" cy="95" r="8" fill="#ffffff"/>
  <circle cx="430" cy="190" r="22" fill="url(#star-halo)" opacity="0.75"/>
  <circle cx="430" cy="190" r="7" fill="#ffffff"/>
  <circle cx="550" cy="220" r="24" fill="url(#star-halo)" opacity="0.7"/>
  <circle cx="550" cy="220" r="7" fill="#ffffff"/>
  <circle cx="270" cy="280" r="38" fill="url(#star-halo)" opacity="0.9"/>
  <circle cx="270" cy="280" r="12" fill="#ffffff"/>

  <!-- Rolling Alpilles Mountain Ridges -->
  <path d="M0,420 Q160,340 320,380 Q460,420 600,360 L600,600 L0,600 Z" fill="url(#hills-grad)"/>
  <path d="M0,460 Q180,410 360,440 T600,420 L600,600 L0,600 Z" fill="#090d16"/>

  <!-- Village of Saint-Rémy (Bottom-Right) -->
  <polygon points="460,350 466,450 454,450" fill="#020617"/>
  <rect x="450" y="450" width="22" height="40" fill="#1e293b"/>
  <rect x="380" y="450" width="35" height="25" fill="#334155"/>
  <polygon points="375,450 397,430 420,450" fill="#b91c1c"/>
  <rect x="390" y="458" width="8" height="8" fill="#fbbf24"/>

  <rect x="425" y="460" width="40" height="28" fill="#1e293b"/>
  <polygon points="420,460 445,440 470,460" fill="#b91c1c"/>
  <rect x="440" y="470" width="10" height="10" fill="#fbbf24"/>

  <rect x="480" y="465" width="45" height="30" fill="#334155"/>
  <polygon points="475,465 502,445 530,465" fill="#78350f"/>
  <rect x="500" y="475" width="9" height="9" fill="#fbbf24"/>

  <!-- Iconic Flame-like Cypress Tree (Left Foreground) -->
  <path d="M0,600 L60,600 Q150,560 130,420 Q150,330 110,240 Q130,170 95,80 Q70,160 80,250 Q60,340 70,440 Q30,520 0,600 Z" fill="url(#cypress-grad)"/>
  <path d="M40,600 Q90,530 85,420 Q110,340 90,260 Q105,200 95,140 Q80,220 75,320 Q55,420 40,600 Z" stroke="#14392b" stroke-width="12" fill="none" opacity="0.6"/>
</svg>
`)}`;

export const DEFAULT_PICTURE_PRESETS: PicturePreset[] = [
  // 1. Núi Phú Sĩ Bình Minh
  {
    id: 'preset-fuji',
    name: 'Núi Phú Sĩ Bình Minh',
    category: 'nature',
    categoryLabel: 'Thiên nhiên',
    thumbnail: FUJI_SUNSET_SVG,
    url: FUJI_SUNSET_SVG,
  },
  // 2. Mèo Cam Thảnh Thơi
  {
    id: 'preset-cat',
    name: 'Mèo Cam Thảnh Thơi',
    category: 'animals',
    categoryLabel: 'Động vật',
    thumbnail: CUTE_GINGER_CAT_SVG,
    url: CUTE_GINGER_CAT_SVG,
  },
  // 3. Cún Corgi Năng Động
  {
    id: 'preset-corgi',
    name: 'Cún Corgi Năng Động',
    category: 'animals',
    categoryLabel: 'Động vật',
    thumbnail: HAPPY_CORGI_SVG,
    url: HAPPY_CORGI_SVG,
  },
  // 4. Gấu Trúc Vườn Trúc
  {
    id: 'preset-panda',
    name: 'Gấu Trúc Vườn Trúc',
    category: 'animals',
    categoryLabel: 'Động vật',
    thumbnail: PANDA_PARADISE_SVG,
    url: PANDA_PARADISE_SVG,
  },
  // 5. Phi Hành Gia Ngân Hà
  {
    id: 'preset-astronaut',
    name: 'Phi Hành Gia Ngân Hà',
    category: 'space',
    categoryLabel: 'Vũ trụ',
    thumbnail: ASTRONAUT_COSMOS_SVG,
    url: ASTRONAUT_COSMOS_SVG,
  },
  // 6. Hành Tinh Kỳ Bí
  {
    id: 'preset-cosmic',
    name: 'Hành Tinh Kỳ Bí',
    category: 'space',
    categoryLabel: 'Vũ trụ',
    thumbnail: COSMIC_PLANET_SVG,
    url: COSMIC_PLANET_SVG,
  },
  // 7. Cực Quang Phương Bắc
  {
    id: 'preset-aurora',
    name: 'Cực Quang Phương Bắc',
    category: 'nature',
    categoryLabel: 'Thiên nhiên',
    thumbnail: AURORA_BOREALIS_SVG,
    url: AURORA_BOREALIS_SVG,
  },
  // 8. Rừng Phong Mùa Thu
  {
    id: 'preset-pine',
    name: 'Rừng Phong Mùa Thu',
    category: 'nature',
    categoryLabel: 'Thiên nhiên',
    thumbnail: AUTUMN_FOREST_SVG,
    url: AUTUMN_FOREST_SVG,
  },
  // 9. Hoàng Hôn Biển Vàng
  {
    id: 'preset-wave',
    name: 'Hoàng Hôn Biển Vàng',
    category: 'nature',
    categoryLabel: 'Thiên nhiên',
    thumbnail: OCEAN_WAVE_SVG,
    url: OCEAN_WAVE_SVG,
  },
  // 10. Đêm Đầy Sao
  {
    id: 'preset-starry',
    name: 'Đêm Đầy Sao',
    category: 'art',
    categoryLabel: 'Nghệ thuật',
    thumbnail: STARRY_NIGHT_SVG,
    url: STARRY_NIGHT_SVG,
  },
];
