import messageRouter from "./messageRouter.js"
import commandRouter from "./commandRouter.js"

export default class router {
    static command(PageId, ctx) {
        commandRouter.list(PageId, ctx)
    }
    static message(PageId, ctx) {
        messageRouter.router(PageId, ctx)
    }
    static voice(PageId, ctx) {
        messageRouter.router(PageId, ctx)
    }
}