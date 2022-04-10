import notionController from "../notion/controller.js"

export default class telegramController {
    static async show(PageId, message, params) {
        return await notionController.getAllBlocks(PageId, message.bot)
    }
    static async add(PageId, message) {
        return await notionController.append(PageId, message)
    }
    static async remove(message) {
        return await notionController.remove(message)
    }
    static async restore(message) {
        const parentId = message.bot.parentId
        const isExist = await notionController.discowerTitleById(parentId, 'restore')
        if (!isExist) {
            return await notionController.restore(parentId)
        } else {
            throw new Error('Эта страница уже существует. Нет необходимости её восстанавливать. Для того, чтобы добавить к странице текст, просто напишите сообщение.')
        }
    }
}