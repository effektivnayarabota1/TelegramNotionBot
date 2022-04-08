import {
    Client
} from "@notionhq/client"
import appendParagraph from './appendParagraph.js'
import remove from "./remove.js"
import restore from "./restore.js"
import getAllBlocks from "./getAllBlocks.js"
import discowerTitleById from "./discowerTitleById.js"
const notion = new Client({
    auth: 'secret_iZi9PbvdRElfIxSS91lc9qL1nHaIKygXh31rkf7bdkT'
})

export default class notionController {
    static async getAllBlocks(id, message) {
        return await getAllBlocks(notion, id, message)
    }

    static async discowerTitleById(pageId, option) {
        return await discowerTitleById(notion, pageId, option)
    }

    static async remove(id, option) {
        return await remove(notion, id, option)
    }

    static async restore(id) {
        return await restore(notion, id)
    }

    static async append(message) {
        console.log(message)
    }
}