import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PhotoCarouselProps = {
  photos: string[]
  title: string
}

const PhotoCarousel = ({ photos, title }: PhotoCarouselProps) => {
  const [index, setIndex] = useState(0)
  const hasMultiple = photos.length > 1

  const goTo = useCallback(
    (next: number) => {
      if (!photos.length) return
      setIndex((next + photos.length) % photos.length)
    },
    [photos.length],
  )

  useEffect(() => {
    setIndex(0)
  }, [photos])

  if (!photos.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--chip-bg)_88%,transparent)] text-sm text-[var(--sea-ink-soft)]">
        No photos
      </div>
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[color-mix(in_oklab,var(--chip-bg)_88%,transparent)]">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={photos[index]}
          alt={`${title} photo ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          referrerPolicy="no-referrer"
          decoding="async"
        />
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/90 p-2 text-[var(--sea-ink)] shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/90 p-2 text-[var(--sea-ink)] shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((photo, dotIndex) => (
              <button
                key={photo}
                type="button"
                aria-label={`Go to photo ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={`h-2 rounded-full transition-all ${
                  dotIndex === index
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PhotoCarousel
