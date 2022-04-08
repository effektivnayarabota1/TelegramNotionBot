import notionController from "../notion/controller.js"

export default async function (message) {
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