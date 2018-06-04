import express from 'express'
import admin from './admin'
import student from './student'
import professor from './professor'
import token from './token'
import credentials from './credentials'

const router = express.Router()

router.use('/admin', admin)
router.use('/token', token)
router.use('/student', student)
router.use('/professor', professor)
router.use('/credentials', credentials)

export default router
