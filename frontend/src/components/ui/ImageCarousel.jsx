import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageCarousel({ images, altPrefix, className = "" }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  const scrollTo = (index) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative group ${className}`}>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .flex::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {images.map((img, index) => (
          <img 
            key={index} 
            src={img.url || img} 
            alt={`${altPrefix} ${index + 1}`} 
            className="w-full h-full object-cover shrink-0 snap-center" 
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={() => scrollTo(Math.max(currentIndex - 1, 0))}
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-surface-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm ${currentIndex === 0 ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <button
            onClick={() => scrollTo(Math.min(currentIndex + 1, images.length - 1))}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-surface-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm ${currentIndex === images.length - 1 ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-5 h-5 ml-0.5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-md">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentIndex === index 
                    ? 'bg-white w-3' 
                    : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
