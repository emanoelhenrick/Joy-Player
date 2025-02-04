import { Button } from "@/components/ui/button";
import electronApi from "@/config/electronApi";
import { useEffect, useRef, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";
import { SettingsPage } from "@/pages/settings";
import { Avatar } from "../ui/avatar";
import { usePlaylistUrl } from "@/states/usePlaylistUrl";
import { toast } from "@/hooks/use-toast";
import { MetaProps } from "electron/core/models/MetaProps";
import { differenceInHours } from "date-fns";
import { useLivePlaylist, useSeriesPlaylist, useVodPlaylist } from "@/states/usePlaylistData";
import { SelectProfile } from "../select-profile/SelectProfile";
import { useUserData } from "@/states/useUserData";
import { PiHouseFill, PiMonitorFill, PiBroadcastFill, PiGearSixFill } from "react-icons/pi";
import { useMeasure } from "@uidotdev/usehooks";

interface ProfilesProps {
  current: string
  profiles: string[]
  playlistName: string
}

export function MenuBar() {
  const [playlistName, setPlaylistName] = useState<string>('')
  const [updating, setUpdating] = useState(false)
  const [profileDialog, setProfileDialog] = useState(false)
  const [updatingError, setUpdatingError] = useState(false)
  const [profiles, setProfiles] = useState<ProfilesProps>({ current: '', profiles: [''], playlistName: '' })
  const { urls } = usePlaylistUrl()
  const navigate = useNavigate();
  const location = useLocation()
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [updateRender, setUpdateRender] = useState(false)
  const [menuRef, { width }] = useMeasure();

  const updateVodPlaylistState = useVodPlaylist(state => state.update)
  const updateSeriesPlaylistState = useSeriesPlaylist(state => state.update)
  const updateLivePlaylistState = useLivePlaylist(state => state.update)
  const updateUserData = useUserData(state => state.updateUserData)

  async function getPlaylistName() {
    const meta = await electronApi.getMetadata()
    const prof = {
      current: meta.currentPlaylist.profile,
      profiles: meta.playlists.find(p => p.name === meta.currentPlaylist.name)!.profiles,
      playlistName: meta.currentPlaylist.name
    }
    setProfiles(prof)
    setPlaylistName(meta.currentPlaylist.name)
    await updateCurrentPlaylist(meta)
  }

  async function verifyAuth() {
    try {
      await electronApi.authenticateUser(urls.getAuthenticateUrl)
    } catch (error) {
      setUpdatingError(true)
      return toast({
        title: 'The playlist could not be updated',
        description: 'Check if the playlist data is correct.',
        variant: "destructive"
      })
    }
  }

  async function changeProfile(selectedProfile: string) {
    const userData = await electronApi.getUserData(selectedProfile)
    await electronApi.switchProfile(selectedProfile)
    updateUserData(userData)
    setUpdateRender(prev => !prev)
    toast({ title: `switching to ${selectedProfile}`})
    setProfileDialog(false)
  }

  async function updateCurrentPlaylist(metadata: MetaProps) {
    const playlist = metadata.playlists.find(p => p.name === metadata.currentPlaylist.name)
    const difference = differenceInHours(Date.now(), new Date(playlist!.updatedAt!))
    if (difference < 12) return
    setUpdating(true)
    const isValidated = await electronApi.authenticateUser(urls.getAuthenticateUrl)
    if (!isValidated) {
      setUpdatingError(true)
      setUpdating(false)
      toast({
        title: 'The playlist could not be updated',
        description: 'Check if the playlist data is correct.',
        variant: "destructive"
      })
      return
    }

    setUpdatingError(false)
    toast({ title: `Updating playlist ${metadata.currentPlaylist.name}`})
    const updatedVod = await electronApi.updateVod({ playlistUrl: urls.getAllVodUrl, categoriesUrl: urls.getAllVodCategoriesUrl, name: metadata.currentPlaylist.name })
    const updatedSeries = await electronApi.updateSeries({ playlistUrl: urls.getAllSeriesUrl, categoriesUrl: urls.getAllSeriesCategoriesUrl, name: metadata.currentPlaylist.name })
    const updatedLive = await electronApi.updateLive({ playlistUrl: urls.getAllLiveUrl, categoriesUrl: urls.getAllLiveCategoriesUrl, name: metadata.currentPlaylist.name })
    await electronApi.updatedAtPlaylist(metadata.currentPlaylist.name)

    updateVodPlaylistState(updatedVod)
    updateSeriesPlaylistState(updatedSeries)
    updateLivePlaylistState(updatedLive)
    
    setUpdating(false)
    toast({ title: 'The playlist was updated'})
  }

  const ref = useRef<any>();

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current
        && !ref.current.contains(event.target)
        && !isCreating
        && !isEditing
        && !isRemoving
      ) setProfileDialog(false)
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [changeProfile]);

  useEffect(() => {
    verifyAuth()
    getPlaylistName()
  }, [updateRender])

  function getInitials(string: string) {
    if (!string || typeof string !== 'string') return '';
    const words = string.trim().split(/\s+/);
    const initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase());
    return initials.join('');
  }

  return (
    <div>
      <div style={{ width: width ? width : 95 }} className="block" />
    
      <div ref={menuRef} className="flex flex-col fixed bg-background left-0 justify-between items-center px-6 py-4 h-screen z-10">
        <Fade cascade direction="up" triggerOnce duration={500}>
          <Dialog open={profileDialog} >
            <DialogTrigger onClick={() => setProfileDialog(true)} asChild>
              <div>
                <Avatar className="relative bg-secondary cursor-pointer hover:opacity-80 transition flex items-center justify-center">
                  <p className="absolute text-lg">{getInitials(profiles.current)}</p>
                </Avatar>
                <span className="relative flex h-3 w-3">
                  {updating && <span className="animate-ping absolute right-0 bottom-3 inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />}
                  <span className={`relative inline-flex rounded-full right-0 bottom-3 h-3 w-3 ${updating ? 'bg-sky-400' : updatingError ? 'bg-red-500' : 'bg-green-500'}`}/>
                </span>
              </div>
            </DialogTrigger>
            <DialogContent ref={ref} onKeyDown={key => key.key == 'Escape' && setProfileDialog(false)} className="w-fit items-center focus:outline-none outline-none border-none bg-primary-foreground" aria-describedby={undefined}>
              <DialogTitle className="text-center text-muted-foreground">Select profile</DialogTitle>
              <SelectProfile
                changeProfile={changeProfile}
                data={profiles}
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isRemoving={isRemoving}
                setIsRemoving={setIsRemoving}
                setUpdateRender={setUpdateRender}

              />
            </DialogContent>
          </Dialog>
          
        
          <div className="flex flex-col justify-center gap-6">
            <Button variant='ghost' onClick={() => navigate(`/dashboard/home/${playlistName}`)} className={`h-fit gap-2 ${location.pathname.includes('home') ? 'text-primary' : 'text-muted-foreground opacity-50' }`}>
              <PiHouseFill className="size-6" />
            </Button>
            <Button variant='ghost' onClick={() => navigate(`/dashboard/explore`)} className={`h-fit gap-2 ${location.pathname.includes('explore') ? 'text-primary' : 'text-muted-foreground opacity-50' }`}>
              <PiMonitorFill className="size-6" />
            </Button>
            <Button variant='ghost' onClick={() => navigate(`/dashboard/live`)} className={`h-fit gap-2 ${location.pathname.includes('live') ? 'text-primary' : 'text-muted-foreground opacity-50' }`}>
              <PiBroadcastFill className='size-6' />
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' className={`h-fit gap-2 text-muted-foreground opacity-50`}>
                <PiGearSixFill className='size-6' />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-1/2 max-w-[700px] items-center p-8 border-none bg-primary-foreground" aria-describedby={undefined}>
              <DialogTitle className="hidden">Settings</DialogTitle>
              {playlistName && <SettingsPage currentPlaylist={playlistName} setUpdatingMenu={setUpdating} setUpdatingError={setUpdatingError} />}
            </DialogContent>
          </Dialog>

        </Fade>
      </div>
    </div>
  )
}