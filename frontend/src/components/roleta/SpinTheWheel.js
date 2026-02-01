import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Box } from '@mui/material';

const SpinTheWheel = ({ items, onAnimationComplete, segColors, winningIndex, logoUrl, isSpinning }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);
  const [wheelSize, setWheelSize] = useState(300);
  const [logoImg, setLogoImg] = useState(null);

  const center = wheelSize / 2;
  const radius = center - 15;

  useEffect(() => {
    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => setLogoImg(img);
    }
  }, [logoUrl]);

  useEffect(() => {
    const handleResize = () => {
            const size = Math.min(window.innerWidth * 0.9, 400);
      setWheelSize(size);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRandomHexColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  const getContrastingTextColor = useCallback((hexColor) => {
    if (!hexColor) return '#000000';

    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }, []);

  const coloredItems = useMemo(
    () =>
      items.map((item, index) => {
        const color = segColors && segColors.length > 0 ? segColors[index % segColors.length] : getRandomHexColor();
        return {
          ...item,
          color,
          textColor: getContrastingTextColor(color),
        };
      }),
    [items, segColors, getRandomHexColor, getContrastingTextColor]
  );

  const drawWheel = useCallback(
    (currentRotation = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      canvas.width = wheelSize;
      canvas.height = wheelSize;

      ctx.clearRect(0, 0, wheelSize, wheelSize);

      if (!coloredItems || coloredItems.length === 0) {
        return;
      }

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(currentRotation);
      ctx.translate(-center, -center);

      const numItems = coloredItems.length;
      const segmentAngle = (2 * Math.PI) / numItems;
      let startAngle = 0;

      coloredItems.forEach((item, index) => {
        const endAngle = startAngle + segmentAngle;
        const segmentColor = item.color;
        const textColor = item.textColor;

        ctx.fillStyle = segmentColor;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + radius * Math.cos(startAngle), center + radius * Math.sin(startAngle));
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = textColor;
        ctx.translate(center, center);

        const angMeio = startAngle + segmentAngle / 2;
        ctx.rotate(angMeio);

        // Ajuste do raio do texto: empurrado mais para a borda (0.68)
        const textRadius = radius * 0.68; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = item.name || item.title;
        // Fonte aumentada: de wheelSize/28 para wheelSize/22
        let fontSize = Math.max(10, Math.floor(wheelSize / 22)); 
        ctx.font = `bold ${fontSize}px Poppins, sans-serif`;

        const maxTextWidth = radius * Math.sin(segmentAngle / 2) * 2 * 0.85;
        
        // ... (lógica de linhas)
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const width = ctx.measureText(currentLine + " " + words[i]).width;
            if (width < maxTextWidth) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);

        if (lines.length > 2) {
             fontSize = Math.max(10, fontSize - (lines.length * 1.2));
             ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
        }

        const lineHeight = fontSize * 1.1;
        const totalHeight = lines.length * lineHeight;
        let startY = -totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, i) => {
             ctx.fillText(line, textRadius, startY + (i * lineHeight));
        });
        
        ctx.restore();

        startAngle = endAngle;
      });

      ctx.restore(); 

      // --- CENTRO DA ROLETA COM LOGO (Aumentado para 48) ---
      const centerRadius = 48; 

      ctx.save();
      // Sombra externa do centro
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      
      // Fundo Dourado/Branco
      const gradient = ctx.createRadialGradient(center, center, 5, center, center, centerRadius);
      gradient.addColorStop(0, '#FFF');
      gradient.addColorStop(1, '#FFD700');
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      ctx.arc(center, center, centerRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset sombra

      // Desenhar Logo se existir
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        // Área de recorte um pouco menor que o raio total
        ctx.arc(center, center, centerRadius - 4, 0, 2 * Math.PI);
        ctx.clip();
        // Desenha a imagem centralizada
        ctx.drawImage(logoImg, center - (centerRadius - 4), center - (centerRadius - 4), (centerRadius - 4) * 2, (centerRadius - 4) * 2);
        ctx.restore();
      }
      
      // Borda do centro (anel)
      ctx.strokeStyle = '#FFD700'; // Ouro
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(center, center, centerRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // Borda branca fina interna
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center, center, centerRadius - 2, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
    },
    [coloredItems, center, radius, wheelSize, logoImg]
  );

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel, wheelSize]);

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animateSpin = useCallback(
    (targetRotationRadians, duration = 5000) => {
      const start = performance.now();
      const initialRotationRadians = rotationRef.current;

      const animate = (currentTime) => {
        const elapsed = currentTime - start;
        let progress = elapsed / duration;
        if (progress > 1) progress = 1;

        const easedProgress = easeOutQuart(progress);
        const newRotation =
          initialRotationRadians + (targetRotationRadians - initialRotationRadians) * easedProgress;

        rotationRef.current = newRotation;
        drawWheel(newRotation);

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = targetRotationRadians;
          drawWheel(targetRotationRadians);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      };

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(animate);
    },
    [drawWheel, onAnimationComplete]
  );

  useEffect(() => {
    if (winningIndex === -1 || !items || items.length === 0) return;

    const numItems = items.length;
    const segmentAngleRadians = (2 * Math.PI) / numItems;
    const randomSpins = 5 + Math.floor(Math.random() * 3);
    const winningSegmentCenterAngle = winningIndex * segmentAngleRadians + segmentAngleRadians / 2;
    let targetOffset = (3 * Math.PI) / 2 - winningSegmentCenterAngle;
    targetOffset = ((targetOffset % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const targetRotationRadians = 2 * Math.PI * randomSpins + targetOffset;

    animateSpin(targetRotationRadians);
  }, [winningIndex, items, animateSpin]);

      const pointerSize = Math.max(12, wheelSize / 25);
      return (
    <Box
      className="roleta-container"
      sx={{
        position: 'relative',
        width: wheelSize,
        height: wheelSize,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        animation: !isSpinning && winningIndex === -1 ? 'pulse-wheel 4s infinite ease-in-out' : 'none',
        '@keyframes pulse-wheel': {
          '0%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.2))' },
          '50%': { transform: 'scale(1.02)', filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))' },
          '100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.2))' },
        },
        // Efeito de brilho intenso se tiver ganhado
        ...(winningIndex !== -1 && !isSpinning && {
          filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.8))',
          transition: 'filter 0.5s ease-in-out'
        })
      }}
    >
      <canvas
        id="roleta"
        ref={canvasRef}
        width={wheelSize}
        height={wheelSize}
        style={{
          borderRadius: '50%',
          border: '12px solid #FFD700',
          boxShadow: winningIndex !== -1 && !isSpinning 
            ? '0 0 50px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.5)' 
            : '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          userSelect: 'none',
          background: '#F1FAEE',
          position: 'relative',
          zIndex: 1,
          willChange: 'transform', // Otimização de Performance
          transform: 'translateZ(0)', // Hack para ativar GPU
        }}
      />
      <Box
        className="seta"
        sx={{
          position: 'absolute',
          top: -pointerSize * 1.4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: `${pointerSize}px solid transparent`,
          borderRight: `${pointerSize}px solid transparent`,
          borderTop: `${pointerSize * 1.6}px solid #FFD700`,
          zIndex: 10,
          filter: 'drop-shadow(0 0 5px #FFD700)',
          // Se estiver parado no vencedor, a seta brilha mais
          animation: winningIndex !== -1 && !isSpinning ? 'bounce-pointer 0.5s infinite alternate' : 'none',
          '@keyframes bounce-pointer': {
            'from': { transform: 'translateX(-50%) translateY(0)' },
            'to': { transform: 'translateX(-50%) translateY(-5px)' }
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -pointerSize * 1.8,
            left: -pointerSize / 1.8,
            width: pointerSize * 1.1,
            height: pointerSize * 1.1,
            background: '#FFD700',
            borderRadius: '50%',
            zIndex: -1,
            boxShadow: '0 0 10px #FFD700',
          },
        }}
      />
    </Box>
  );
};

export default SpinTheWheel;
