import express from 'express'
import * as GraphQL from '../../utils/graphql'
import * as JWT from '../../utils/jwt'
import * as Password from '../../utils/password'
import * as Http from '../../utils/http'

const router = express.Router()

// TODO: RESTRICT THIS ROUTE FOR ADMINS
router.post('/signup', async (req, res, next) => {
  const {
    email,
    password
  } = req.body

  let adminInfo

  try {
    Http.checkArgs(email, password)

    // CRYP PASSWORD
    const encryptedPassword = await Password.encryptPassword(password)

    adminInfo = await GraphQL.createAdmin({
      email,
      password: encryptedPassword
    })
  } catch (e) {
    return next(e)
  }

  // FORMAT DATA
  const data = {
    ...adminInfo,
    type: 'ADMIN',
    token: await JWT.generateToken({ id: adminInfo.id, email, type: 'ADMIN' }) // GET AUTHORIZATION TOKEN
  }

  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, data, null)).status(200)
})

router.post('/signin', async (req, res, next) => {
  // GET DATA FROM THE POST REQUEST
  const {
    email,
    password
  } = req.body

  let adminInfo

  try {
    // CHECK IF ALL ARGS ARE HERE
    Http.checkArgs(email, password)
    adminInfo = await GraphQL.getAdminInfo(email)
    if (adminInfo == null) {
      return next(new Http.HttpError('USER_DOES_NOT_EXISTS', null, 404))
    }

    // Password checking
    const isOk = await Password.checkPassword(password, adminInfo.credentials.password)
    delete adminInfo.credentials.password
    if (!isOk) {
      return next(new Http.HttpError('WRONG_PASSWORD', {}, 403))
    }
  } catch (e) {
    return next(e)
  }

  // FORMAT DATA
  const data = {
    ...adminInfo,
    type: 'ADMIN',
    token: await JWT.generateToken({ id: adminInfo.id, email, type: 'ADMIN' }) // GET AUTHORIZATION TOKEN
  }

  // SEND RESPONSE
  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, data, null)).status(200)
})

router.post('/password/modify', (req, res) => {
  res.send('Modify self password')
})

router.post('/password/modify/:adminId', (req, res) => {
  res.send(`Modify admin password ${req.params.adminId}`)
})

export default router
