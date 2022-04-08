import Message from "../models/message.js"
import messageRouter from "./messageRouter.js"
import telegramController from "../controllers/telegram/controller.js"

export default class router {
    static list(ctx, PageId) {
        telegramController.showList(ctx, PageId)
    }
    static message(ctx) {
        messageRouter.router(ctx)
    }
    static voice(ctx) {
        const message = new Message(ctx)
        console.log(message)
    }
}