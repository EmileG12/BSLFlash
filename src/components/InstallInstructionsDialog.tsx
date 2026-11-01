import { Menu, Share } from 'lucide-react'
import type { InstallPlatform } from '../hooks/useInstallPrompt'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import './InstallInstructionsDialog.css'

interface InstallInstructionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: InstallPlatform
}

/** Shared "how to install" instructions, shown from both the dismissible
 * InstallBanner and the persistent MobileNavSheet row when there's no native
 * one-tap prompt available (iOS Safari, Firefox Android, etc). */
export function InstallInstructionsDialog({ open, onOpenChange, platform }: InstallInstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install BSL Flash</DialogTitle>
          <DialogDescription className="install-instructions-description">
            {platform === 'ios' ? (
              <>
                <Share size={16} className="install-instructions-icon" aria-hidden="true" />
                Tap the Share icon in Safari&apos;s toolbar, then choose Add to Home Screen.
              </>
            ) : (
              <>
                <Menu size={16} className="install-instructions-icon" aria-hidden="true" />
                Open your browser menu and choose Add to Home Screen.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
