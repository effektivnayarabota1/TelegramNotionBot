import blocksToArr from '../../services/blocksToArray.js'
import discowerTitleById from './discowerTitleById.js'

export default async function getAllBlocks(notion, id, message) {
    let title, parentUrl, parentId
    try {
        if (message) {
            title = message.title
            parentUrl = message.parentUrl
            parentId = message.parentId
        }
        if (id) parentId = id
        return await notion.blocks.children.list({
            block_id: parentId,
            page_size: 50,
        }).then(async res => {
            if (message) {
                return {
                    parents: [{
                        title: title || await discowerTitleById(notion, parentId),
                        url: parentUrl,
                        id: parentId
                    }],
                    childrens: await blocksToArr(res.results, parentId)
                }
            } else {
                return {
                    parents: await blocksToArr(res.results, parentId),
                    childrens: []
                }
            }
        })
    } catch (e) {
        if (e.code == 'object_not_found') {
            throw new Error('Объект не найден.')
        }
    }
}