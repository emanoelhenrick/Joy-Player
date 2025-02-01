import { RatingStars } from "@/components/RatingStars"
import { Skeleton } from "@/components/ui/skeleton"
import { TitleLogo } from "moviedb-promise"

interface Props {
  title: string
  releaseDate: string
  genre: string
  description: string
  cast: string
  director: string
  logos: TitleLogo[]
  rating: number
}

export function InfoSection({ title, releaseDate, cast, description, director, genre, logos, rating }: Props) {

  function getRightLogo(logos: TitleLogo[]) {
    if (!logos) return
    if (logos.length === 0) return
    const filteredByIso = logos.filter(l => l.iso_639_1 === 'en')
    if (filteredByIso.length === 0) return `https://image.tmdb.org/t/p/w500${logos[0].file_path}`
    const filteredByAspectRatio = filteredByIso.filter(l => l.aspect_ratio! > 1.5 )
    if (filteredByAspectRatio.length === 0) return `https://image.tmdb.org/t/p/w500${filteredByIso[0].file_path}`
    return `https://image.tmdb.org/t/p/w500${filteredByAspectRatio[0].file_path}`
  }

  const logoPath = getRightLogo(logos)

  return (
    <div>
        <div className="max-w-96 h-fit">
          {logoPath !== undefined ? (
              <img key={'logo'} className="object-contain max-h-40" src={logoPath} alt="" />
          ) : <h1 className="text-5xl">{title || <Skeleton className="h-16" />}</h1>}
        </div>

        {(releaseDate || genre || rating) && (
          <div className="flex items-center gap-4 mt-4 py-1">
            {releaseDate && <span style={{ lineHeight: 1}} className="text-base 2xl:text-lg text-muted-foreground">{releaseDate}</span>}
            {genre && <span style={{ lineHeight: 1}} className="text-base 2xl:text-lg text-muted-foreground">{genre}</span>}
            {rating && <RatingStars rating={rating} />}
          </div>
        )}
      
      <div className="mt-2 flex flex-col gap-4">
        {description && <span className="text-base 2xl:text-lg max-w-screen-md 2xl:max-w-screen-lg text-primary line-clamp-6">{description}</span>}
        
        {(cast || director) && (
          <div>
            <p className="truncate max-w-xl text-muted-foreground">
              {cast}
            </p>
            <p className="text-muted-foreground max-w-screen-md 2xl:max-w-screen-lg">
              {director && 'Directed by ' + director}
            </p>
          </div>
        )}
        
        <span className="text-primary/90 max-w-screen-md 2xl:max-w-screen-lg">Title: {title}</span>
      </div>
    </div>
  )
    
}