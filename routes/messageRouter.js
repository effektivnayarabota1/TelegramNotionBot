import Message from "../models/message.js"
import telegramController from "../controllers/telegram/controller.js"
import reply from '../services/reply.js'
import discowerTitleById from "../controllers/notion/discowerTitleById.js"

export default class messageRouter {
    static async router(ctx, PageId) {
        let res, option
        if (!ctx.message.reply_to_message) {
            //Новое сообщение, без отвечаемого.
            let message = new Message()
            await message.init(ctx, 'notes')
            if (PageId) res = await telegramController.show(PageId, message)
        } else {
            //Ответ на сообщение бота.
            let message = new Message()
            await message.init(ctx, 'paragraphs')
            const text = message.cli.text
            if (text == '.') res = await telegramController.show(null, message)
            else if (text == '-')[res, option] = await telegramController.remove(message)
            else if (text == '+')[res, option] = await telegramController.restore(message)
            else [res, option] = await telegramController.add(message)
        }
        await reply.listReply(ctx, res, option)
    }
}