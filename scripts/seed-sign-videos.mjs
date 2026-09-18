// Uploads the sample sign videos (vids/hellosign.mp4, vids/world.mp4) to the
// local sign-videos storage bucket and inserts their matching sign_videos
// rows, against the signs seeded by supabase/seed.sql (fixed UUIDs
// bbbbbbbb-1111-... / cccccccc-1111-...).
//
// Local dev only -- run via `npm run db:reset:seeded`. Reads the local
// stack's API URL/service role key from `supabase status -o json` rather
// than hardcoding them, so it stays correct if the local stack is ever
// reconfigured. Uses the service role key (not anon) to bypass RLS, since
// this script isn't running as an authenticated superadmin user.

import { execFileSync, execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import ffprobeStatic from 'ffprobe-static'

const BUCKET = 'sign-videos'

const VIDEOS = [
  {
    localPath: 'vids/hellosign.mp4',
    storagePath: 'hello/standard.mp4',
    signId: 'bbbbbbbb-1111-1111-1111-111111111111',
  },
  {
    localPath: 'vids/world.mp4',
    storagePath: 'world/standard.mp4',
    signId: 'cccccccc-1111-1111-1111-111111111111',
  },
]

function getLocalStackConfig() {
  // execSync (not execFileSync) so this resolves npx.cmd correctly on
  // Windows; the command is a fixed literal, not user input, so there's no
  // injection risk from going through a shell here.
  const raw = execSync('npx supabase status -o json', { encoding: 'utf8' })
  const status = JSON.parse(raw)
  return { url: status.API_URL, serviceRoleKey: status.SERVICE_ROLE_KEY }
}

function probeVideo(localPath) {
  const raw = execFileSync(ffprobeStatic.path, [
    '-v',
    'error',
    '-show_entries',
    'format=duration,size:stream=width,height',
    '-of',
    'json',
    localPath,
  ])
  const probe = JSON.parse(raw.toString())
  const stream = probe.streams[0]
  return {
    durationMs: Math.round(Number.parseFloat(probe.format.duration) * 1000),
    width: stream.width,
    height: stream.height,
    fileSize: Number.parseInt(probe.format.size, 10),
  }
}

async function main() {
  const { url, serviceRoleKey } = getLocalStackConfig()
  const supabase = createClient(url, serviceRoleKey)

  for (const video of VIDEOS) {
    const metadata = probeVideo(video.localPath)
    const fileBuffer = readFileSync(video.localPath)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(video.storagePath, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      })
    if (uploadError) {
      throw new Error(`Failed to upload ${video.localPath}: ${uploadError.message}`)
    }

    const { error: insertError } = await supabase
      .from('sign_videos')
      .upsert(
        {
          sign_id: video.signId,
          storage_path: video.storagePath,
          format: 'mp4',
          duration_ms: metadata.durationMs,
          width: metadata.width,
          height: metadata.height,
          file_size: metadata.fileSize,
          is_primary: true,
        },
        { onConflict: 'sign_id,storage_path' },
      )
    if (insertError) {
      throw new Error(`Failed to insert sign_videos row for ${video.storagePath}: ${insertError.message}`)
    }

    console.log(`Seeded ${video.storagePath} (${metadata.width}x${metadata.height}, ${metadata.durationMs}ms, ${metadata.fileSize} bytes)`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
