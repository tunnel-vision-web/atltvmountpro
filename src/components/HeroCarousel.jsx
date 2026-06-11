
import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUI } from '@/contexts/UIContext';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1698047945367-112339b04d51',
    title: 'Professional TV Mounting',
    description: 'Expert installation for all TV sizes with clean cable management',
    cta: 'Book Installation',
  },
  {
    image: 'https://images.unsplash.com/photo-1618832515521-3a8c6716aafc',
    title: 'Drywall Repair Experts',
    description: 'Seamless repairs and texture matching for perfect finishes',
    cta: 'Get Quote',
  },
  {
    image: 'https://images.unsplash.com/photo-1629195352955-850830e4d6c9',
    title: 'Professional Painting',
    description: 'Interior and exterior painting with color consultation',
    cta: 'Schedule Service',
  },
];

const HeroCarousel = () => {
  const { openBookingModal, openQuoteModal } = useUI();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const handleCTA = (index) => {
    if (index === 1) {
      openQuoteModal();
    } else {
      openBookingModal();
    }
  };

  return (
    <div className="relative overflow-hidden w-full" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, index) => (
          <div key={index} className="flex-[0_0_100%] min-w-0 relative">
            <div className="relative h-[100dvh] w-screen">
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center pt-20">
                <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.02em' }}>
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    <Button
                      size="lg"
                      onClick={() => handleCTA(index)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                    >
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-xl transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-xl transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === selectedIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
