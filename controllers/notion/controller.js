import {
    Client
} from "@notionhq/client"
import append from './append.js'
import remove from "./remove.js"
import restore from "./restore.js"
import getAllBlocks from "./getAllBlocks.js"
import discowerTitleById from "./discowerTitleById.js"
// const notion = new Client({
//     auth: 'secret_iZi9PbvdRElfIxSS91lc9qL1nHaIKygXh31rkf7bdkT'
// })

export default class notionController {
    static async append(PageId, message) {
        if (message.cli.paragraphs) return [await append.paragraphs(notion, message), 'addBlocks']
        else if (message.cli.notes) return await append.notes(PageId, notion, message)
        else if (message.cli.photo) return [await append.photos(PageId, notion, message), 'addPhoto']
        else if (message.cli.voice) return [await append.voice(PageId, notion, message), 'addBlocks']
    }

    static async remove(message, option) {
        // return await remove(notion, id, option)
        const id = message.bot.id || message.bot.parentId
        if (message.bot.type == 'page') {
            return ([{
                parents: await remove(notion, id, option),
                childrens: []
            }, 'removePage'])
        } else if (message.bot.type == 'block') {
            return ([{
                parents: [{
                    title: await discowerTitleById(notion, message.bot.parentId),
                    url: message.bot.parentUrl,
                }],
                childrens: await remove(notion, id, option)
            }, 'removeBlock'])
        } else {
            await remove(notion, id, 'empty')
        }
    }

    static async restore(id) {
        return await restore(notion, id)
    }

    static async getAllBlocks(id, message) {
        return await getAllBlocks(notion, id, message)
    }

    static async discowerTitleById(pageId, option) {
        return await discowerTitleById(notion, pageId, option)
    }
}