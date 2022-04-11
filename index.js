import {
    Telegraf,
    session,
} from 'telegraf'
import {
    COMMANDS
} from './config/commands.js';
import commandRouter from './routes/commandRouter.js'
import messageRouter from './routes/messageRouter.js'

export const bot = new Telegraf('5194986661:AAEtHVGpRuFhiVOCCFsqpxj44BWdDqucBGs')
bot.use(session())
bot.telegram.setMyCommands(COMMANDS)

//TODO Переписать передачу notion и ParentId. Может быть добавить в Message?

bot.help((ctx) => {})
bot.command('list', async ctx => {
    try {
        if (!ctx.session) throw new Error('Страница не зарегестрирована.')
        commandRouter.list(ctx)
    } catch (e) {
        ctx.reply(e.message)
    }
})
bot.command('init', async ctx => {
    try {
        commandRouter.init(ctx)
    } catch (e) {
        ctx.reply(e.message)
    }
})
bot.on('voice', async ctx => {
    try {
        if (!ctx.session) throw new Error('Страница не зарегестрирована.')
        messageRouter.router(ctx)
    } catch (e) {
        ctx.reply(e.message)
    }
})
bot.on('message', async ctx => {
    if (!ctx.message.text || ctx.message.text.match(/^\/init/im)) return
    try {
        if (!ctx.session) throw new Error('Страница не зарегестрирована.')
        messageRouter.router(ctx)
    } catch (e) {
        // ctx.reply(e.message)
    }
})

bot.launch().then(() => console.log('———   effectivnaya telegram bot launched   ———'))


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))