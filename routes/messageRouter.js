import Message from "../models/message.js"
import telegramController from "../controllers/telegram/controller.js"

export default class messageRouter {
    static async router(ctx) {
        let message = new Message()
        await message.init(ctx)
        
        if (!message.bot) {
            //Новое сообщение, без отвечаемого.
        } else {
            //Ответ на сообщение бота.
            const text = message.cli.text
            if (text == '.') {
                await telegramController.showPage(ctx, message)
            } else if (text == '-') {
                await telegramController.remove(ctx, message)
            } else if (text == '+') {
                await telegramController.restore(ctx, message)
            } else {
                await telegramController.add(ctx, message)
            }
        }
    }
}