"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardBody, CardTitle } from "~~/components/kibo";

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface PromoCarouselProps {
  /** Array of carousel items. Defaults to promotional content */
  items?: CarouselItem[];
  /** Auto-rotation interval in milliseconds. Default: 5000ms */
  autoRotateInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

const defaultItems: CarouselItem[] = [
  {
    id: 1,
    title: "Buy crypto in minutes",
    description: "No waiting, no hassle.",
    icon: "🚀",
  },
  {
    id: 2,
    title: "Secure transactions",
    description: "Your funds are always safe.",
    icon: "🔒",
  },
  {
    id: 3,
    title: "24/7 support",
    description: "We're here when you need us.",
    icon: "💬",
  },
];

/**
 * Promotional carousel with touch/mouse drag support and auto-rotation.
 * Features: swipe navigation, clickable dots, hover pause, responsive design.
 */
export const PromoCarousel = ({
  items = defaultItems,
  autoRotateInterval = 5000,
  className = "",
}: PromoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // Visual feedback during drag (-30% to +30%)
  const [isPaused, setIsPaused] = useState(false); // Pauses auto-rotation on interaction
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleStart = useCallback((clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
    setDragOffset(0);
    setIsPaused(true);
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !carouselRef.current) return;

      const diff = startX - clientX;
      const containerWidth = carouselRef.current.offsetWidth;
      const newOffset = Math.max(-30, Math.min(30, (diff / containerWidth) * 100));

      setDragOffset(newOffset);

      // Trigger slide shift when dragged 15% of container width
      if (Math.abs(diff) > containerWidth * 0.15) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        setIsDragging(false);
        setDragOffset(0);
      }
    },
    [isDragging, startX, nextSlide, prevSlide]
  );

  const handleEnd = useCallback(() => {
    if (isDragging) {
      setTimeout(() => setIsPaused(false), 800);
    }
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      handleStart(e.clientX);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mouseleave", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isPaused) return;

    autoRotateRef.current = setInterval(nextSlide, autoRotateInterval);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [nextSlide, autoRotateInterval, isPaused]);

  return (
    <div className={className}>
      <div
        ref={carouselRef}
        className="relative overflow-hidden mb-6 cursor-grab active:cursor-grabbing select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => !isDragging && setIsPaused(false)}
      >
        <div
          className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translateX(-${currentIndex * 100 + dragOffset}%)`,
          }}
        >
          {items.map(item => (
            <div key={item.id} className="w-full flex-shrink-0">
              <Card className="mx-0">
                <CardBody className="flex items-center p-6">
                  <div className="flex-1 text-start">
                    <CardTitle className="text-base mb-4 text-base-content">{item.title}</CardTitle>
                    <p className="text-sm text-base-content opacity-70">{item.description}</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center ml-4">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mb-4">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex ? "bg-primary" : "bg-primary/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
