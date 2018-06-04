/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
import 'babel-polyfill'
import * as awsServerlessExpress from 'aws-serverless-express'
import App from './app'

export const handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const JayaUser = new App()
  const server = awsServerlessExpress.createServer(JayaUser.express)
  return awsServerlessExpress.proxy(server, event, context)
}
