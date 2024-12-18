import { Progress } from "@/components/ui/progress";
import electronApi from "@/config/electronApi";
import { useLivePlaylist, useSeriesPlaylist, useVodPlaylist } from "@/states/usePlaylistData";
import { makeUrls, usePlaylistUrl } from "@/states/usePlaylistUrl";
import { useUserData } from "@/states/useUserData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlaylistInfo } from "electron/core/models/PlaylistInfo";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

export function SplashLoading() {
  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const [progress, setProgress] = useState(0)

  const updateUrls = usePlaylistUrl(state => state.updateUrls)
  const updateUserData = useUserData(state => state.updateUserData)
  const updateVodPlaylistState = useVodPlaylist(state => state.update)
  const updateSeriesPlaylistState = useSeriesPlaylist(state => state.update)
  const updateLivePlaylistState = useLivePlaylist(state => state.update)

  const { isSuccess, data  } = useQuery({ queryKey: ['playlistExists'], queryFn: electronApi.getMetadata, staleTime: Infinity })

  async function updateStates(info: PlaylistInfo, profile: string) {
    const userData = await electronApi.getUserData({ playlistName: info.name, profile })
    setProgress(25)

    const vodData = await electronApi.getLocalVodPlaylist(info.name)
    setProgress(50)

    const seriesData = await electronApi.getLocalSeriesPlaylist(info.name)
    setProgress(75)

    const liveData = await electronApi.getLocalLivePlaylist(info.name)
    setProgress(99)

    const urls = makeUrls(info)
    updateUrls(urls)

    updateVodPlaylistState(vodData)
    updateSeriesPlaylistState(seriesData)
    updateLivePlaylistState(liveData)
    updateUserData(userData)

    navigate(`/dashboard/home/${info.name}`)
  }

  useEffect(() => {
    if (isSuccess) {
      if (data.playlists.length === 0) return navigate('/initial')
      const currentPlaylist = data.playlists.find(p => p.name == data.currentPlaylist.name)!
      queryClient.removeQueries()
      updateStates(currentPlaylist, data.currentPlaylist.profile)
    }
  }, [isSuccess])

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <p className="animate-pulse">Loading...</p>
      <Progress className="transition w-72" value={progress} />
    </div>
  )
}