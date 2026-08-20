import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const contentTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
}

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') || ''
  if (!/^[0-9a-f-]+\.(jpg|png|webp)$/.test(name)) throw createError({ statusCode: 404 })

  try {
    const data = await readFile(resolve(process.env.UPLOAD_DIRECTORY || 'data/uploads', name))
    const extension = name.split('.').pop() || ''
    setHeader(event, 'Content-Type', contentTypes[extension] || 'application/octet-stream')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return data
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }
})
