import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { requireCsrf, requireSession } from '../../utils/auth'
import { recordAudit } from '../../utils/audit'

const MAX_FILE_SIZE = 8 * 1024 * 1024

function detectImage(data: Buffer): { extension: string, mimeType: string } | null {
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { extension: 'jpg', mimeType: 'image/jpeg' }
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { extension: 'png', mimeType: 'image/png' }
  if (data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') {
    return { extension: 'webp', mimeType: 'image/webp' }
  }
  return null
}

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'image' && part.filename)
  if (!file || !file.data.length) throw createError({ statusCode: 400, statusMessage: 'Select an image to upload' })
  if (file.data.length > MAX_FILE_SIZE) throw createError({ statusCode: 413, statusMessage: 'Image must be smaller than 8 MB' })

  const image = detectImage(file.data)
  if (!image) throw createError({ statusCode: 415, statusMessage: 'Only JPEG, PNG and WebP images are supported' })

  const filename = `${randomUUID()}.${image.extension}`
  const uploadDirectory = resolve(process.env.UPLOAD_DIRECTORY || 'data/uploads')
  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(resolve(uploadDirectory, filename), file.data, { flag: 'wx' })
  const url = `/uploads/${filename}`

  recordAudit(event, session.user, 'image.uploaded', 'upload', filename, {
    originalName: file.filename,
    mimeType: image.mimeType,
    size: file.data.length
  })
  return { url }
})
