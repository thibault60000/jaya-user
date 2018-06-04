import 'babel-polyfill'
import '../setup.local'
import App from './app'

const JayaUser = new App()

JayaUser.express.listen(4001, () => {
  console.log('Jaya User Service -> Listen to port 4001 :)')
})
