import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const ColorSlider = ({ label, colorType, value, onChange }) => {
  const { hexToHsl, hslToHex } = useSettings();

  const handleSliderChange = (hueValue) => {
    const saturation = 70;
    const lightness = colorType === 'primary' ? 63 : 50;
    const hex = hslToHex(hueValue, saturation, lightness);
    onChange(hex);
  };

  const hsl = hexToHsl(value);

  return (
    <div className="sliderWrapper">
      <label>
        <span>{label}</span>
        <span className="sliderValue" id={`${colorType}Value`}>{value}</span>
      </label>
      <input 
        type="range" 
        id={`${colorType}Hue`}
        min="0" 
        max="360" 
        value={hsl?.h || 0}
        onInput={(e) => handleSliderChange(parseInt(e.target.value))}
      />
      <div 
        className="colorPreview" 
        id={`${colorType}Preview`} 
        style={{ backgroundColor: value }}
      ></div>
    </div>
  );
};

export default ColorSlider;