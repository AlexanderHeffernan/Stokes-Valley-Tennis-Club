import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { requireCsrf, requireSession } from '../../utils/auth'
import { recordAudit } from '../../utils/audit'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const MAX_INPUT_PIXELS = 40_000_000
const MAX_DIMENSION = 12_000
const MAX_OUTPUT_DIMENSION = 4_000

export default defineEventHandler(async (event) => {
  const session = requireSession(event)
  requireCsrf(event, session.csrfToken)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'image' && part.filename)
  if (!file || !file.data.length) throw createError({ statusCode: 400, statusMessage: 'Select an image to upload' })
  if (file.data.length > MAX_FILE_SIZE) throw createError({ statusCode: 413, statusMessage: 'Image must be smaller than 8 MB' })

  let processed: Buffer
  let width: number
  let height: number
  let inputFormat: string
  try {
    const image = sharp(file.data, {
      failOn: 'warning',
      limitInputPixels: MAX_INPUT_PIXELS,
      sequentialRead: true
    })
    const metadata = await image.metadata()
    width = metadata.width || 0
    height = metadata.height || 0
    inputFormat = metadata.format || ''
    if (!['jpeg', 'png', 'webp'].includes(inputFormat)) throw new Error('Unsupported format')
    if (!width || !height || width > MAX_DIMENSION || height > MAX_DIMENSION) throw new Error('Invalid dimensions')
    if ((metadata.pages || 1) !== 1) throw new Error('Animated images are not supported')

    // Re-encoding strips metadata and untrusted payloads while bounding stored dimensions.
    processed = await image
      .rotate()
      .resize(MAX_OUTPUT_DIMENSION, MAX_OUTPUT_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer()
  } catch {
    throw createError({
      statusCode: 415,
      statusMessage: 'Upload a valid JPEG, PNG or WebP image no larger than 40 megapixels'
    })
  }

  const filename = `${randomUUID()}.webp`
  const uploadDirectory = resolve(process.env.UPLOAD_DIRECTORY || 'data/uploads')
  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(resolve(uploadDirectory, filename), processed, { flag: 'wx', mode: 0o600 })
  const url = `/uploads/${filename}`

  recordAudit(event, session.user, 'image.uploaded', 'upload', filename, {
    originalName: file.filename,
    inputFormat,
    inputSize: file.data.length,
    outputFormat: 'webp',
    outputSize: processed.length,
    width,
    height
  })
  return { url }
})
