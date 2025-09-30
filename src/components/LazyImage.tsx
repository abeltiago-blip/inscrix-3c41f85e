import { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet, getSizes } from '@/utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTMuMzMzMyAxMy4zMzMzQzEzLjMzMzMgMTIuNTk2OSAxMy45MjY0IDEyIDEyLjY2NjcgMTJDMTUuNDA2MSAxMiAxNi42NjY3IDEzLjI2MTkgMTYuNjY2NyAxNlYyNEMxNi42NjY3IDI0LjczNjUgMTYuMDczNiAyNS4zMzMzIDE1LjMzMzMgMjUuMzMzM0gxMkM5LjI2MTkgMjUuMzMzMyA4IDI0LjA3MTQgOCAyMS4zMzMzVjE2QzggMTUuMjYzNiA4LjU5MjkgMTQuNjY2NyA5LjMzMzMzIDE0LjY2NjdIMTMuMzMzM1YxMy4zMzMzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K',
  width,
  height
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder */}
      <img
        src={placeholder}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Actual image */}
      {isInView && (
        <img
          src={getOptimizedImageUrl(src, width, 80)}
          srcSet={generateSrcSet(src)}
          sizes={getSizes()}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default LazyImage;