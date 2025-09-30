// Image optimization utilities
export const getOptimizedImageUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url) return '';
  
  // For Unsplash images, add optimization parameters
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&q=${quality}&fm=webp&fit=crop`;
  }
  
  // For other images, return as-is (can be extended for other providers)
  return url;
};

export const generateSrcSet = (url: string) => {
  if (!url) return '';
  
  if (url.includes('unsplash.com')) {
    return [
      `${getOptimizedImageUrl(url, 400, 80)} 400w`,
      `${getOptimizedImageUrl(url, 800, 80)} 800w`,
      `${getOptimizedImageUrl(url, 1200, 80)} 1200w`
    ].join(', ');
  }
  
  return '';
};

export const getSizes = () => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};