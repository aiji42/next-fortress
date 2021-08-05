import { Fort, Operator } from './types'
import { GetServerSidePropsContext } from 'next'
import getConfig from 'next/config'

export class Inspector {
  operators: Operator[]
  forts: Fort[]

  constructor() {
    this.operators = []
    this.forts = getConfig().serverRuntimeConfig.forts
  }

  add(op: Operator): this {
    this.operators.push(op)
    return this
  }

  async exec(ctx: GetServerSidePropsContext): Promise<boolean> {
    const fort = this.forts[Number(<string>ctx.query.__key)]
    const results = await Promise.all(this.operators.map((op) => op(fort, ctx)))
    return results.some(Boolean)
  }
}
