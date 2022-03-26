import {
    Telegram,
    Telegraf,
    Markup,
    Composer
} from 'telegraf'
import {
    TelegramToDb
} from "../controllers/telegramToDbController.js"
import {
    TelegramToNotion
} from "../controllers/telegramToNotionController.js"
import {
    COMMANDS
} from './commands.js';

export const bot = new Telegraf('5194986661:AAEtHVGpRuFhiVOCCFsqpxj44BWdDqucBGs')
bot.telegram.setMyCommands(COMMANDS)

bot.help((ctx) => {
    TelegramToDb.help(ctx)
})

bot.command('list', ctx => {
    // TelegramToDb.showList(ctx)
    TelegramToNotion.showList(ctx)
})

bot.on('message', ctx => {
    // TelegramToDb.message(ctx)
    TelegramToNotion.message(ctx)
})

bot.on('edited_message', ctx => {
    // TODO Удаление старых сообщений. чтобы их нельзя было редактирвоать.
    TelegramToDb.update(ctx)
})

bot.launch()