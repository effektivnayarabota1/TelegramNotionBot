import notionController from "../notion/controller.js"

export default class telegramController {
    static async show(PageId, message, params) {
        return await notionController.getAllBlocks(PageId, message.bot)
    }
    static async add(message) {
        return await notionController.append(message)
    }
    static async remove(message) {
        const id = message.bot.id || message.bot.parentId
        if (message.bot.type == 'page') {
            return ([{
                parents: await notionController.remove(id),
                childrens: []
            }, 'removePage'])
        } else if (message.bot.type == 'block') {
            return ([{
                parents: [{
                    title: await notionController.discowerTitleById(message.bot.parentId),
                    url: message.bot.parentUrl,
                }],
                childrens: await notionController.remove(id)
            }, 'removeBlock'])
        }
    }
    static async restore(message) {
        const parentId = message.bot.parentId
        const isExist = await notionController.discowerTitleById(parentId, 'restore')
        if (!isExist) {
            return await notionController.restore(parentId)
        } else {
            await ctx.reply('Эта страница уже существует. Нет необходимости её восстанавливать. Для того, чтобы добавить к странице текст, просто напишите сообщение.')
        }
    }
}