import express from 'express'
import { Nuxt, Builder } from 'nuxt'
import mongoose from 'mongoose'
import { urlencoded, json } from 'body-parser'

import api from './api'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.dev.env' })
} else {
  require('dotenv').config({ path: '.prod.env' })
}

const app = express()
const host = process.env.HOST
const port = process.env.PORT

app.use(urlencoded({ limit: '10mb', extended: true }))
app.use(json())
app.set('port', port)

// Import API Routes
app.use('/api', api)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// setup the database connection
mongoose.Promise = global.Promise
mongoose.connect(process.env.DATABASE, { useMongoClient: true })
mongoose.connection.on('error', (err) => {
  console.error(err.message)
})

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
