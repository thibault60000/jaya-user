import { verifyToken, renewToken } from './jwt'

/**
 * Enum for status
 * @readonly
 * @enum {string}
 */
export const STATUS = {
  KO: 'KO',
  OK: 'OK'
}

export function checkArgs (...args) {
  args.forEach((argument) => {
    if (!argument) {
      throw new Error('Missing arguments')
    }
  })
}

/** Representing an API Error */
export class HttpError {
  /**
   * Create an error
   * @param {string} name
   * @param {Object} data
   * @param {number} httpCode
   */
  constructor (name, data = {}, httpCode = 500) {
    this.name = name
    this.data = data
    this.httpCode = httpCode
  }
}

/**
 * HTTP Response by default
 *
 * @param {STATUS} status
 * @param {Object} data
 * @param {string} error
 */
export function formatHttpResponseObject (status, data, error) {
  return {
    status,
    data: data && data !== null ? data : {},
    error: error && error !== null ? error : ''
  }
}

/**
 * Error Handler for Express
 */
export function handleHttpError (response, e) {
  console.error(e); // eslint-disable-line
  if (e instanceof HttpError) {
    return response.status(e.httpCode).send(formatHttpResponseObject(STATUS.KO, e.data, e.name))
  }

  return response.status(500).send(formatHttpResponseObject(
    STATUS.KO, { error: e }, `SERVER ERROR: ${e.name}`)
  )
}

export function requireAuthenticatedUser () {
  return async (req, resp, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      let token = req.headers.authorization.split(' ')[1]
      let data

      try {
        data = await verifyToken(token)
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          token = renewToken(token)
          data = await verifyToken(token)
        }
        return next(new HttpError('CANNOT_AUTHENTICATE_USER', { message: e.message }, 403))
      }
      req.user = data
      req.user.token = token
    } else {
      return next(new HttpError('NOT_AUTHENTICATED', {}, 403))
    }
    return next()
  }
}
