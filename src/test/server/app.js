import { join } from 'path'
import express from 'express'
import expressStaticGzip from 'express-static-gzip'
// import api from './api'

const isProduction = process.env.NODE_ENV === 'production'

const app = express()

if (isProduction) {
  app.use(
    '/',
    expressStaticGzip(join(__dirname, '../../client'), {
      // indexFromEmptyFile: false,
      enableBrotli: true,
    }),
  )
}
else {
  const devConfig = require('../../webpack.development') // eslint-disable-line global-require
  const compiler = require('webpack')(devConfig) // eslint-disable-line global-require
  const middleware = require('webpack-dev-middleware')(compiler) // eslint-disable-line global-require
  const hotMiddleware = require('webpack-hot-middleware')(compiler) // eslint-disable-line global-require

  app.use(middleware).use(hotMiddleware)
}

const port = process.env.CLIENT_PORT != null ? parseInt(process.env.CLIENT_PORT, 10) : 8080

app
//   .use('/api', api)
  .get('*', (req, res) => {
    if (isProduction) {
      res.sendFile(join(__dirname, '../../client/index.html'))
    }
    else {
      req.url = '/' // Let middleware handle the request
      app.handle(req, res)
    }
  })
  .listen(port, '0.0.0.0', err => {
    if (err)
      console.log(err)
    else
      console.log(`Started. Listening on port ${port}.`)
  })
