import { useState, useEffect } from 'react';

const BOOT_LINES = [
  'RETRO-OS v1.0',
  'Copyright (c) 1984 PIXEL CORP.',
  '',
  'Initializing display... OK',
  'Loading particle engine... OK',
  'Calibrating cursor... OK',
  'Sound system... READY',
  '',
  'MEMORY: 64KB OK',
  'VIDEO: CRT 640x480',
  '',
  '> LOADING CURSOR_FX.EXE...',
  '',
  'READY.',
];

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-start justify-start p-8 z-50">
      <div className="font-pixel text-[10px] leading-relaxed text-foreground">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="text-glow-sm">
            {line || '\u00A0'}
          </div>
        ))}
        {visibleLines < BOOT_LINES.length && (
          <span className="boot-cursor text-glow">█</span>
        )}
      </div>
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
    </div>
  );
};

export default BootScreen;
