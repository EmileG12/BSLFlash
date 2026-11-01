import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { InstallInstructionsDialog } from './InstallInstructionsDialog'
import './InstallBanner.css'

/** Dismissible mobile-only banner nudging installation of the PWA; pairs with
 * the persistent "Install App" row in MobileNavSheet, which stays visible
 * after this is dismissed. Chromium/Android triggers the native one-tap
 * prompt directly; iOS/other reveal manual instructions via a dialog. */
export function InstallBanner() {
  const { canInstall, canPromptNatively, platform, dismissed, promptInstall, dismiss } =
    useInstallPrompt()
  const [showInstructions, setShowInstructions] = useState(false)

  if (!canInstall || dismissed) return null

  function handleTap() {
    if (canPromptNatively) {
      void promptInstall()
    } else {
      setShowInstructions(true)
    }
  }

  return (
    <>
      <div className="install-banner flex items-center lg:hidden">
        <button type="button" className="install-banner-tap" onClick={handleTap}>
          <span className="install-banner-icon" aria-hidden="true">
            <Download size={18} />
          </span>
          <span className="install-banner-copy">
            <span className="install-banner-title">Install BSL Flash</span>
            <span className="install-banner-subtitle">
              {canPromptNatively
                ? 'Add it to your home screen for one-tap access.'
                : 'Add it to your home screen.'}
            </span>
          </span>
        </button>
        <button type="button" className="install-banner-dismiss" aria-label="Dismiss" onClick={dismiss}>
          <X size={16} />
        </button>
      </div>
      <InstallInstructionsDialog
        open={showInstructions}
        onOpenChange={setShowInstructions}
        platform={platform}
      />
    </>
  )
}
