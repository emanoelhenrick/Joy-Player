import { Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/dashboard/SelectCategories"
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useDebounce } from 'use-debounce';
import { VodProps } from 'electron/core/models/VodModels';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Input } from '@/components/dashboard/input';
import { useSeriesPlaylist, useVodPlaylist } from '@/states/usePlaylistData';
import { MenuTab } from './components/MenuTab';
import { useMeasure } from "@uidotdev/usehooks";
import Fuse from "fuse.js"

const VodPlaylistScroll = lazy(() => import('./components/vod/VodPlaylistScroll'))
const SeriesPlaylistScroll = lazy(() => import('./components/series/SeriesPlaylistScroll'))

export function Dashboard() {
  const vodData = useVodPlaylist((state => state.data))
  const seriesData = useSeriesPlaylist((state => state.data))

  const [ref, { width }] = useMeasure();

  const [playlist, setPlaylist] = useState<VodProps[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all')
  const [enoughItems, setEnoughItems] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [tab, setTab] = useState('vod')

  function switchTab(tab: string) {
    setSearchValue('')
    setTab(tab)
  }

  let data: { categories: any[], playlist: any[] } = vodData;
  if (tab === 'vod') data = vodData
  if (tab === 'series') data = seriesData

  const [searchText, setSearchValue] = useState('')
  const [search, { flush }] = useDebounce(searchText, 300)

  const filtered = useMemo(() => {
    setPage(1)
    if (data) {
      const fuse = new Fuse(data!.playlist, {
        keys: ['name'],
        threshold: 0.4,
        minMatchCharLength: 2
      })

      if (currentCategory === 'all') {
        return search.length > 0 ? fuse.search(search).map(i => i.item) : data!.playlist
      }

      return search.length > 0 ? fuse.search(search)
        .map(i => i.item)
        .filter(p => p.category_id === currentCategory) :
          data!.playlist.filter(p => p.category_id === currentCategory)
    }
    
  }, [search, currentCategory, data, tab])

  function paginate(page: number, elements: number) {
    if (!filtered) return []

    const startIndex = (page - 1) * elements
    const endIndex = (page * elements) > filtered.length ? (filtered.length) : (page * elements)

    if (endIndex === filtered.length) setHasMore(false)

    const paginated = filtered.length === 1 ? filtered : filtered.slice(startIndex, endIndex)
    if (playlist.length > 0) return setPlaylist(paginated)
    return setPlaylist(paginated)
  }

  function nextPage() {
    setPage(prev => prev + 1)
  }

  function previousPage() {
    if (page > 1) setPage(prev => prev - 1)
  }

  useEffect(() => {
    flush()
    setCurrentCategory('all')
  }, [tab])

  useEffect(() => {
    setSearchValue('')
  }, [currentCategory])

  useEffect(() => {
    const itemsPerPage = Math.floor(width! / 154) * 10
    setPages(Math.ceil(filtered!.length / itemsPerPage))
    setEnoughItems(filtered!.length < itemsPerPage)
    setPlaylist([])
    setHasMore(true)
    paginate(page, itemsPerPage)
  }, [search, currentCategory, page, data, tab, width])

  const firstPage = page < 2 ? page : page - 1
  const midPage = page > 1 ? page : 2

  return (
    <div className="h-fit w-full flex flex-col">
      <div className="flex flex-col w-full">
        <div className='ml-20 flex flex-col gap-2'>
          <div ref={ref} className='flex ml-2 items-center justify-between mt-4'>
            <div className='flex items-center gap-2'>
              <MenuTab tab={tab} switchTab={switchTab} />
              <Select onValueChange={(value) => setCurrentCategory(value)} value={currentCategory}>
                <SelectTrigger  className="w-fit gap-2">
                  <SelectValue  placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'all'}>All</SelectItem>
                    {data.categories && data.categories.map(c => <SelectItem value={c.category_id} key={c.category_id}>{c.category_name}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <Input className="w-36 text-sm bg-secondary rounded-full h-fit" placeholder='search' onChange={(e) => setSearchValue(e.target.value)} value={searchText} />
              {searchText ?
                <X onClick={() => setSearchValue('')} size={20} className="text-muted-foreground cursor-pointer mr-4 opacity-60" /> :
                <Search size={20} className="mr-4 text-muted-foreground opacity-60" />
              }
            </div>
          </div>
          {playlist.length > 0 ?
            <Suspense fallback={<div className='w-full h-screen' />}>
              {tab === 'vod' && <VodPlaylistScroll data={playlist} />}
              {tab === 'series' && <SeriesPlaylistScroll data={playlist} />}
            </Suspense> : (
              search && <p className='ml-6 text-sm text-muted-foreground'>No results found</p>
            )
          }
        </div>
      </div>
      <div className='flex justify-center mb-8'>
      {(!enoughItems && playlist.length > 0) && (
          <Pagination className='mr-6 mt-4 pb-6 absolute w-fit'>
            <PaginationContent>
              <PaginationItem className={`${page < 2 && 'hidden'}`}>
                <div onClick={previousPage} className='text-muted-foreground hover:text-primary transition'><IoIosArrowBack size={16} /></div>
              </PaginationItem>
              <PaginationItem className={`${page > 2 ? '' : 'hidden'}`}>
                <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
              </PaginationItem>
              <PaginationEllipsis className={`${page == pages ? '' : 'hidden'} ${pages < 3 && 'hidden'}`} />
              <PaginationItem>
                <PaginationLink onClick={() => setPage(firstPage)} isActive={page == firstPage}>{firstPage}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => setPage(midPage)} isActive={page == midPage}>{midPage}</PaginationLink>
              </PaginationItem>
              <PaginationEllipsis className={`${((page == pages - 1) || (page == pages)) && 'hidden'}`} />
              <PaginationItem className={`${page == pages && 'hidden'} ${pages < 3 && 'hidden'}`}>
                <PaginationLink onClick={() => setPage(pages)}>{pages}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <div onClick={nextPage} className={`text-muted-foreground hover:text-primary transition ${!hasMore && 'invisible'}`}><IoIosArrowForward size={16} /></div>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}