import express from 'express'
import * as Http from '../../utils/http'
import * as GraphQL from '../../utils/graphql'

const router = express.Router()

router.post('/verify', Http.requireAuthenticatedUser(), async (req, res, next) => {
  let data

  try {
    switch (req.user.type) {
      case 'STUDENT':
        data = await GraphQL.getStudentInfo(req.user.email)
        delete data.credentials.password
        break
      case 'PROFESSOR':
        data = await GraphQL.getProfessorInfo(req.user.email)
        delete data.credentials.password
        break
      case 'ADMIN':
        data = await GraphQL.getAdminInfo(req.user.email)
        delete data.credentials.password
        break
      default:
        return next(Http.HttpError('UNKNOW_USER', null, 500))
    }
  } catch (e) {
    return next(e)
  }

  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, {
    type: req.user.type,
    token: req.user.token,
    ...data
  }, null)).status(203)
})

export default router
