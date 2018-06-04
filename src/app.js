import express from 'express'
import bodyParser from 'body-parser'
import logger from 'morgan'
import cors from 'cors'
import apiV1 from './api/v1'
import { handleHttpError } from './utils/http'

export default class App {
  express;

  constructor () {
    this._setUpApp()
  }

  _setUpApp = () => {
    this.express = express()
    this.express.use(logger('tiny'))
    this.express.use(bodyParser.json())
    this.express.use(cors({ origin: true }))
    this.express.use('/api/v1', apiV1)
    this.express.use((err, req, resp, next) => handleHttpError(resp, err)); /* eslint-disable-line */
  }
}
