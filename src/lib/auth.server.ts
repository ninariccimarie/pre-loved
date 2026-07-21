import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'

const SESSION_COOKIE = 'preloved_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

const getSessionSecret = () => {
  return process.env.SESSION_SECRET ?? 'dev-only-change-me-in-production'
}

const getAdminPassword = () => {
  return process.env.ADMIN_PASSWORD ?? 'admin123'
}

const signToken = (payload: string) => {
  const signature = createHash('sha256')
    .update(`${payload}.${getSessionSecret()}`)
    .digest('hex')
  return `${payload}.${signature}`
}

const verifyToken = (token: string) => {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false

  const payload = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)
  const expected = createHash('sha256')
    .update(`${payload}.${getSessionSecret()}`)
    .digest('hex')

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export const verifyAdminPassword = (password: string) => {
  const expected = getAdminPassword()
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export const issueAdminSession = () => {
  const payload = randomBytes(24).toString('hex')
  const token = signToken(payload)
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export const clearAdminSession = () => {
  deleteCookie(SESSION_COOKIE, { path: '/' })
}

export const isAdminAuthenticated = () => {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return false
  return verifyToken(token)
}
