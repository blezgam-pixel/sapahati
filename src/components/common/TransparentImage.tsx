import React, { useState, useEffect } from 'react';

interface TransparentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  threshold?: number;
}

export async function processImageToTransparentUrl(src: string, threshold = 225): Promise<string> {
  if (!src) return '';

  // 1. Handle SVG Data URIs
  if (src.startsWith('data:image/svg+xml')) {
    try {
      let decoded = src.includes('charset=utf-8,')
        ? decodeURIComponent(src.split('charset=utf-8,')[1])
        : decodeURIComponent(src.replace('data:image/svg+xml;utf8,', '').replace('data:image/svg+xml,', ''));

      // Remove full background white rects
      const cleanedSvg = decoded
        .replace(/<rect[^>]*fill=["'](%23ffffff|#fff|#ffffff|white|#FFFFFF)["'][^>]*\/>/gi, '')
        .replace(/<rect[^>]*width=["'](100%|800|500|512|1000)["'][^>]*fill=["'](%23ffffff|#fff|#ffffff|white|#FFFFFF)["'][^>]*\/>/gi, '')
        .replace(/<rect[^>]*fill=["'](%23ffffff|#fff|#ffffff|white|#FFFFFF)["'][^>]*width=["'](100%|800|500|512|1000)["'][^>]*\/>/gi, '');

      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg.trim())}`;
    } catch (e) {
      return src;
    }
  }

  // 2. Handle Raster Images (PNG/JPG) via Canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(src);
          return;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample corners to detect background color
        const topLeftR = data[0];
        const topLeftG = data[1];
        const topLeftB = data[2];

        const isCornerLight = topLeftR >= 210 && topLeftG >= 210 && topLeftB >= 210;

        if (isCornerLight) {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const distR = Math.abs(r - topLeftR);
            const distG = Math.abs(g - topLeftG);
            const distB = Math.abs(b - topLeftB);
            const distToBg = Math.max(distR, distG, distB);

            const isWhitePixel = r >= threshold && g >= threshold && b >= threshold;

            if (isWhitePixel || distToBg < 30) {
              const maxColor = Math.max(r, g, b);
              if (maxColor >= 240 || distToBg < 15) {
                data[i + 3] = 0; // Transparent
              } else if (maxColor >= 210) {
                const alphaFactor = (240 - maxColor) / 30;
                data[i + 3] = Math.floor(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(src);
        }
      } catch (err) {
        resolve(src);
      }
    };

    img.onerror = () => {
      resolve(src);
    };
  });
}

export const TransparentImage: React.FC<TransparentImageProps> = ({
  src,
  threshold = 225,
  className = '',
  alt = '',
  style,
  ...props
}) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src) return;

    // 1. Handle SVG Data URIs
    if (src.startsWith('data:image/svg+xml')) {
      try {
        let decoded = src.includes('charset=utf-8,')
          ? decodeURIComponent(src.split('charset=utf-8,')[1])
          : decodeURIComponent(src.replace('data:image/svg+xml;utf8,', '').replace('data:image/svg+xml,', ''));

        // Remove full background white rects
        const cleanedSvg = decoded
          .replace(/<rect[^>]*width=["'](100%|800|500|1000)["'][^>]*fill=["'](#fff|#ffffff|white|#FFFFFF)["'][^>]*\/>/gi, '')
          .replace(/<rect[^>]*fill=["'](#fff|#ffffff|white|#FFFFFF)["'][^>]*width=["'](100%|800|500|1000)["'][^>]*\/>/gi, '');

        const cleanedUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanedSvg.trim())}`;
        setProcessedSrc(cleanedUri);
        return;
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    // 2. Handle Raster Images (PNG/JPG/WebP/Data-URIs) via Canvas Pixel Inspection
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height) {
          setProcessedSrc(src);
          return;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedSrc(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample corners to detect background color (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
        const topLeftR = data[0];
        const topLeftG = data[1];
        const topLeftB = data[2];

        // Check if corner background is light/white (R, G, B > threshold)
        const isCornerLight = topLeftR >= 210 && topLeftG >= 210 && topLeftB >= 210;

        if (isCornerLight) {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check distance to top-left background color
            const distR = Math.abs(r - topLeftR);
            const distG = Math.abs(g - topLeftG);
            const distB = Math.abs(b - topLeftB);
            const distToBg = Math.max(distR, distG, distB);

            // Is pixel near-white or matching background?
            const isWhitePixel = r >= threshold && g >= threshold && b >= threshold;

            if (isWhitePixel || distToBg < 30) {
              const maxColor = Math.max(r, g, b);
              if (maxColor >= 240 || distToBg < 15) {
                data[i + 3] = 0; // Make 100% transparent
              } else if (maxColor >= 210) {
                // Feather edge for anti-aliasing
                const alphaFactor = (240 - maxColor) / 30;
                data[i + 3] = Math.floor(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          setProcessedSrc(canvas.toDataURL('image/png'));
        } else {
          setProcessedSrc(src);
        }
      } catch (err) {
        // If CORS error occurs (e.g. strict cross-domain image without CORS header),
        // fallback to original src (which will still be styled with mix-blend-multiply)
        setProcessedSrc(src);
      }
    };

    img.onerror = () => {
      setProcessedSrc(src);
    };
  }, [src, threshold]);

  return (
    <img
      src={processedSrc}
      alt={alt}
      className={`${className} mix-blend-multiply`}
      style={style}
      {...props}
    />
  );
};
