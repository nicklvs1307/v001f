import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Box } from '@mui/material';

const SpinTheWheel = ({ items, onAnimationComplete, segColors, winningIndex }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);
  const [wheelSize, setWheelSize] = useState(300);

  const center = wheelSize / 2;
  const radius = center - 15;

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

        const textRadius = radius * 0.5;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = item.name || item.title;
        let fontSize = Math.max(8, Math.floor(wheelSize / 28));
        ctx.font = `bold ${fontSize}px Poppins`;

        const maxTextWidth = radius * Math.sin(segmentAngle / 2) * 2 * 0.8;
        while (ctx.measureText(text).width > maxTextWidth && fontSize > 8) {
          fontSize -= 1;
          ctx.font = `bold ${fontSize}px Poppins`;
        }

        let displaytext = text;
        if (ctx.measureText(text).width > maxTextWidth) {
          let len = text.length;
          while (ctx.measureText(displaytext + '...').width > maxTextWidth && len > 0) {
            len--;
            displaytext = text.substring(0, len);
          }
          displaytext += '...';
        }

        ctx.fillText(displaytext, textRadius, 0);
        ctx.restore();

        startAngle = endAngle;
      });

      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(center, center, 15, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(center, center, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    },
    [coloredItems, center, radius, wheelSize]
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
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
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
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          userSelect: 'none',
          background: '#F1FAEE',
          transition: 'transform 0.1s',
          position: 'relative',
          zIndex: 1,
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
