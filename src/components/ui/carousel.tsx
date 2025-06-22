"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { GoogleDriveImage } from "./google-drive-image"

interface CarouselProps {
  images: string[]
  aspectRatio?: "square" | "video"
  className?: string
}

export function Carousel({
  images,
  aspectRatio = "square",
  className = "",
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length)
  }

  const next = () => {
    setCurrentIndex((currentIndex + 1) % images.length)
  }

  if (!images.length) return null

  return (
    <div className={`relative ${className}`}>
      <div className={`relative w-full ${
        aspectRatio === "square" ? "aspect-square" : "aspect-video"
      }`}>
        <GoogleDriveImage
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-sm">Gambar tidak dapat dimuat</span>
            </div>
          }
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-white/70 hover:bg-white/90"
            onClick={prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-white/70 hover:bg-white/90"
            onClick={next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
} 