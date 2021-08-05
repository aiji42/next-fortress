import { InspectByIp, Operator } from './types'
import ipCidr from 'ip-cidr'

export const inspectIp = (
  ips: InspectByIp['ips'],
  target: string | string[] | undefined
): boolean => {
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

export const ip: Operator = async (fort, ctx) => {
  if (fort.inspectBy !== 'ip' || !ctx.req.headers['x-forwarded-for'])
    return false
  return inspectIp(fort.ips, ctx.req.headers['x-forwarded-for'])
}
