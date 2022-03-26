import express from 'express'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import {
    router
} from './config/routes.js'
import {
    setupHBS
} from './config/hbs.js'
import {
    bot
} from './config/bot.js'


await mongoose.connect('mongodb://localhost/notes_database');

const app = express()
app.use(methodOverride('_method'))
app.use(express.urlencoded({
    extended: true
}))
app.use('/', router)

app.set('view engine', 'hbs')

app.listen(3000, () => {
    console.log('effectivnaya rabota server start')
})

setupHBS(app)