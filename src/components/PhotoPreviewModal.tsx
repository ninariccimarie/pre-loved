import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type PhotoPreviewModalProps = {
  photos: string[]
  title: string
  initialIndex?: number
  onClose: () => void
}

const PhotoPreviewModal = ({
  photos,
  title,
  initialIndex = 0,
  onClose,
}: PhotoPreviewModalProps) => {
  const [index, setIndex] = useState(initialIndex)
  const hasMultiple = photos.length > 1

  const goTo = useCallback(
    (next: number) => {
      if (!photos.length) return
      setIndex((next + photos.length) % photos.length)
    },
    [photos.length],
  )

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex, photos])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goTo(index - 1)
      if (event.key === 'ArrowRight') goTo(index + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [goTo, index, onClose])

  if (!photos.length) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} photo preview`}
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <p className="truncate text-sm font-semibold sm:text-base">
            {title}
            {hasMultiple ? ` · ${index + 1}/${photos.length}` : ''}
          </p>
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          <img
            src={photos[index]}
            alt={`${title} photo ${index + 1}`}
            className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
            referrerPolicy="no-referrer"
            decoding="async"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => goTo(index - 1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:left-2"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => goTo(index + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:right-2"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoPreviewModal
