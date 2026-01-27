const hexToRgb = (hex) => {
  if (typeof hex !== "string") {
    throw new TypeError("Hex color must be a string");
  }

  let value = hex.trim().replace(/^#/, "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    console.warn(`Invalid hex color: ${hex}`);
    return false;
  }

  const num = parseInt(value, 16);

  // eslint-disable-next-line no-bitwise
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const luminance = (rgb) => {
  const c = [rgb[0], rgb[1], rgb[2]].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

export const contrastColor = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {return "";}
  return luminance(rgb) >= 0.45 ? "#000d" : "#fffd";
};
