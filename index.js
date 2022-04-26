import express from 'express'
import {
    login
} from './services/login.js'
import {
    Telegraf,
    session,
} from 'telegraf'
import {
    COMMANDS
} from './config/commands.js'
import 'dotenv/config'
import router from './routes/router.js'

const app = express()
app.use('/', login)

export const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.telegram.setMyCommands(COMMANDS)

//TODO Переписать передачу notion и ParentId. Может быть добавить в Message?

bot.help(async ctx => router.help(ctx))
bot.command('list', async ctx => {
    router.list(ctx)
})
bot.command('init', async ctx => {
    router.init(ctx)
})
bot.on('voice', async ctx => {
    router.message(ctx)
})
bot.on('message', async ctx => {
    router.message(ctx)
})

bot.launch().then(() => console.log('———   effectivnaya telegram bot launched   ———'))
// app.listen(3000, () => console.log('———   effectivnaya rabota server start   ———'))


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
