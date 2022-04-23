import {
    Telegraf,
    session,
} from 'telegraf'
import {
    COMMANDS
} from './config/commands.js'
import 'dotenv/config'
import commandRouter from './routes/commandRouter.js'
import messageRouter from './routes/messageRouter.js'

export const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.telegram.setMyCommands(COMMANDS)

//TODO Переписать передачу notion и ParentId. Может быть добавить в Message?

bot.help((ctx) => {})
bot.command('list', async ctx => {
    try {
        if (!ctx.session) throw new Error('Страница не зарегестрирована. Инициализируйте, отправив сообщение в формате "/init <NotionTokken> <PageId>"')
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
        if (!ctx.session) throw new Error('Страница не зарегестрирована. Инициализируйте, отправив сообщение в формате "/init <NotionTokken> <PageId>"')
        messageRouter.router(ctx)
    } catch (e) {
        ctx.reply(e.message)
    }
})
bot.on('message', async ctx => {
    if (!ctx.message.text || ctx.message.text.match(/^\/init/im)) return
    try {
        if (!ctx.session) throw new Error('Страница не зарегестрирована. Инициализируйте, отправив сообщение в формате "`/init <NotionTokken> <PageId>`"')
        messageRouter.router(ctx)
    } catch (e) {
        // const apiTelegram = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`
        const apiTelegram = `http://localhost:3000/notion`
        ctx.reply(`https://api.notion.com/v1/oauth/authorize?owner=user&client_id=1ea8493d-3ff0-4a50-9278-35c5bba44c83&redirect_uri=${apiTelegram}&response_type=code`)
        ctx.replyWithMarkdown(e.message)
    }
})

bot.launch().then(() => console.log('———   effectivnaya telegram bot launched   ———'))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
