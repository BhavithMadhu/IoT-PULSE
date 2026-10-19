/**
 * Procedural Cyber Earth Texture Generator for IoT-PULSE
 * Generates an ultra-crisp, cyberpunk holographic Earth texture with:
 * - Accurate world landmass silhouettes & glowing coastlines
 * - Hexagonal / dot-matrix land grid
 * - Cyber latitude & longitude graticule
 * - Glowing metropolitan IoT sensor clusters
 * - Zero external assets or network dependencies (100% offline & fast)
 */

import * as THREE from 'three';

// Simplified high-fidelity polygon paths for world continents [lon, lat] normalized to [-180..180, -90..90]
const CONTINENT_POLYGONS = [
  // North America
  [
    [-168, 65], [-160, 71], [-140, 70], [-125, 75], [-100, 74], [-80, 76], [-65, 60],
    [-60, 48], [-68, 44], [-75, 36], [-80, 25], [-82, 23], [-90, 21], [-97, 26],
    [-105, 20], [-95, 16], [-83, 9], [-77, 8], [-80, 15], [-92, 16], [-105, 24],
    [-118, 33], [-124, 40], [-125, 49], [-135, 58], [-148, 60], [-160, 58], [-168, 65]
  ],
  // Greenland
  [
    [-52, 60], [-40, 65], [-20, 75], [-20, 83], [-50, 83], [-60, 78], [-55, 70], [-52, 60]
  ],
  // South America
  [
    [-77, 8], [-72, 11], [-60, 10], [-50, -2], [-35, -5], [-35, -12], [-40, -22],
    [-50, -32], [-58, -38], [-65, -50], [-68, -55], [-75, -50], [-72, -42], [-71, -30],
    [-78, -18], [-81, -5], [-77, 4], [-77, 8]
  ],
  // Europe & Scandinavia
  [
    [-9, 36], [-9, 43], [0, 44], [-4, 48], [2, 51], [8, 54], [5, 62], [15, 68],
    [28, 71], [30, 60], [25, 54], [16, 54], [14, 46], [22, 40], [28, 41], [35, 46],
    [36, 36], [28, 36], [22, 38], [15, 38], [12, 43], [0, 38], [-5, 36], [-9, 36]
  ],
  // Great Britain & Ireland
  [
    [-5, 50], [1, 52], [0, 58], [-4, 58], [-6, 54], [-5, 50]
  ],
  // Africa
  [
    [-17, 15], [-17, 21], [-6, 36], [10, 37], [25, 32], [33, 31], [36, 22], [43, 12],
    [51, 12], [45, 5], [40, -5], [35, -20], [32, -28], [28, -34], [18, -34], [12, -18],
    [8, 4], [0, 6], [-10, 6], [-15, 12], [-17, 15]
  ],
  // Madagascar
  [
    [44, -12], [50, -14], [48, -25], [44, -25], [44, -12]
  ],
  // Asia & Russia
  [
    [36, 36], [40, 42], [50, 40], [53, 37], [60, 38], [65, 25], [70, 22], [73, 17],
    [80, 10], [82, 16], [88, 22], [92, 15], [100, 10], [104, 1], [108, 14], [118, 22],
    [122, 30], [120, 40], [128, 42], [132, 48], [140, 55], [143, 62], [160, 58],
    [170, 65], [180, 68], [170, 72], [140, 76], [110, 78], [80, 75], [60, 70],
    [50, 65], [40, 60], [35, 46], [36, 36]
  ],
  // Japan
  [
    [130, 32], [136, 35], [141, 42], [144, 44], [140, 36], [132, 33], [130, 32]
  ],
  // Southeast Asia / Indonesia / Philippines
  [
    [100, 5], [108, -7], [115, -8], [120, -2], [116, 6], [105, 5], [100, 5]
  ],
  // Australia & New Zealand
  [
    [114, -22], [114, -34], [120, -35], [135, -34], [145, -38], [150, -35], [153, -28],
    [148, -20], [142, -12], [135, -12], [130, -18], [120, -18], [114, -22]
  ]
];

/**
 * Converts Lon/Lat to Canvas X/Y coordinates on an equirectangular projection
 */
