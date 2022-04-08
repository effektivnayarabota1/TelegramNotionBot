import notionController from "../notion/controller.js"

export default async function restore(message) {
    const parentId = message.bot.parentId
    const isExist = await notionController.discowerTitleById(parentId, 'restore')
    if (!isExist) {
        return await notionController.restore(parentId)
        // await ctx.reply('Страница восстановлена.')
    } else {
        await ctx.reply('Эта страница уже существует. Нет необходимости её восстанавливать. Для того, чтобы добавить к странице текст, просто напишите сообщение.')
    }
}