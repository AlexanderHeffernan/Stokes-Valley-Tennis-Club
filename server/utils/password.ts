import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const COST = 32768
const BLOCK_SIZE = 8
const PARALLELIZATION = 1
const MAX_MEMORY = 64 * 1024 * 1024

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEMORY
  })

  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export function verifyPassword(password: string, encoded: string): boolean {
  try {
    const [algorithm, cost, blockSize, parallelization, salt, expected] = encoded.split('$')
    if (algorithm !== 'scrypt' || !cost || !blockSize || !parallelization || !salt || !expected) return false

    const actual = scryptSync(password, Buffer.from(salt, 'base64'), KEY_LENGTH, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
      maxmem: MAX_MEMORY
    })
    const expectedBuffer = Buffer.from(expected, 'base64')
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer)
  } catch {
    return false
  }
}
