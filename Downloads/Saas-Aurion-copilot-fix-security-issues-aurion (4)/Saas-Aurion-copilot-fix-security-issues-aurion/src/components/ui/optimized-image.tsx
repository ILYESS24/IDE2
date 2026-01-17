import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // Pour les images above the fold
  quality?: number; // Qualité de compression (1-100)
  sizes?: string; // Pour responsive images
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Hook pour détecter le support des formats modernes
const useModernImageFormat = () => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const [supportsAVIF, setSupportsAVIF] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
    };

    const checkAVIF = async () => {
      if (!('createImageBitmap' in window)) return false;

      const response = await fetch('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=');
      return response.ok;
    };

    setSupportsWebP(checkWebP());
    checkAVIF().then(setSupportsAVIF);
  }, []);

  return { supportsWebP, supportsAVIF };
};

export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 80,
  sizes,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Si priority, charger immédiatement
  const imgRef = useRef<HTMLImageElement>(null);
  const { supportsWebP, supportsAVIF } = useModernImageFormat();

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Commencer le chargement 50px avant que l'image soit visible
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Générer les sources d'image optimisées
  const generateSources = () => {
    if (!isInView) return null;

    const baseSrc = src.replace(/\.(jpg|jpeg|png)$/i, '');
    const sources = [];

    // AVIF (meilleur compression)
    if (supportsAVIF) {
      sources.push(
        <source
          key="avif"
          srcSet={`${baseSrc}.avif`}
          type="image/avif"
        />
      );
    }

    // WebP (bon compromis)
    if (supportsWebP) {
      sources.push(
        <source
          key="webp"
          srcSet={`${baseSrc}.webp`}
          type="image/webp"
        />
      );
    }

    return sources;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder pendant le chargement
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-200 animate-pulse flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <picture className={cn(className)}>
      {generateSources()}

      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'hidden'
        )}
        {...props}
      />

      {/* Fallback si l'image ne charge pas */}
      {hasError && (
        <div
          className={cn(
            'bg-gray-100 flex items-center justify-center text-gray-400 text-sm',
            className
          )}
          style={{ width, height }}
        >
          <span>Image non disponible</span>
        </div>
      )}
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
