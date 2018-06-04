import express from 'express'
import * as Http from '../../utils/http'
import * as GraphQL from '../../utils/graphql'
import { encryptPassword } from '../../utils/password'

const router = express.Router()

router.post('/password/set', Http.requireAuthenticatedUser(), async (req, res, next) => {
  if (req.user.type !== 'ADMIN') {
    return next(new Http.HttpError('UNAUTHORIZED', null, 403))
  }

  const {
    credentialsId,
    password
  } = req.body

  const encryptedPassword = await encryptPassword(password)

  try {
    await GraphQL.adminSetPassword({ credentialsId, password: encryptedPassword, token: req.user.token })
  } catch (e) {
    return next(new Http.HttpError('GRAPHQL ERROR', e.message, 500))
  }

  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, {})).status(200)
})

export default router
