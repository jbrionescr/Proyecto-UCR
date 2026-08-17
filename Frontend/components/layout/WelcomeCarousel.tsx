"use client";

import React, { useState, useEffect } from "react";

export interface ImageItem {
  src: string;
  alt: string;
}

export const CAROUSEL_IMAGES: ImageItem[] = [
  {
    src: "/couple-holding-hands-green-meadow.jpg",
    alt: "Pareja tomándose de la mano en pradera verde"
  },
  {
    src: "/smiling-portrait-young-female-student-holding-books-takeaway-coffee-cup-standing-front-college-building.jpg",
    alt: "Estudiante sonriente con libros y café frente a la universidad"
  },
  {
    src: "/collection-books-put-feather-bed.jpg",
    alt: "Colección de libros sobre cama de plumas"
  }
];

export const LANDING_CAROUSEL_IMAGES: ImageItem[] = [
  {
    src: "/portrait-group-students-celebrating-their-graduation.jpg",
    alt: "Grupo de estudiantes celebrando su graduación"
  },
  {
    src: "/college-graduate-student-diploma-piggy-bank.jpg",
    alt: "Graduado universitario con diploma y alcancía"
  },
  {
    src: "/business-man-working-office-desktop.jpg",
    alt: "Hombre de negocios trabajando en su escritorio de oficina"
  }
];

interface WelcomeCarouselProps {
  className?: string;
  currentIndex?: number;
  images?: ImageItem[];
}

export function WelcomeCarousel({ 
  className, 
  currentIndex: propCurrentIndex,
  images = CAROUSEL_IMAGES
}: WelcomeCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);

  const isControlled = typeof propCurrentIndex === "number";
  const currentIndex = isControlled ? propCurrentIndex! : internalIndex;

  useEffect(() => {
    if (isControlled) return;
    const timer = setInterval(() => {
      setInternalIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isControlled, images.length]);

  return (
    <div className={className || "fixed inset-0 w-screen h-screen -z-10 bg-slate-950 overflow-hidden select-none pointer-events-none"}>
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {images.map((img, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full h-full object-cover transition-transform [transition-duration:6000ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Overlay: semi-transparent dark mask + slight blur on background to make the cards on top pop */}
              <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

