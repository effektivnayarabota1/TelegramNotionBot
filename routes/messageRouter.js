import Message from "../models/message.js"
import telegramController from "../controllers/telegram/controller.js"
import reply from '../services/reply.js'
import discowerTitleById from "../controllers/notion/discowerTitleById.js"

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
            else [res, option] = await telegramController.add(PageId, message)
        } else {
            //Ответ на сообщение бота.
            let message = new Message()
            await message.init(ctx, 'paragraphs')
            const text = message.cli.text
            if (text == '.') res = await telegramController.show(null, message)
            else if (text == '-')[res, option] = await telegramController.remove(message)
            else if (text == '+')[res, option] = await telegramController.restore(message)
            else [res, option] = await telegramController.add(null, message)
        }
        if (Array.isArray(res)) {
            for (let r of res) {
                await reply.listReply(ctx, r, option)
            }
            return
        } else return await reply.listReply(ctx, res, option)
    }
}