// High quality default SVG illustrations matching the Sapahati screenshot design

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const DEFAULT_HERO_IMAGE = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ECE7FF" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#E2DAFF" stop-opacity="0.4" />
    </radialGradient>
    <linearGradient id="robotBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="purpleHeart" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#936DFF" />
      <stop offset="100%" stop-color="#6F43FF" />
    </linearGradient>
    <linearGradient id="girlShirt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D1B8FF" />
      <stop offset="100%" stop-color="#A580FF" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#5B33D4" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background Soft Lavender Organic Blob (Removed for transparent background) -->
  
  <!-- Floating Background Heart -->
  <path d="M 580 180 C 580 160, 600 145, 620 160 C 640 145, 660 160, 660 180 C 660 210, 620 235, 620 235 C 620 235, 580 210, 580 180 Z" fill="#B192FF" opacity="0.8" />
  
  <!-- Green Leaves at bottom -->
  <path d="M 360 620 C 300 600, 320 680, 440 660 C 420 640, 400 620, 360 620 Z" fill="#9AE6B4" />
  <path d="M 720 580 C 780 560, 760 660, 660 620 C 680 600, 700 580, 720 580 Z" fill="#6EE7B7" />

  <!-- Robot Character (Left) -->
  <g filter="url(#softShadow)">
    <!-- Antenna -->
    <line x1="480" y1="210" x2="480" y2="250" stroke="#936DFF" stroke-width="8" stroke-linecap="round" />
    <circle cx="480" cy="205" r="14" fill="#8B5CF6" />
    
    <!-- Head -->
    <rect x="400" y="240" width="160" height="130" rx="45" fill="url(#robotBody)" stroke="#E2E8F0" stroke-width="4" />
    <rect x="420" y="260" width="120" height="80" rx="30" fill="#1E1B4B" />
    <!-- Happy Face Eyes -->
    <path d="M 445 295 Q 460 280 475 295" stroke="#6366F1" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M 485 295 Q 500 280 515 295" stroke="#6366F1" stroke-width="6" stroke-linecap="round" fill="none" />
    
    <!-- Body -->
    <path d="M 390 380 C 390 360, 570 360, 570 380 L 580 550 C 580 580, 380 580, 380 550 Z" fill="url(#robotBody)" />
    <!-- Heart badge on robot -->
    <path d="M 465 430 C 465 420, 475 412, 485 422 C 495 412, 505 420, 505 430 C 505 445, 485 458, 485 458 C 485 458, 465 445, 465 430 Z" fill="#7C3AED" />
    
    <!-- Robot Waving Hand (Left) -->
    <path d="M 390 410 C 340 400, 350 320, 380 300 C 395 310, 385 340, 400 380 Z" fill="url(#robotBody)" />
  </g>

  <!-- Girl Character Hugging Heart (Right) -->
  <g filter="url(#softShadow)">
    <!-- Hair (Back) -->
    <path d="M 540 280 C 540 220, 680 220, 720 280 L 740 480 C 720 540, 560 540, 540 480 Z" fill="#3B2621" />
    
    <!-- Face -->
    <ellipse cx="630" cy="320" rx="55" ry="60" fill="#FFDFC4" />
    
    <!-- Hair Bangs -->
    <path d="M 570 300 C 590 260, 670 260, 690 300 C 660 280, 600 280, 570 300 Z" fill="#2E1C18" />
    
    <!-- Closed Peaceful Eyes -->
    <path d="M 595 325 Q 608 335 621 325" stroke="#4A3026" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M 640 325 Q 653 335 666 325" stroke="#4A3026" stroke-width="4" stroke-linecap="round" fill="none" />
    
    <!-- Soft Blush -->
    <ellipse cx="590" cy="335" rx="10" ry="6" fill="#FF8A8A" opacity="0.5" />
    <ellipse cx="670" cy="335" rx="10" ry="6" fill="#FF8A8A" opacity="0.5" />
    
    <!-- Gentle Smile -->
    <path d="M 622 345 Q 630 352 638 345" stroke="#7A4231" stroke-width="3" stroke-linecap="round" fill="none" />
    
    <!-- Girl Sweater Body -->
    <path d="M 550 380 C 550 370, 710 370, 710 380 L 720 580 C 720 620, 540 620, 540 580 Z" fill="url(#girlShirt)" />
    
    <!-- Girl Holding Big Purple Heart -->
    <path d="M 580 430 C 580 390, 625 370, 650 405 C 675 370, 720 390, 720 430 C 720 490, 650 530, 650 530 C 650 530, 580 490, 580 430 Z" fill="url(#purpleHeart)" />
    
    <!-- Girl Hands Hugging Heart -->
    <path d="M 540 450 C 570 450, 610 470, 630 490" stroke="#FFDFC4" stroke-width="24" stroke-linecap="round" fill="none" />
    <path d="M 720 450 C 690 450, 660 470, 640 490" stroke="#FFDFC4" stroke-width="24" stroke-linecap="round" fill="none" />
  </g>
