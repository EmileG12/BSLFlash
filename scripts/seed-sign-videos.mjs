// Uploads the sample sign videos under vids/ (Greetings, Colours, Time) to
// the local sign-videos storage bucket and inserts their matching
// sign_videos rows, against the signs seeded by supabase/seed.sql. Each
// entry's signId must match a sign row seed.sql already inserted.
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
  {
    localPath: 'vids/colours/colour.mp4',
    storagePath: 'colour/standard.mp4',
    signId: '7ff0b84c-0e37-4686-8bc7-d37276aada13',
  },
  {
    localPath: 'vids/colours/black.mp4',
    storagePath: 'black/standard.mp4',
    signId: 'b2da2501-f611-4e2f-b0bd-d3fa16dadf0c',
  },
  {
    localPath: 'vids/colours/blue.mp4',
    storagePath: 'blue/standard.mp4',
    signId: 'd99478b8-4ed6-491b-80e2-32a4811c36e1',
  },
  {
    localPath: 'vids/colours/brown.mp4',
    storagePath: 'brown/standard.mp4',
    signId: '4bc7eedb-a642-49b0-9929-554ca3271edb',
  },
  {
    localPath: 'vids/colours/green.mp4',
    storagePath: 'green/standard.mp4',
    signId: 'ec3febcf-2d9c-43bb-b780-610aa78ecc1e',
  },
  {
    localPath: 'vids/colours/grey.mp4',
    storagePath: 'grey/standard.mp4',
    signId: 'c75b4e3d-f7d5-4837-b890-f5c7e902077b',
  },
  {
    localPath: 'vids/colours/white.mp4',
    storagePath: 'white/standard.mp4',
    signId: '4df58e8c-d3be-4ac8-8012-484f99970ed3',
  },
  {
    localPath: 'vids/time/monday.mp4',
    storagePath: 'monday/standard.mp4',
    signId: '42cb71b7-50c6-4708-b6fe-a68e78407672',
  },
  {
    localPath: 'vids/time/Tuesday.mp4',
    storagePath: 'tuesday/standard.mp4',
    signId: '87e58fdf-cdda-443f-83a0-d90c74399ceb',
  },
  {
    localPath: 'vids/time/Wednesday.mp4',
    storagePath: 'wednesday/standard.mp4',
    signId: 'e5cbd071-8fec-4902-8e62-5ef179d0fbcc',
  },
  {
    localPath: 'vids/time/Thursday.mp4',
    storagePath: 'thursday/standard.mp4',
    signId: '1ebecb8e-0dae-4b29-a39f-a1cc52fb423e',
  },
  {
    localPath: 'vids/time/Friday.mp4',
    storagePath: 'friday/standard.mp4',
    signId: '3c94953c-96d4-4a9a-8cd5-2a22185cfc3c',
  },
  {
    localPath: 'vids/time/Saturday.mp4',
    storagePath: 'saturday/standard.mp4',
    signId: 'bd33fcdc-2b55-469d-9db1-31e53e6ceb8b',
  },
  {
    localPath: 'vids/time/Sunday.mp4',
    storagePath: 'sunday/standard.mp4',
    signId: '3b8ad2e6-25e8-4001-8828-41981f4c5598',
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
