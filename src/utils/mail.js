import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'

function _getTransporter () {
  const transporter = nodemailer.createTransport({
    port: parseInt(process.env.MAIL_PORT, 10),
    host: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    },
    secure: true,
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    },
    logger: true
  })

  transporter.use('compile', hbs({
    viewEngine: {
      extname: '.handlebars'
    },
    viewPath: path.resolve(__dirname, '../templates/'),
    extName: '.handlebars'
  }))

  return transporter
}

export function send ({ to, subject, template, context }) {
  const transporter = _getTransporter()
  const message = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    template,
    context
  }

  return new Promise((resolve, reject) => {
    transporter.sendMail(message, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}
