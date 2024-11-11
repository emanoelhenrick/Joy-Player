import { useState } from "react"

export function LiveImage({ src }: { src: string }) {
  const [isOk, setIsOk] = useState(true)
  return (
    isOk && (<img onError={() => setIsOk(false)} className="h-8 rounded-md" src={src} />)
  )
}