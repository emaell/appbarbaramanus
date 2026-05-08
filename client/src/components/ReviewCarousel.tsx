import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Review } from '@shared/types';
import { Card } from './ui/card';

interface ReviewCarouselProps {
  reviews: Review[];
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (reviews.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentReview = reviews[currentIndex];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Avaliacoes de usuarios</h3>
      <Card className="p-6 relative">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < currentReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
              />
            ))}
          </div>
          {currentReview.verified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Verificado
            </span>
          )}
        </div>

        <p className="text-sm mb-4 italic">"{currentReview.text}"</p>

        <p className="text-xs text-muted-foreground font-medium">— {currentReview.author}</p>

        {/* Navegacao */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Avaliacao anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label={`Ir para avaliacao ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Proxima avaliacao"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Card>
    </div>
  );
}
