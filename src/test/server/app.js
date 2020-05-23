/* NodeJS server for testing the components of the package
 */

import express from 'express'

const app = express()

const devConfig = require('../../webpack.development') // eslint-disable-line global-require, import/order
const compiler = require('webpack')(devConfig) // eslint-disable-line global-require
const middleware = require('webpack-dev-middleware')(compiler) // eslint-disable-line global-require
const hotMiddleware = require('webpack-hot-middleware')(compiler) // eslint-disable-line global-require

app.use(middleware).use(hotMiddleware)

const port = process.env.CLIENT_PORT != null ? parseInt(process.env.CLIENT_PORT, 10) : 8080

app
  .get('*', (req, res) => {
    req.url = '/' // Let middleware handle the request
    app.handle(req, res)
  })
  .listen(port, '0.0.0.0', err => {
    if (err)
      console.log(err)
    else
      console.log(`Started. Listening on port ${port}.`)
  })
