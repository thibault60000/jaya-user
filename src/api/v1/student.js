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
    specializationId,
    firstName,
    lastName,
    studentNumber
  } = req.body

  let studentInfo

  try {
    // CHECK IF ALL ARGS ARE HERE
    Http.checkArgs(email, password, specializationId, firstName, lastName, studentNumber)

    // CRYP PASSWORD
    const encryptedPassword = await Password.encryptPassword(password)

    // GRAPHQL REQUEST
    studentInfo = await GraphQL.createStudent({
      email,
      password: encryptedPassword,
      firstName,
      lastName,
      studentNumber,
      specializationId
    })
  } catch (e) {
    return next(e)
  }

  try {
    await Mail.send({
      to: email,
      subject: '[Inscription] Compte étudiant Jaya',
      template: 'student_sign_up',
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
    ...studentInfo,
    type: 'STUDENT',
    token: await JWT.generateToken({ id: studentInfo.id, email, type: 'STUDENT' }) // GET AUTHORIZATION TOKEN
  }

  // SEND RESPONSE
  return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, data, null)).status(200)
})

router.post('/signin', async (req, res, next) => {
  // GET DATA FROM THE POST REQUEST
  const {
    email,
    password
  } = req.body

  let studentInfo

  try {
    // CHECK IF ALL ARGS ARE HERE
    Http.checkArgs(email, password)
    studentInfo = await GraphQL.getStudentInfo(email)
    if (studentInfo == null) {
      return next(new Http.HttpError('USER_DOES_NOT_EXISTS', null, 404))
    }

    // Password checking
    const isOk = await Password.checkPassword(password, studentInfo.credentials.password)
    delete studentInfo.credentials.password
    if (!isOk) {
      return next(new Http.HttpError('WRONG_PASSWORD', {}, 403))
    }
  } catch (e) {
    return next(e)
  }

  // FORMAT DATA
  const data = {
    ...studentInfo,
    type: 'STUDENT',
    token: await JWT.generateToken({ id: studentInfo.id, email, type: 'STUDENT' }) // GET AUTHORIZATION TOKEN
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
    const { credentials } = await GraphQL.validateUser({ userType: 'STUDENT', userId: id })
    if (credentials.isVerified) {
      try {
        await Mail.send({
          to: credentials.email,
          subject: '[Validation] Compte validé sur Jaya Miage',
          template: 'student_validated'
        })
      } catch (e) {
        console.error('Cannot send mail')
        console.error(e)
      }
      return res.send(Http.formatHttpResponseObject(Http.STATUS.OK, {}, null)).status(200)
    } else {
      return next(new Http.HttpError('SERVER_ERROR', {}, 500))
    }
  } catch (e) {
    return next(e)
  }
})

router.post('/password/reset', (req, res) => {
  res.send('Ask for password reset prof')
})

router.put('/password/modify/:tokenReset', (req, res) => {
  res.send(`Modify professor password ${req.params.adminId}`)
})

export default router
