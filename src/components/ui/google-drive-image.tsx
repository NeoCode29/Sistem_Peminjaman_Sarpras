"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GoogleDriveImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  fallback?: React.ReactNode;
  priority?: boolean;
}

// Convert Google Drive URL to different formats
function getGoogleDriveUrls(url: string): string[] {
  if (!url.includes('drive.google.com')) {
    return [url];
  }

  const fileIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (!fileIdMatch) {
    return [url];
  }

  const fileId = fileIdMatch[1];
  
  return [
    `https://drive.google.com/uc?id=${fileId}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    url // Original URL as fallback
  ];
}

export function GoogleDriveImage({
  src,
  alt,
  className,
  fill = false,
  sizes,
  width,
  height,
  fallback,
  priority = false,
}: GoogleDriveImageProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const urls = getGoogleDriveUrls(src);
  const currentUrl = urls[currentUrlIndex];

  const handleError = () => {
    console.error(`Failed to load image from: ${currentUrl}`);
    
    if (currentUrlIndex < urls.length - 1) {
      // Try next URL
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      // All URLs failed
      setHasError(true);
    }
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center text-gray-400", className)}>
        <span className="text-sm">Gambar tidak dapat dimuat</span>
      </div>
    );
  }

  const commonProps = {
    src: currentUrl,
    alt,
    onError: handleError,
    className: cn("transition-opacity duration-200", className),
    priority,
  };

  if (fill) {
    return (
      <Image
        {...commonProps}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    );
  }

  return (
    <Image
      {...commonProps}
      width={width || 400}
      height={height || 300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
} 