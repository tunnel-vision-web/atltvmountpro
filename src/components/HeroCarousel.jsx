
import React, { useCallback, useEffect, useState } from 'react';
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
    cta: 'Estimate Your Job',
  },
  {
    image: 'https://images.unsplash.com/photo-1629195352955-850830e4d6c9',
    title: 'Professional Painting',
    description: 'Interior and exterior painting with color consultation',
    cta: 'Book a Service',
  },
];

const HeroCarousel = () => {
  const { openBookingModal, openQuoteModal } = useUI();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      // Trigger exit → re-enter animation on slide change
      setVisible(false);
      setTimeout(() => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setVisible(true);
      }, 120);
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
    <div className="relative overflow-hidden w-full">
      {/* Image layer — absolutely positioned, crossfades only */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
            style={{ opacity: index === selectedIndex ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70 pointer-events-none" />

      {/* Embla carousel — used only for auto-advance timing + scroll index, content is animated via CSS */}
      <div className="relative h-[100dvh] w-full" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-[100dvh]">
              {/* Content — centered both axes */}
              <div className="absolute inset-0 flex items-center justify-center pt-20">
                <div className="w-full max-w-[860px] mx-auto px-6 sm:px-10 text-center">
                  {/* Animated content wrapper — only shown for active slide */}
                  {selectedIndex === index && (
                    <div
                      className={`hero-content ${visible ? 'hero-content--visible' : 'hero-content--hidden'}`}
                    >
                      <p className="hero-eyebrow">
                        Atlanta's Trusted Handyman Service
                      </p>
                      <h1 className="hero-title">
                        {slide.title}
                      </h1>
                      <p className="hero-desc">
                        {slide.description}
                      </p>
                      <div className="hero-cta">
                        <Button
                          size="lg"
                          onClick={() => handleCTA(index)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98] px-8 py-6 text-base font-semibold rounded-xl"
                        >
                          {slide.cta}
                        </Button>
                        {index !== 1 && (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={openQuoteModal}
                            className="border-white/60 text-white bg-white/10 hover:bg-white/20 hover:border-white transition-all duration-200 active:scale-[0.98] px-8 py-6 text-base font-semibold rounded-xl backdrop-blur-sm"
                          >
                            Estimate My Job
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/25 text-white p-2.5 rounded-xl transition-all duration-200 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/25 text-white p-2.5 rounded-xl transition-all duration-200 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-400 ${
              index === selectedIndex ? 'bg-white w-8' : 'bg-white/40 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        /* Eyebrow */
        .hero-eyebrow {
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        /* Title */
        .hero-title {
          font-size: clamp(1.92rem, 4.8vw, 3.36rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.08;
          letter-spacing: -0.025em;
          margin-bottom: 1.25rem;
        }

        /* Description */
        .hero-desc {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: rgba(255,255,255,0.85);
          max-width: 560px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        /* CTA row */
        .hero-cta {
          display: flex;
          gap: 0.875rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Slide-in from right + fade */
        .hero-content {
          will-change: opacity, transform;
          transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-content--hidden {
          opacity: 0;
          transform: translateX(40px);
        }
        .hero-content--visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* Stagger children — each element cascades one after the other */
        .hero-content--visible .hero-eyebrow {
          animation: slideRight 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-content--visible .hero-title {
          animation: slideRight 0.65s 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-content--visible .hero-desc {
          animation: slideRight 0.65s 0.75s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-content--visible .hero-cta {
          animation: slideRight 0.65s 1.05s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes slideRight {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-content,
          .hero-content--visible .hero-eyebrow,
          .hero-content--visible .hero-title,
          .hero-content--visible .hero-desc,
          .hero-content--visible .hero-cta {
            animation: none;
            transition: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
