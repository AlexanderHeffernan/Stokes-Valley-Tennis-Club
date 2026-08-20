import { isIP } from 'node:net'
import type { H3Event } from 'h3'

function normalizeIp(value: string | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate || !isIP(candidate)) return null
  return candidate.startsWith('::ffff:') ? candidate.slice(7) : candidate
}

export function getClientIp(event: H3Event): string | null {
  // Production traffic reaches the loopback-bound app exclusively through Cloudflare Tunnel.
  // Do not trust the more easily forged X-Forwarded-For chain.
  if (process.env.NODE_ENV === 'production') {
    const cloudflareIp = normalizeIp(getHeader(event, 'cf-connecting-ip'))
    if (cloudflareIp) return cloudflareIp
  }

  return normalizeIp(event.node.req.socket.remoteAddress)
}
