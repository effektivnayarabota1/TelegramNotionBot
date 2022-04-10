import telegramController from "../controllers/telegram/controller.js"
import Message from "../models/message.js"
import reply from '../services/reply.js'

export default class commandRouter {
    static async list(PageId, ctx) {
        const message = new Message()
        let res, option
        if (PageId) res = await telegramController.show(PageId, message)
        await reply.listReply(ctx, res, option)
    }
}