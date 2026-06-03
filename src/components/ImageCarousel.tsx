import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ImageOff, FileText, ExternalLink } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt?: string
  className?: string
}

function getFileType(url: string): 'image' | 'video' | 'document' {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video'
  if (['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(ext)) return 'document'
  return 'image'
}

function MediaSlot({ url, alt, index, errors, onError }: {
  url: string
  alt: string
  index: number
  errors: Set<number>
  onError: (i: number) => void
}) {
  const type = getFileType(url)

  if (errors.has(index)) {
    return (
      <div className="flex h-44 items-center justify-center">
        <ImageOff className="h-8 w-8 text-muted-foreground opacity-40" />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        onError={() => onError(index)}
        className="h-44 w-full object-cover"
      />
    )
  }

  if (type === 'document') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-44 w-full flex-col items-center justify-center gap-2 bg-muted hover:bg-muted/80 transition-colors"
      >
        <FileText className="h-10 w-10 text-muted-foreground" />
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          View File <ExternalLink className="h-3 w-3" />
        </span>
      </a>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => onError(index)}
      className="h-44 w-full object-cover"
    />
  )
}

export function ImageCarousel({ images, alt = 'Listing image', className }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [current, setCurrent] = useState(0)
  const [errors, setErrors] = useState<Set<number>>(new Set())

  const onError = useCallback((i: number) => setErrors((e) => new Set(e).add(i)), [])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
    setCurrent((c) => Math.max(0, c - 1))
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
    setCurrent((c) => Math.min(images.length - 1, c + 1))
  }, [emblaApi, images.length])

  if (!images.length) {
    return (
      <div className={cn('flex h-44 items-center justify-center rounded-lg bg-muted', className)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8 opacity-40" />
          <span className="text-xs">No photos</span>
        </div>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={cn('overflow-hidden rounded-lg bg-muted', className)}>
        <MediaSlot url={images[0]} alt={alt} index={0} errors={errors} onError={onError} />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted', className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="min-w-full">
              <MediaSlot url={img} alt={`${alt} ${i + 1}`} index={i} errors={errors} onError={onError} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={scrollPrev}
        disabled={current === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30 transition-opacity hover:bg-black/70"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollNext}
        disabled={current === images.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30 transition-opacity hover:bg-black/70"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50')}
          />
        ))}
      </div>
    </div>
  )
}
