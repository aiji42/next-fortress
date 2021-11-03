import { Fallback, Middleware } from './types'
import ipCidr from 'ip-cidr'
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
  return (Array.isArray(ips) ? ips : [ips]).some((ip) => {
    if (!ipCidr.isValidAddress(ip)) return false
    const ipAddress = ipCidr.createAddress(ip)
    return new ipCidr(
      `${ipAddress.addressMinusSuffix}${ipAddress.subnet}`
    ).contains(
      Array.isArray(target) ? target[0] : target ? target.split(',')[0] : target
    )
  })
}
