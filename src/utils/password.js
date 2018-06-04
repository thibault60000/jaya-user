import * as bcrypt from 'bcryptjs'

const SALT_ROUND = 10

export async function encryptPassword (password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUND, (err, hash) => (err ? reject(err) : resolve(hash)))
  })
}

export function checkPassword (password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, match) => (err ? reject(err) : resolve(match)))
  })
}
