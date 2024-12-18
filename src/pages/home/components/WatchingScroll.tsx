import { Cover } from "@/components/Cover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SeriesProps } from "electron/core/models/SeriesModels"
import { VodProps } from "electron/core/models/VodModels"
import { useEffect, useState } from "react"
import { Fade } from "react-awesome-reveal"

interface WatchingScrollProps {
  watchingVod: VodProps[]
  watchingSeries: SeriesProps[]
  setSelectedSeries: (series: SeriesProps) => void
  setSelectedVod: (vod: VodProps) => void
}

export function WatchingScroll({ watchingVod, watchingSeries, setSelectedSeries, setSelectedVod }: WatchingScrollProps) {
  const [watchingTab, setWatchingTab] = useState((watchingSeries.length < 1) && (watchingVod.length > 0) ? 1 : 0)

  const isSeries = watchingSeries.length > 0
  const isVod = watchingVod.length > 0

  useEffect(() => {
    if (!isSeries && isVod) return setWatchingTab(1)
    return setWatchingTab(0)
  }, [isSeries, isVod])

  return ((watchingVod.length > 0) || (watchingSeries.length > 0)) && (
    <div>
    <div className='flex gap-2'>
     <p className={`h-fit border text-muted-foreground bg-secondary text-sm py-0.5 px-4 w-fit mb-3 rounded-full transition gap-2`}>
       Continue watching
      </p>
      {watchingSeries!.length > 0 && (
        <p
          onClick={() => setWatchingTab(0)}
          className={`h-fit border ${watchingTab == 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'} cursor-pointer text-sm py-0.5 px-4 w-fit mb-3 rounded-full transition gap-2`}>
          Series
        </p>
      )}
      {watchingVod!.length > 0 && (
        <p
          onClick={() => setWatchingTab(1)}
          className={`h-fit border ${watchingTab == 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'} cursor-pointer text-sm py-0.5 px-4 w-fit mb-3 rounded-full transition gap-2`}>
          Movies
        </p>
      )}
    </div>
      <ScrollArea className="w-full rounded-md">
        <div className="flex w-max space-x-2 pb-6 pr-4 rounded-md">
          <Fade duration={200} triggerOnce>
            {(watchingTab == 0 && watchingSeries) && watchingSeries!.sort((a, b) => b.updatedAt! - a.updatedAt!).map(series => {
              return (
              <div
                className="flex flex-col hover:scale-95 transition gap-3 w-fit h-fit cursor-pointer relative"
                key={series.series_id}
                onClick={() => setSelectedSeries(series)}
              >
                <Cover src={series.cover} title={series.name} />
              </div>
              )
            })}
            {(watchingTab == 1 && watchingVod) && watchingVod!.sort((a, b) => b.updatedAt! - a.updatedAt!).map(movie => {
              return (
                <div
                  className="flex flex-col hover:scale-95 transition gap-3 w-fit h-fit cursor-pointer relative"
                  key={movie.num}
                  onClick={() => setSelectedVod(movie)}
                  >
                  <Cover src={movie.stream_icon} title={movie.name} />
                </div>
              )
            })}
          </Fade>
        </div>
        <ScrollBar color="blue" orientation="horizontal" />
      </ScrollArea>
  </div>
  )
}