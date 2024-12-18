import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";

export function Cover({ src, title }: { src: string, title: string}) {
  const [img, setImg] = useState(true)
  
  return (
    <div className={`relative group`}>
      <div className="w-full relative bg-secondary rounded-lg overflow-hidden flex">
          { img ? (
            <LazyLoadImage
            height={231}
            src={src}
            width={154}
            onError={() => setImg(false)}
            className={`relative bg-secondary h-[231px] hover:opacity-80 object-fill`}
            placeholder={<Skeleton className="w-36 h-full" />}
          />
          ) : <div className="bg-secondary p-4 h-[231px] w-[152px]">
                <p className="text-md line-clamp-6 text-muted-foreground">
                {title}
                </p>
            </div>}
      </div>
    </div>
  )
}