</svg>
`);

export const DEFAULT_BANNER_IMAGE = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="purpleHeartBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#926EFF" />
      <stop offset="100%" stop-color="#6B41FF" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#6B41FF" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Sparkle Stars -->
  <path d="M 120 100 L 125 115 L 140 120 L 125 125 L 120 140 L 115 125 L 100 120 L 115 115 Z" fill="#C4B5FD" opacity="0.8" />
  <path d="M 380 80 L 383 90 L 393 93 L 383 96 L 380 106 L 377 96 L 367 93 L 377 90 Z" fill="#DDD6FE" opacity="0.9" />
  <path d="M 420 200 L 422 208 L 430 210 L 422 212 L 420 220 L 418 212 L 410 210 L 418 208 Z" fill="#A78BFA" opacity="0.7" />

  <!-- 3D Heart -->
  <g filter="url(#glow)">
    <path d="M 230 140 C 230 90, 290 70, 325 115 C 360 70, 420 90, 420 140 C 420 210, 325 260, 325 260 C 325 260, 230 210, 230 140 Z" fill="url(#purpleHeartBg)" />
    <!-- Heart Highlight -->
    <path d="M 260 120 C 260 100, 280 90, 300 105" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.4" fill="none" />
  </g>

  <!-- Caring Hand Reaching Up to Support Heart -->
  <g filter="url(#glow)">
    <!-- Palm & Wrist -->
    <path d="M 160 380 C 220 370, 300 350, 360 320 C 390 305, 410 280, 395 270 C 380 260, 350 280, 320 295 C 270 320, 220 325, 180 340 Z" fill="#FFD5C0" />
    <!-- Fingers gently holding -->
    <path d="M 320 295 C 340 285, 380 270, 400 275 C 410 280, 400 295, 370 310" stroke="#F3BBA2" stroke-width="8" stroke-linecap="round" fill="none" />
    <!-- Thumb -->
    <path d="M 260 310 C 280 280, 300 270, 310 280 C 320 290, 300 310, 280 320 Z" fill="#FFCBB3" />
  </g>
</svg>
`);

export const DEFAULT_LOGO = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>
  </defs>
  <!-- Speech Bubble Body -->
  <path d="M 20 20 C 20 10, 80 10, 80 20 L 80 65 C 80 75, 60 75, 50 75 L 30 90 L 32 75 C 20 75, 20 65, 20 65 Z" fill="url(#logoBg)" />
  <!-- Heart cutout -->
  <path d="M 38 38 C 38 32, 44 28, 50 33 C 56 28, 62 32, 62 38 C 62 47, 50 54, 50 54 C 50 54, 38 47, 38 38 Z" fill="#FFFFFF" />
</svg>
`);

export const DEFAULT_BOT_AVATAR = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="botHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#5B21B6" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#botHeartGrad)" />
  <circle cx="50" cy="50" r="42" fill="none" stroke="#A78BFA" stroke-width="2" opacity="0.4" />
  <path d="M 50 74 C 50 74, 25 56, 25 38 C 25 27.5, 33 20, 43 20 C 48.5 20, 50 23, 50 23 C 50 23, 51.5 20, 57 20 C 67 20, 75 27.5, 75 38 C 75 56, 50 74, 50 74 Z" fill="#FFFFFF" />
  <circle cx="50" cy="35" r="4.5" fill="#FFBD59" />
</svg>
`);

export const DEFAULT_APP_ICON = DEFAULT_LOGO;


