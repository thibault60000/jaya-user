import jwt from 'jsonwebtoken'

const JWT_EXPIRATION = '7d'
const JWT_ISS = process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? 'JAYA' : 'JAYA_DEV'
const JWT_SUB = 'JAYA_USER'
const JWT_AUD = 'JAYA_APP'

/**
 *
 * @param {UserCredentials} userCredentials
 */
export function generateToken (userCredentials) {
  return new Promise((resolve, reject) => {
    const jwtOptions = {
      expiresIn: JWT_EXPIRATION,
      issuer: JWT_ISS,
      subject: JWT_SUB,
      audience: JWT_AUD
    }

    jwt.sign(
      userCredentials,
      process.env.JWT_SECRET,
      { ...jwtOptions },
      (err, token) => (err ? reject(err) : resolve(token))
    )
  })
}

/**
 * Verify is the token exists & get data
 *
 * @param {string} token Identification Token
 * @returns {Promise<boolean>} Token valid ?
 */
export function verifyToken (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_ISS,
      subject: JWT_SUB,
      audience: JWT_AUD
    }, (err, decoded) => (err ? reject(err) : resolve(decoded)))
  })
}

/**
 * Renew a token /!\ Only use this method for an expired token
 *
 * @returns {Promise<string>} Identification token
 */
export function renewToken (expiredToken) {
  const payload = jwt.decode(expiredToken)
  return generateToken(payload)
}
