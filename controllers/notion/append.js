import discowerTitleById from './discowerTitleById.js';
import blocksToArr from "../../services/blocksToArray.js"

export default class append {
    static async paragraph(notion, message) {
        return await notion.blocks.children.append({
            block_id: message.bot.parentId,
            children: await blocksToChilds(message.cli.blocks)
        }).then(async res => {
            return ({
                parents: [{
                    title: message.bot.title || await discowerTitleById(notion, message.bot.parentId),
                    url: message.bot.parentUrl
                }],
                childrens: await blocksToArr(res.results, message.bot.parentId)
            })
        })

        async function blocksToChilds(blocks) {
            let outputArray = []
            for (let block of blocks) {
                outputArray.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{
                            type: 'text',
                            text: {
                                content: block
                            },
                        }, ],
                    },
                })
            }
            return outputArray
        }
    }
}