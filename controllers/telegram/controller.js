import notionController from "../notion/controller.js"

export default class telegramController {
    static async show(notion, PageId, message, params) {
        return await notionController.getAllBlocks(notion, PageId, message.bot)
    }
    static async add(notion, PageId, message) {
        return await notionController.append(notion, PageId, message)
    }
    static async remove(notion, message) {
        return await notionController.remove(notion, message)
    }
    static async restore(message) {
        const parentId = message.bot.parentId
        const isExist = await notionController.discowerTitleById(notion, parentId, 'restore')
        if (!isExist) {
            return await notionController.restore(notion, parentId)
        } else {
            throw new Error('Эта страница уже существует. Нет необходимости её восстанавливать. Для того, чтобы добавить к странице текст, просто напишите сообщение.')
        }
    }
}