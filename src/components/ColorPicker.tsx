import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorPickerProps {
  color: string;
  recentColors: string[];
  onChange: (color: string) => void;
  onConfirm: (color: string) => void;
  onClose: () => void;
}

// Helper functions for color conversion
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  let r = 0, g = 0, b = 0;
  h /= 360; s /= 100; v /= 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const ColorPicker: React.FC<ColorPickerProps> = ({ color, recentColors, onChange, onConfirm, onClose }) => {
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 100 });
  const [hexInput, setHexInput] = useState(color);
  const [rgbInput, setRgbInput] = useState(hexToRgb(color));
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingCanvas = useRef(false);
  const isDraggingSlider = useRef(false);

  useEffect(() => {
    const rgb = hexToRgb(color);
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHsv(newHsv);
    setHexInput(color);
    setRgbInput(rgb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to prevent precision loss during dragging

  const updateColorFromHsv = (newHsv: { h: number, s: number, v: number }) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setRgbInput(rgb);
    setHexInput(hex);
    onChange(hex);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    isDraggingCanvas.current = true;
    handleCanvasMove(e);
  };

  const handleCanvasMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!isDraggingCanvas.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));
    
    // In the image, X is Hue (0-360), Y is Saturation (100-0)
    const h = (x / rect.width) * 360;
    const s = 100 - (y / rect.height) * 100;
    
    updateColorFromHsv({ ...hsv, h, s });
  }, [hsv]);

  const handleSliderPointerDown = (e: React.PointerEvent) => {
    isDraggingSlider.current = true;
    handleSliderMove(e);
  };

  const handleSliderMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!isDraggingSlider.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let y = e.clientY - rect.top;
    y = Math.max(0, Math.min(y, rect.height));
    
    // Y is Value (100-0)
    const v = 100 - (y / rect.height) * 100;
    
    updateColorFromHsv({ ...hsv, v });
  }, [hsv]);

  const handlePointerUp = useCallback(() => {
    isDraggingCanvas.current = false;
    isDraggingSlider.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handleCanvasMove);
    window.addEventListener('pointermove', handleSliderMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handleCanvasMove);
      window.removeEventListener('pointermove', handleSliderMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handleCanvasMove, handleSliderMove, handlePointerUp]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      const rgb = hexToRgb(val);
      setRgbInput(rgb);
      setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
      onChange(val);
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const num = Math.max(0, Math.min(255, Number(value) || 0));
    const newRgb = { ...rgbInput, [channel]: num };
    setRgbInput(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(hex);
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    onChange(hex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#202020] p-4 sm:p-5 rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col w-full sm:w-[480px] max-h-[90vh] overflow-y-auto pb-safe" 
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4 sm:hidden"></div>
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-white font-semibold text-lg">Màu background</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 -mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Main Color Canvas */}
          <div className="flex gap-4 h-[200px] sm:h-[220px]">
            <div 
              ref={canvasRef}
              className="relative flex-1 h-full rounded-lg overflow-hidden cursor-crosshair shadow-inner"
              onPointerDown={handleCanvasPointerDown}
              style={{
                background: `linear-gradient(to bottom, transparent, #ffffff), linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
                backgroundColor: 'white'
              }}
            >
              {/* Pointer */}
              <div 
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  top: `${100 - hsv.s}%`,
                  backgroundColor: rgbToHex(hsvToRgb(hsv.h, hsv.s, 100).r, hsvToRgb(hsv.h, hsv.s, 100).g, hsvToRgb(hsv.h, hsv.s, 100).b)
                }}
              />
            </div>

            {/* Value/Lightness Slider */}
            <div 
              ref={sliderRef}
              className="relative w-6 h-full rounded-full overflow-hidden cursor-ns-resize shrink-0 shadow-inner"
              onPointerDown={handleSliderPointerDown}
              style={{
                background: `linear-gradient(to bottom, ${rgbToHex(hsvToRgb(hsv.h, hsv.s, 100).r, hsvToRgb(hsv.h, hsv.s, 100).g, hsvToRgb(hsv.h, hsv.s, 100).b)}, #000000)`
              }}
            >
              {/* Slider Thumb */}
              <div 
                className="absolute w-full h-6 bg-white border-2 border-gray-300 rounded-full shadow-md pointer-events-none transform -translate-y-1/2"
                style={{ top: `${100 - hsv.v}%` }}
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shrink-0 border border-[#444] shadow-inner"
                style={{ backgroundColor: color }}
              />
              <input 
                type="text" 
                value={hexInput}
                onChange={handleHexChange}
                className="flex-1 w-full bg-[#333] text-white border border-[#444] rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-app-accent uppercase font-mono"
              />
            </div>
            
            <div className="flex gap-2 flex-1">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-gray-400 text-xs text-center">R</span>
                <input 
                  type="number" 
                  value={rgbInput.r}
                  onChange={e => handleRgbChange('r', e.target.value)}
                  className="w-full bg-[#333] text-white border border-[#444] rounded-lg px-1 py-2 text-center text-base sm:text-sm focus:outline-none focus:border-app-accent font-mono"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-gray-400 text-xs text-center">G</span>
                <input 
                  type="number" 
                  value={rgbInput.g}
                  onChange={e => handleRgbChange('g', e.target.value)}
                  className="w-full bg-[#333] text-white border border-[#444] rounded-lg px-1 py-2 text-center text-base sm:text-sm focus:outline-none focus:border-app-accent font-mono"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-gray-400 text-xs text-center">B</span>
                <input 
                  type="number" 
                  value={rgbInput.b}
                  onChange={e => handleRgbChange('b', e.target.value)}
                  className="w-full bg-[#333] text-white border border-[#444] rounded-lg px-1 py-2 text-center text-base sm:text-sm focus:outline-none focus:border-app-accent font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => onConfirm(hexInput)}
            className="bg-app-accent hover:bg-app-accentHover text-white px-6 py-3 sm:py-2.5 rounded-lg text-base sm:text-sm font-semibold transition-colors w-full shadow-lg"
          >
            Xác nhận
          </button>
        </div>

        {/* Recently Colors */}
        <div className="mt-6 pt-4 border-t border-[#333]">
          <div className="text-sm text-gray-400 mb-3 font-medium">Màu gần đây</div>
          <div className="flex gap-3 sm:gap-4 overflow-hidden py-1">
            <AnimatePresence initial={false}>
              {recentColors.map((preset) => (
                <motion.button
                  layout
                  key={preset}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="w-8 h-8 sm:w-8 sm:h-8 rounded-full border-2 border-[#444] shadow-md hover:scale-110 shrink-0"
                  style={{ backgroundColor: preset }}
                  onClick={() => {
                    const rgb = hexToRgb(preset);
                    setRgbInput(rgb);
                    setHexInput(preset);
                    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
                    onChange(preset);
                  }}
                  title={preset}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
