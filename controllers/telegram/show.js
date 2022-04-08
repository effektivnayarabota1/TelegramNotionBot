import notionController from "../notion/controller.js"

export default class show {
    static async page(message, params) {
        return await notionController.getAllBlocks( null, message.bot)
    }
    static async list(PageId) {
        return await notionController.getAllBlocks(PageId)
    }
};