import jwt_decode from 'jwt-decode'

const decodeToken = (token: string) => jwt_decode(token)

export const getIdFromToken = (token): number => {
  const decoded: any = decodeToken(token)

  return Number(decoded.id)
}
