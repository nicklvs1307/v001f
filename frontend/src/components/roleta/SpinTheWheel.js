import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';

const SpinTheWheel = ({ items, winningItem, winningIndex, onAnimationComplete }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);

  const wheelSize = 300;
  const center = wheelSize / 2;
  const radius = center - 15;

  // Function to generate a random hex color
  const getRandomHexColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  // Function to determine contrasting text color (black or white)
  const getContrastingTextColor = useCallback((hexColor) => {
    if (!hexColor) return '#000000'; // Default to black if no color provided

    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    // Calculate luminance (Y = 0.2126 R + 0.7152 G + 0.0722 B)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // Use a threshold to decide between black and white
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }, []);

  const coloredItems = useMemo(
    () =>
      items.map((item) => {
        const randomColor = getRandomHexColor();
        return {
          ...item,
          color: randomColor,
          textColor: getContrastingTextColor(randomColor),
        };
      }),
    [items, getRandomHexColor, getContrastingTextColor]
  );

  const drawWheel = useCallback(
    (currentRotation = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, wheelSize, wheelSize);

      if (!coloredItems || coloredItems.length === 0) {
        return;
      }

      ctx.save(); // Save the unrotated state
      ctx.translate(center, center); // Move origin to center
      ctx.rotate(currentRotation); // Apply the overall wheel rotation
      ctx.translate(-center, -center); // Move origin back

      const numItems = coloredItems.length;
      const segmentAngle = (2 * Math.PI) / numItems;
      let startAngle = 0; // Segments start from 0 relative to the rotated canvas

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

        const textRadius = radius * 0.5; // Adjusted radius for text to give more margin
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = item.name || item.title;
        let fontSize = 14; // Start with a reasonable font size
        ctx.font = `bold ${fontSize}px Poppins`;

        // Adjust font size to fit within the segment, or truncate if too long
        const maxTextWidth = radius * Math.sin(segmentAngle / 2) * 2 * 0.8; // 80% of segment width
        while (ctx.measureText(text).width > maxTextWidth && fontSize > 8) {
          fontSize -= 1;
          ctx.font = `bold ${fontSize}px Poppins`;
        }

        // If text still doesn't fit, truncate it
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

      // Draw center circle
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

      ctx.restore(); // Restore the canvas to its original unrotated state
    },
    [coloredItems, center, radius, wheelSize]
  );

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

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
            setTimeout(() => {
              onAnimationComplete();
            }, 100);
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
    if (winningIndex !== -1 && items && items.length > 0) {
      const numItems = items.length;
      const segmentAngleRadians = (2 * Math.PI) / numItems;

      const randomSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins as in example.html

      // Calcular o ângulo do centro do segmento vencedor
      const winningSegmentCenterAngle =
        winningIndex * segmentAngleRadians + segmentAngleRadians / 2;

      // Calcular o deslocamento necessário para alinhar o centro do segmento vencedor com o ponteiro (12 horas)
      // O ponteiro está em 3 * Math.PI / 2 (270 graus ou -90 graus) no sentido horário a partir de 0 (3 horas).
      let targetOffset = (3 * Math.PI) / 2 - winningSegmentCenterAngle;

      // Garantir que o targetOffset seja positivo e dentro de 0 a 2*PI
      targetOffset = ((targetOffset % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      const targetRotationRadians = 2 * Math.PI * randomSpins + targetOffset;

      animateSpin(targetRotationRadians);
    }
  }, [winningIndex, items, animateSpin]);

  return (
    <Box
      className="roleta-container" // Class for external styling if needed
      sx={{
        position: 'relative',
        margin: '20px auto',
        width: wheelSize,
        height: wheelSize,
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
      }}
    >
      <canvas
        id="roleta" // ID as in example.html
        ref={canvasRef}
        width={wheelSize}
        height={wheelSize}
        style={{
          borderRadius: '50%',
          border: '12px solid #FFD700', // var(--gold)
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
          userSelect: 'none',
          background: '#F1FAEE', // var(--cream)
          transition: 'transform 0.1s',
          position: 'relative',
          zIndex: 1,
        }}
      />
      <Box
        className="seta" // Class for external styling if needed
        sx={{
          position: 'absolute',
          top: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '18px solid transparent',
          borderRight: '18px solid transparent',
          borderTop: '30px solid #FFD700', // var(--gold)
          zIndex: 10,
          filter: 'drop-shadow(0 0 5px #FFD700)', // var(--gold)
          '&::after': {
            // Pseudo-element for the dot on the arrow
            content: '""',
            position: 'absolute',
            top: -33,
            left: -10,
            width: 20,
            height: 20,
            background: '#FFD700', // var(--gold)
            borderRadius: '50%',
            zIndex: -1,
            boxShadow: '0 0 10px #FFD700', // var(--gold)
          },
        }}
      />
    </Box>
  );
};

export default SpinTheWheel;
