import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useLightweightMedia } from "@/hooks/useLightweightMedia";

interface FeaturedCarouselProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  title?: string;
  autoPlayInterval?: number;
}

export function FeaturedCarousel({
  items,
  renderCard,
  title = "Featured",
  autoPlayInterval = 5000
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lightweight = useLightweightMedia();
  useEffect(() => { setCurrentIndex(index => Math.min(index, Math.max(0, items.length - 1))); }, [items.length]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (lightweight || !isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [lightweight, isAutoPlaying, items.length, autoPlayInterval]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <h2 className="text-3xl font-bold">{title}</h2>
      </motion.div>

      <div className="relative">
        {/* Navigation Buttons */}
        {items.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous featured item"
              className="absolute left-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next featured item"
              className="absolute right-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden sm:px-12">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {renderCard(items[Math.min(currentIndex, items.length - 1)], currentIndex)}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        {items.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6 px-12">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className={`h-6 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-6 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
