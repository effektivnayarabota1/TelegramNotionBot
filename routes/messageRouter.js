import Message from "../models/message.js"
import telegramController from "../controllers/telegram/controller.js"
import reply from '../services/reply.js'

export default class messageRouter {
    static async router(PageId, ctx) {
        let res, option
        if (!ctx.message.reply_to_message) {
            //Новое сообщение, без отвечаемого.
            let message = new Message()
            await message.init(ctx, 'notes')
            const text = message.cli.text
            if (text == '.') throw new Error('Ответьте на сообщение бота, чтобы показать заметку.')
            else if (text == '-') throw new Error('Ответьте на сообщение бота, чтобы удалить заметку.')
            else if (text == '+') throw new Error('Ответьте на сообщение бота, чтобы восстановить заметку.')
            else [res, option] = await telegramController.add(PageId, message).catch(() => { throw new Error('Ошибка добавления сообщения.') })
        } else {
            //Ответ на сообщение бота.
            let message = new Message()
            await message.init(ctx, 'paragraphs').catch(() => { throw new Error('Ошибка инициализации сообщения.') })
            const text = message.cli.text
            if (text == '.') res = await telegramController.show(null, message).catch(() => { throw new Error('Ошибка инициализации сообщения.') })
            else if (text == '-')[res, option] = await telegramController.remove(message).catch(() => { throw new Error('Ошибка удаления сообщения.') })
            else if (text == '+')[res, option] = await telegramController.restore(message).catch(() => { throw new Error('Ошибка восстановления сообщения.') })
            else [res, option] = await telegramController.add(null, message).catch(() => { throw new Error('Ошибка добавления сообщения.') })
        }
        if (Array.isArray(res)) {
            for (let r of res) {
                await reply.listReply(ctx, r, option)
            }
            return
        } else return await reply.listReply(ctx, res, option)
    }
}