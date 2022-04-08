import reply from '../../services/reply.js'
import show from './show.js'
import remove from "./remove.js"
import restore from "./restore.js"
import add from "./add.js"

export default class telegramController {
    static async showPage(ctx, message, params) {
        const res = await show.page(message, params)
        await reply.listReply(ctx, res)
    }
    static async showList(ctx, PageId) {
        const res = await show.list(PageId)
        await reply.listReply(ctx, res)
    }
    static async remove(ctx, message) {
        const [res, option] = await remove(message)
        await reply.listReply(ctx, res, option)
    }
    static async restore(ctx, message) {
        const res = await restore(message)
        await reply.listReply(ctx, res, 'restore')
    }

    static async add(ctx, message) {
        const res = await add(message)
        // await reply.listReply(ctx, res, 'addBlock')
    }
};