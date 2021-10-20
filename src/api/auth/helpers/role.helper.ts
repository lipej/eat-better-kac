import { HttpError, HttpStatus } from '@marblejs/http'

export const canHandle = (req) => {
  const isAdmin = req.user.role === 'ADMIN'

  if (!isAdmin) throw new HttpError('You cant perform this action', HttpStatus.UNAUTHORIZED)

  return req
}
