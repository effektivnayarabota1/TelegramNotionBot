import Message from "../models/message.js"
import messageRouter from "./messageRouter.js"

export default class router {
    static message(ctx, PageId) {
        console.log(PageId)
        messageRouter.router(ctx, PageId)
    }
    static voice(ctx) {
        const message = new Message(ctx)
        console.log(message)
    }
}