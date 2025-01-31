import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/MediaInfoDialog"
import electronApi from "@/config/electronApi"
import { useEffect, useState } from "react"
import { SiVlcmediaplayer } from "react-icons/si"
import { useToast } from "@/hooks/use-toast"
import { QueryFilters, useQuery, useQueryClient } from "@tanstack/react-query"
import { VlcState } from "electron/core/services/vlc/getVLCState"

interface VlcDialogProps {
  open: boolean
  closeDialog: () => void
  updateUserStatus: (state: VlcState) => void
}

export function VlcDialog({ open, closeDialog, updateUserStatus }: VlcDialogProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)

  const { data } = useQuery({
    queryKey: [`vlcState`],
    queryFn: async () => await electronApi.getVLCState(),
    refetchInterval: 1000,
    retry: false,
    refetchIntervalInBackground: true,
    enabled: open
  })

  useEffect(() => {
    if (data && data.length > 0) {
      setIsRunning(true)
      updateUserStatus(data)
    }
  }, [data])

  useEffect(() => {
    window.ipcRenderer.on('vlc-status', (_event, args) => {
      if (args.running) return
      closeDialog()
      if (args.error) {
        toast({
          variant: "destructive",
          duration: 10000,
          title: 'Unable to connect to the server',
          description: 'Please try again later. If the issue persists, consider contacting your playlist support'
        })
      }
    });

    return () => {
      electronApi.removeAllListeners('vlc-status')
      queryClient.removeQueries({ queryKey: ['vlcState'], exact: true } as QueryFilters)
    }
  }, [])

  return (
    <Dialog key='vlc-dialog' open={open}>
      <DialogTrigger asChild>
      </DialogTrigger>
      <DialogContent className="w-fit items-center justify-center bg-transparent border-none shadow-none z-50" aria-describedby={undefined}>
        <DialogTitle className="hidden" />
        <div className="flex flex-col justify-center items-center gap-4">
          <SiVlcmediaplayer className={`size-16 transition-colors ${isRunning ? 'text-orange-400' : 'animate-pulse'}`} />
        </div>
      </DialogContent>
    </Dialog>
  )
}