function toCanvasCoords(lon, lat, width, height) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

/**
 * Builds the glowing cyber texture
 */
export function createCyberEarthTexture(theme = 'dark') {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isLight = theme === 'light';

  // 1. Deep Ocean Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (isLight) {
    oceanGrad.addColorStop(0, '#e0f2fe');
    oceanGrad.addColorStop(0.5, '#f0f9ff');
    oceanGrad.addColorStop(1, '#e0f2fe');
  } else {
    oceanGrad.addColorStop(0, '#04070d');
    oceanGrad.addColorStop(0.5, '#070c16');
    oceanGrad.addColorStop(1, '#030509');
  }
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Graticule (Latitude & Longitude grid lines)
  ctx.lineWidth = 1;
  ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(34, 211, 238, 0.08)';
  ctx.setLineDash([4, 6]);

  // Latitude lines
  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = toCanvasCoords(0, lat, width, height);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Longitude lines
  for (let lon = -180; lon <= 180; lon += 30) {
    const [x] = toCanvasCoords(lon, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator & Prime Meridian Highlight
  ctx.setLineDash([]);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.25)' : 'rgba(34, 211, 238, 0.2)';
  const [, eqY] = toCanvasCoords(0, 0, width, height);
  ctx.beginPath();
  ctx.moveTo(0, eqY);
  ctx.lineTo(width, eqY);
  ctx.stroke();

  // 3. Draw Continents with glowing neon coastlines & cyber dot-matrix topography
  CONTINENT_POLYGONS.forEach((polygon) => {
    if (polygon.length < 3) return;

    ctx.save();
    ctx.beginPath();
    const [startX, startY] = toCanvasCoords(polygon[0][0], polygon[0][1], width, height);
    ctx.moveTo(startX, startY);

    for (let i = 1; i < polygon.length; i++) {
      const [px, py] = toCanvasCoords(polygon[i][0], polygon[i][1], width, height);
      ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Continent Dark Tech Fill
    ctx.fillStyle = isLight ? '#bae6fd' : '#0a1829';
    ctx.fill();

    // Continent Glowing Perimeter
    ctx.shadowColor = isLight ? '#0284c7' : '#00f5ff';
    ctx.shadowBlur = isLight ? 10 : 20;
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = isLight ? '#0369a1' : '#22d3ee';
    ctx.stroke();

    // Clip to continent interior and render illuminated cyber dot-matrix
    ctx.clip();
    ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.45)' : 'rgba(34, 211, 238, 0.55)';
    const dotSpacing = 16;
    for (let dy = 0; dy < height; dy += dotSpacing) {
      for (let dx = (dy % (dotSpacing * 2) === 0 ? 0 : dotSpacing / 2); dx < width; dx += dotSpacing) {
        ctx.beginPath();
        ctx.arc(dx, dy, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  });

  // 5. Global IoT Sensor Node Clusters (Major World Metropolises)
  const METRO_SENSORS = [
    [-122.4, 37.7],  // San Francisco
    [-74.0, 40.7],   // New York
    [-0.1, 51.5],    // London
    [2.3, 48.8],     // Paris
    [13.4, 52.5],    // Berlin
    [55.3, 25.2],    // Dubai
    [77.2, 28.6],    // New Delhi
    [72.8, 19.0],    // Mumbai
    [103.8, 1.3],    // Singapore
    [121.4, 31.2],   // Shanghai
    [139.7, 35.6],   // Tokyo
    [151.2, -33.8],  // Sydney
    [-46.6, -23.5],  // São Paulo
    [18.4, -33.9]    // Cape Town
  ];

  METRO_SENSORS.forEach(([lon, lat]) => {
    const [cx, cy] = toCanvasCoords(lon, lat, width, height);

    ctx.save();
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 12;

    // Outer radar ring
    ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.5)' : 'rgba(34, 211, 238, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Center bright dot
    ctx.fillStyle = isLight ? '#0284c7' : '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Converts spherical coordinates (lon, lat, radius) into a Three.js Vector3
 * Lon: -180..180, Lat: -90..90
 */
export function geoToVector3(lon, lat, radius = 2.0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}
