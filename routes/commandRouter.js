import bcrypt from "bcrypt"
import telegramController from "../controllers/telegram/controller.js"
import Message from "../models/message.js"
import notionPageId from "../services/notionPageId.js"
import reply from '../services/reply.js'

export default class commandRouter {
    static async list(ctx) {
        const [notion, PageId] = await notionPageId(ctx)
        const message = new Message()
        let res, option
        if (PageId) res = await telegramController.show(notion, PageId, message)
        await reply.listReply(ctx, res, option)
    }
    static async init(ctx) {
        const chatId = ctx.message.chat.id.toString()
        const saltRounds = 10

        bcrypt.hash(chatId, saltRounds).then((hash) => {
            ctx.reply(`https://api.notion.com/v1/oauth/authorize?owner=user&client_id=1bfa785e-f80d-440f-bfb4-64de308b573a&state=${hash}&response_type=code`)
        });

        // const message = ctx.message.text
        // const notionTokken = message.split(' ')[1]
        // const PageId = message.split(' ')[2]
        // if (notionTokken && PageId) {
        //     ctx.session = {
        //         notionTokken: notionTokken,
        //         PageId: PageId
        //     }
        //     await ctx.replyWithMarkdown(`\`${message}\``)
        //         .then(async res => {
        //             await ctx.unpinAllChatMessages()
        //             await ctx.pinChatMessage(res.message_id)
        //         })
        // } else await ctx.reply(`Страница уже инициализирована.`)
        // return
    }
}
