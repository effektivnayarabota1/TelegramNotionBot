import {
    Client
} from "@notionhq/client"
import messageRouter from "./messageRouter.js"
import commandRouter from "./commandRouter.js"

export default async function router(ctx) {
    const message = ctx.update.channel_post.text
    if (message.match(/^init/i)) {
        const words = message.split(' ')
        const title = words[1]
        const notionTokken = words[2]
        const PageId = words[3]
        // TODO Сделать, чтобы бот переименовывал название канала.
        const chatTitle = title + '|' + notionTokken + '|' + PageId
        console.log(chatTitle)
        await ctx.setChatTitle(chatTitle)
    } else {
        const title = ctx.update.channel_post.chat.title.split('|')
        const notion = new Client({
            auth: title[1]
        })
        const PageId = title[2]
        if (message.match(/^list/i)) {
            commandRouter.list(notion, PageId, ctx)
        } else messageRouter.router(notion, PageId, ctx)
    }
}