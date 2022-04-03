import {
    Telegraf
} from 'telegraf'
import {
    Telegram
} from "./controllers/telegramController.js"
import {
    Message
} from "./models/message.js"
import {
    COMMANDS
} from './config/commands.js';

export const bot = new Telegraf('5194986661:AAEtHVGpRuFhiVOCCFsqpxj44BWdDqucBGs')
const PageId = 'dd67b71cfc8b4bcf97ca86fe013078c5'
bot.telegram.setMyCommands(COMMANDS)

// TODO Поиск заметок при вводе слова в чат

bot.help((ctx) => {
    TelegramToDb.help(ctx)
})

bot.command('list', ctx => {
    Telegram.showClosedList(ctx, PageId)
})

bot.on('message', async ctx => {
    let message = new Message()
    await message.init(ctx)
    const telegram = new Telegram(PageId, ctx, message)

    const cliText = message.cli.text

    if (message.bot) {
        switch (cliText) {
            case '-':
                telegram.remove()
                break
            case '.':
                telegram.showPage()
                break
            default:
                telegram.add()
        }
    } else {
        telegram.createNotes()
    }
})

bot.launch().then(() => console.log('———   effectivnaya telegram bot launched   ———'))


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))