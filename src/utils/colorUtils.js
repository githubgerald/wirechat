export const hslToHex = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const hexToHsl = (hex) => {
  hex = hex.replace('#', '');

  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex[0] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[3], 16) / 255;
    b = parseInt(hex[4] + hex[5], 16) / 255;
  } else {
    return null;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const adjustColorBrightness = (hex, percent) => {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  hsl.l = Math.max(0, Math.min(100, hsl.l + percent));
  return hslToHex(hsl.h, hsl.s, hsl.l);
};

export const getContrastColor = (hex) => {
  const hsl = hexToHsl(hex);
  if (!hsl) return '#000000';

  return hsl.l > 50 ? '#000000' : '#FFFFFF';
};

export const generateColorPalette = (baseColor) => {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [];

  return [
    hslToHex(hsl.h, hsl.s, 20), // Dark
    hslToHex(hsl.h, hsl.s, 40), // Medium dark
    baseColor, // Base
    hslToHex(hsl.h, hsl.s, 70), // Medium light
    hslToHex(hsl.h, hsl.s, 90)  // Light
  ];
};