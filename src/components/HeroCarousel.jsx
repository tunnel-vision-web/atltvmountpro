import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUI } from "@/contexts/UIContext";

import pb from '@/lib/pocketbaseClient';

const DEFAULT_SLIDES = [
  {
    image: "/images/hero/hero-tv-mounting.jpg",
    fallback:
      "https://images.unsplash.com/photo-1698047945367-112339b04d51?w=1920&q=80",
    title: "Professional TV Mounting",
    description:
      "Expert installation for all TV sizes with clean cable management",
    cta: "Book Installation",
  },
  {
    image: "/images/hero/hero-drywall.jpg",
    fallback:
      "https://images.unsplash.com/photo-1618832515521-3a8c6716aafc?w=1920&q=80",
    title: "Drywall Repair Experts",
    description: "Seamless repairs and texture matching for perfect finishes",
    cta: "Estimate Your Job",
  },
  {
    image: "/images/hero/hero-painting.jpg",
    fallback:
      "https://images.unsplash.com/photo-1629195352955-850830e4d6c9?w=1920&q=80",
    title: "Professional Painting",
    description: "Interior and exterior painting with color consultation",
    cta: "Book a Service",
  },
];

const HeroCarousel = () => {
  const { openBookingModal, openQuoteModal } = useUI();
  const [carouselSlides, setCarouselSlides] = useState(DEFAULT_SLIDES);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 9500, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isTextHovered, setIsTextHovered] = useState(false);

  // Load home page CMS dynamic fields for first slide
  useEffect(() => {
    const loadCms = async () => {
      try {
        let homeCms;
        try {
          const record = await pb.collection('cms_pages').getFirstListItem('page="home"');
          homeCms = record?.data || record;
        } catch {
          const stored = localStorage.getItem('atltvmountpro_cms_data');
          if (stored) {
            homeCms = JSON.parse(stored).home;
          }
        }
        if (homeCms && (homeCms.heroTitle || homeCms.heroSubtitle || homeCms.heroVideo || homeCms.heroImage)) {
          setCarouselSlides((prev) => {
            const copy = [...prev];
            copy[0] = {
              ...copy[0],
              title: homeCms.heroTitle || copy[0].title,
              description: homeCms.heroSubtitle || copy[0].description,
              image: homeCms.heroImage || copy[0].image,
              video: homeCms.heroVideo || null,
            };
            return copy;
          });
        }
      } catch (err) {
        console.warn('HeroCarousel CMS load error:', err);
      }
    };
    loadCms();
  }, []);

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

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
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
        {carouselSlides.map((slide, index) => {
          const isVideo = slide.video && (
            slide.video.endsWith(".mp4") || 
            slide.video.endsWith(".webm") || 
            slide.video.endsWith(".ogg") || 
            slide.video.endsWith(".mov") || 
            slide.video.includes("/video/")
          );
          
          return (
            <div
              key={index}
              className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
              style={{ opacity: index === selectedIndex ? 1 : 0 }}
            >
              {isVideo && index === selectedIndex ? (
                <video
                  src={slide.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = slide.fallback;
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70 pointer-events-none transition-opacity duration-500 ${isTextHovered ? "opacity-0" : "opacity-100"}`} />

      {/* Embla carousel — used only for auto-advance timing + scroll index, content is animated via CSS */}
      <div className="relative h-[100dvh] w-full" ref={emblaRef}>
        <div className="flex">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative h-[100dvh]"
            >
              {/* Content — centered both axes */}
              <div className="absolute inset-0 flex items-center justify-center pt-20">
                <div 
                  className="w-full max-w-[860px] mx-auto px-6 sm:px-10 text-center cursor-default"
                  onMouseEnter={() => setIsTextHovered(true)}
                  onMouseLeave={() => setIsTextHovered(false)}
                >
                  {/* Animated content wrapper — only shown for active slide */}
                  {selectedIndex === index && (
                    <div
                      className={`hero-content ${visible ? "hero-content--visible" : "hero-content--hidden"}`}
                    >
                      <p className="hero-eyebrow">
                        Atlanta's Trusted Handyman Service
                      </p>
                      <h1 className="hero-title">{slide.title}</h1>
                      <p className="hero-desc">{slide.description}</p>
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

      {/* Prev / Next — constrained to the same 1140px layout grid */}
      <div className="absolute top-1/2 -translate-y-1/2 z-10 w-full pointer-events-none">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between pointer-events-none">
          <button
            onClick={scrollPrev}
            className="pointer-events-auto bg-white/10 backdrop-blur-sm hover:bg-white/25 text-white p-2.5 rounded-xl transition-all duration-200 border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="pointer-events-auto bg-white/10 backdrop-blur-sm hover:bg-white/25 text-white p-2.5 rounded-xl transition-all duration-200 border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-400 ${
              index === selectedIndex ? "bg-white w-8" : "bg-white/40 w-2"
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
          transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
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
          animation: slideRight 1.2s 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-content--visible .hero-title {
          animation: slideRight 1.2s 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-content--visible .hero-desc {
          animation: slideRight 1.2s 1.1s cubic-bezier(0.22,1,0.36,1) both;
        }
        .hero-content--visible .hero-cta {
          animation: slideRight 1.2s 1.5s cubic-bezier(0.22,1,0.36,1) both;
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
