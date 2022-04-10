import {
    Telegraf,
    // session,
    Telegram
} from 'telegraf'
import fetch from 'node-fetch'
import {
    COMMANDS
} from './config/commands.js';
import router from './routes/router.js'

export const bot = new Telegraf('5194986661:AAEtHVGpRuFhiVOCCFsqpxj44BWdDqucBGs')
// bot.use(session())
const PageId = 'dd67b71cfc8b4bcf97ca86fe013078c5'
bot.telegram.setMyCommands(COMMANDS)

bot.command('init', async ctx => {
    const message = ctx.message.text
    const title = message.split(' ')[1]
    const notionTokken = message.split(' ')[2]
    const PageId = message.split(' ')[3]
    // TODO Разобраться с сессиями.
    if (!ctx.session && title && notionTokken && PageId) {
        ctx.session = {
            title: title,
            notionTokken: notionTokken,
            PageId: PageId
        }
        ctx.reply(title + notionTokken + PageId)
    } else await ctx.reply(`Страница уже инициализирована.`)
})

bot.on('channel_post', async ctx => {
    await router(ctx)
})

// try {
//     bot.help((ctx) => {})

//     bot.command('list', async ctx => {
//         router.command(PageId, ctx)
//     })

//     bot.on('voice', async ctx => {
//         router.voice(PageId, ctx)
//     })

//     bot.on('message', async ctx => {
//         router.message(PageId, ctx)
//     })
// } catch (e) {
//     console.log(e.message)
// }

bot.launch().then(() => console.log('———   effectivnaya telegram bot launched   ———'))


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))