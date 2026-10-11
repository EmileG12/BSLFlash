import { supabase } from './supabase'

interface SignVideoMetadata {
  durationMs: number
  width: number
  height: number
}

function readVideoMetadata(file: File): Promise<SignVideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve({
        durationMs: Math.round(video.duration * 1000),
        width: video.videoWidth,
        height: video.videoHeight,
      })
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Could not read the video file.'))
    }
    video.src = URL.createObjectURL(file)
  })
}

function videoFormatFor(file: File): 'mp4' | 'webm' | null {
  if (file.type === 'video/mp4') return 'mp4'
  if (file.type === 'video/webm') return 'webm'
  return null
}

/** Uploads a video file to the sign-videos bucket and inserts its sign_videos row for the given sign. Shared by AdminPage (a word's first variant+video) and the superadmin word editor (additional variants/videos) so the metadata-reading and upload-path logic lives in one place. Throws on an unsupported format or any upload/insert failure. */
export async function uploadSignVideo(signId: string, file: File) {
  const format = videoFormatFor(file)
  if (!format) {
    throw new Error('Video must be an mp4 or webm file.')
  }

  const metadata = await readVideoMetadata(file)
  const storagePath = `${signId}/${crypto.randomUUID()}.${format}`

  const { error: uploadError } = await supabase.storage
    .from('sign-videos')
    .upload(storagePath, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { data, error: insertError } = await supabase
    .from('sign_videos')
    .insert({
      sign_id: signId,
      storage_path: storagePath,
      format,
      duration_ms: metadata.durationMs,
      width: metadata.width,
      height: metadata.height,
      file_size: file.size,
    })
    .select('id, storage_path, format, duration_ms, width, height, file_size')
    .single()
  if (insertError) throw insertError

  return data
}
