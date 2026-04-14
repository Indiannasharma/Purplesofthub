'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  /**
   * Priority loading for above-the-fold images (LCP optimization)
   */
  priority?: boolean;
  
  /**
   * Show a loading skeleton while image loads
   */
  showSkeleton?: boolean;
  
  /**
   * Custom placeholder color
   */
  placeholderColor?: string;
  
  /**
   * Object fit style
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage - A wrapper around Next.js Image with:
 * - Automatic WebP/AVIF conversion
 * - Skeleton loading states
 * - Proper sizing attributes
 * - CLS prevention with explicit dimensions
 * - Lazy loading by default (except priority images)
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority = false,
  showSkeleton = true,
  placeholderColor = 'rgba(124, 58, 237, 0.1)',
  objectFit = 'cover',
  className = '',
  style,
  quality,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(showSkeleton);
  const [hasError, setHasError] = useState(false);

  // Default quality for optimal balance
  const imageQuality = quality || 75;

  // Default sizes for responsive images
  const imageSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  if (hasError) {
    // Fallback placeholder with cyberpunk styling
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : fill ? '100%' : '200px',
          background: placeholderColor,
          ...style,
        }}
      >
        <span style={{ fontSize: '48px' }}>🖼️</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : fill ? '100%' : undefined,
        height: fill ? '100%' : height ? `${height}px` : undefined,
        ...style,
      }}
    >
      {/* Skeleton loader */}
      {isLoading && showSkeleton && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(90deg, 
              ${placeholderColor} 0%, 
              rgba(168, 85, 247, 0.15) 50%, 
              ${placeholderColor} 100%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={imageSizes}
        priority={priority}
        quality={imageQuality}
        loading={priority ? 'eager' : 'lazy'}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit,
          ...(fill ? { position: 'absolute' } : {}),
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}

/**
 * HeroImage - Optimized for hero/LCP images
 * - Priority loading
 * - Larger quality
 * - No skeleton (priority images should load fast)
 */
export function HeroImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  style,
  ...props
}: Omit<OptimizedImageProps, 'priority' | 'showSkeleton' | 'quality'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={true}
      showSkeleton={false}
      quality={85}
      sizes="(max-width: 768px) 100vw, 50vw"
      className={className}
      style={style}
      {...props}
    />
  );
}

/**
 * ThumbnailImage - Optimized for small images/thumbnails
 * - Lower quality
 * - Smaller sizes
 */
export function ThumbnailImage({
  src,
  alt,
  width = 48,
  height = 48,
  className = '',
  style,
  ...props
}: Omit<OptimizedImageProps, 'priority' | 'showSkeleton' | 'quality' | 'width' | 'height'> & {
  width?: number;
  height?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={false}
      showSkeleton={false}
      quality={60}
      sizes="48px"
      className={className}
      style={style}
      {...props}
    />
  );
}

/**
 * BlogImage - Optimized for blog post featured images
 */
export function BlogImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  style,
  ...props
}: Omit<OptimizedImageProps, 'priority' | 'showSkeleton' | 'quality'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={false}
      showSkeleton={true}
      quality={70}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholderColor="rgba(124, 58, 237, 0.08)"
      className={className}
      style={style}
      {...props}
    />
  );
}