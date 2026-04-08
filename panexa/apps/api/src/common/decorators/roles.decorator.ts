import { SetMetadata } from '@nestjs/common'
import type { Role } from '@panexa/shared-types'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export const CurrentUser = () => {
  // Re-exported from @nestjs/common for convenience
  const { createParamDecorator, ExecutionContext } = require('@nestjs/common')
  return createParamDecorator((_: unknown, ctx: typeof ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  })()
}
