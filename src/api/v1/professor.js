import express from 'express'
import * as GraphQL from '../../utils/graphql'
import * as JWT from '../../utils/jwt'
import * as Password from '../../utils/password'
import * as Http from '../../utils/http'
import * as Mail from '../../utils/mail'

const router = express.Router()

router.post('/signup', async (req, res, next) => {
  // GET DATA FROM THE POST REQUEST
  const {
    email,
    password,
    firstName,
    lastName
  } = req.body

  let professorInfo

  try {
    // CHECK IF ALL ARGS ARE HERE
    Http.checkArgs(email, password, firstName, lastName)
    const encryptedPassword = await Password.encryptPassword(password)

    professorInfo = await GraphQL.createProfessor({
      email,
      password: encryptedPassword,
      firstName,
      lastName
    })
  } catch (e) {
    return next(e)
  }

  try {
    await Mail.send({
      to: email,
      subject: '[Inscription] Compte professeur Jaya',
      template: 'professor_sign_up',
      context: {
        firstName,
        lastName
      }
    })
  } catch (e) {
    console.error('Cannot send mail')
    console.error(e)
  }

  // FORMAT DATA
  const data = {
    ...professorInfo,
    type: 'PROFESSOR',
    token: await JWT.generateToken({ id: professorInfo.id, email, type: 'PROFESSOR' }) // GET AUTHORIZATION TOKEN
  }

  // SEND RESPONSE
  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, data, null)).status(200)
})

router.post('/signin', async (req, res, next) => {
  const {
    email,
    password
  } = req.body

  let professorInfo

  try {
    // CHECK IF ALL ARGS ARE HERE
    Http.checkArgs(email, password)
    professorInfo = await GraphQL.getProfessorInfo(email)
    if (professorInfo === null) {
      return next(new Http.HttpError('USER_DOES_NOT_EXISTS', null, 404))
    }

    // Password checking
    const isOk = await Password.checkPassword(password, professorInfo.credentials.password)
    delete professorInfo.credentials.password
    if (!isOk) {
      return next(new Http.HttpError('WRONG_PASSWORD', {}, 403))
    }
  } catch (e) {
    return next(e)
  }

  // FORMAT DATA
  const data = {
    ...professorInfo,
    type: 'PROFESSOR',
    token: await JWT.generateToken({ id: professorInfo.id, email, type: 'PROFESSOR' }) // GET AUTHORIZATION TOKEN
  }

  // SEND RESPONSE
  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, data, null)).status(200)
})

router.post('/validate', Http.requireAuthenticatedUser(), async (req, res, next) => {
  if (req.user.type !== 'ADMIN') {
    return next(new Http.HttpError('FORBIDDEN', {}, 403))
  }

  const { id } = req.body

  try {
    Http.checkArgs(id)
    const { credentials } = await GraphQL.validateUser({ userType: 'PROFESSOR', userId: id })
    if (credentials.isVerified) {
      try {
        await Mail.send({
          to: credentials.email,
          subject: '[Validation] Compte professeur validé sur Jaya Miage',
          template: 'professor_validated'
        })
      } catch (e) {
        console.error('Cannot send mail')
        console.error(e)
      }

      return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, {}, null)).status(200)
    } else {
      next(new Http.HttpError('SERVER_ERROR', {}, 500))
    }
  } catch (e) {
    next(e)
  }
})

router.post('/password/reset', (req, res) => {
  res.send('Ask for password reset prof')
})

router.post('/password/modify/:tokenReset', (req, res) => {
  res.send(`Modify professor password ${req.params.adminId}`)
})

export default router
