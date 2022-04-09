import {
    Telegraf
} from 'telegraf'
import {
    Telegram
} from "./controllers/telegramController.js"
import Message from "./models/message.js"
import {
    COMMANDS
} from './config/commands.js';
import router from './routes/router.js'

export const bot = new Telegraf('5194986661:AAEtHVGpRuFhiVOCCFsqpxj44BWdDqucBGs')
const PageId = 'dd67b71cfc8b4bcf97ca86fe013078c5'
bot.telegram.setMyCommands(COMMANDS)

// TODO Поиск заметок при вводе слова в чат

bot.help((ctx) => {
})

bot.command('list', async ctx => {
    router.message(ctx, PageId)
})

// bot.on('voice', async ctx => {
//     let message = new Message()
//     await message.init(ctx)
//     const telegram = new Telegram(ctx, message)
//     telegram.addFile(ctx, 'voice')
// })

bot.on('voice', async ctx => {
    router.voice(ctx)
})

bot.on('message', async ctx => {
    router.message(ctx)
})

bot.on('message', async ctx => {
    let message = new Message()
    let serviceMessageId
    try {
        await message.init(ctx)
        const telegram = new Telegram(ctx, message)

        const cliText = message.cli.text
        if (message.bot) {
            //Если это сообщение - ответ на сообщение бота
            if (cliText == '+') {
                await ctx.reply('Восстанавливаю заметку...').then(res => serviceMessageId = res.message_id)
                await telegram.restore(ctx)
            } else if (cliText == '-') {
                await ctx.reply('Удаляю заметку...').then(res => serviceMessageId = res.message_id)
                await telegram.remove(ctx)
            } else if (cliText == '.') {
                await ctx.reply('Разворачиваю заметку...').then(res => serviceMessageId = res.message_id)
                await telegram.showPage(ctx)
            } else {
                await ctx.reply('Дополняю заметку...').then(res => serviceMessageId = res.message_id)
                await telegram.add(ctx)
            }
        } else {
            //Сообщение без ответа.
            if (cliText == '+') {
                await ctx.reply('Ответьте на сообщение, чтобы восставновить заметку. Для того, чтобы добавить новую заметку, просто напишите её в чат.')
            } else if (cliText == '-') {
                await ctx.reply('Ответьте на сообщение, чтобы удалить заметку.')
            } else if (cliText == '.') {
                await ctx.reply('Ответьте на сообщение, чтобы развернуть заметку.')
            } else {
                if (message.cli.notes) {
                    //TODO Добавить тип к message.cli.notes
                    const notes = message.cli.notes
                    if (notes.length > 1) await ctx.reply('Создаю заметки...').then(res => serviceMessageId = res.message_id)
                    else await ctx.reply('Создаю заметку...').then(res => serviceMessageId = res.message_id)
                    await telegram.createNotes(ctx)
                } else if (message.cli.photo) {
                    telegram.addFile(ctx, 'photo')
                    return
                }
            }
        }
        await ctx.deleteMessage(message.cli.id)
    } finally {
        //TODO Верни катч
    }
    // catch (e) {
    //     console.log(e.message)
    //     await ctx.reply(e.message)
    //     await ctx.deleteMessage(message.cli.id)
    // }
    if (serviceMessageId) await ctx.deleteMessage(serviceMessageId)
})

bot.launch().then(() => console.log('———   effectivnaya telegram bot launched   ———'))


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))