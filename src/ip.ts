import { Fallback, Middleware } from './types'
import { Netmask } from 'netmask'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'

type IPs = string | Array<string>

export const makeIPInspector = (
  allowedIPs: IPs,
  fallback: Fallback
): Middleware => {
  return (request, event) => {
    const ok = inspectIp(allowedIPs, request.ip)
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const inspectIp = (ips: IPs, target: NextRequest['ip']): boolean => {
  if (!target) return false
  return (Array.isArray(ips) ? ips : [ips]).some((ip) => {
    const block = new Netmask(ip)
    return block.contains(target)
  })
}
