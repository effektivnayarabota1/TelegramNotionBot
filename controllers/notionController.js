import {
    Client
} from "@notionhq/client"
import blocksToArr from '../services/blocksToArray.js'
const notion = new Client({
    auth: 'secret_iZi9PbvdRElfIxSS91lc9qL1nHaIKygXh31rkf7bdkT'
})

export class Notion {
    static async idToUrl(id) {
        return `https://www.notion.so/${id.split('-').join('')}`
    }
    static async search(title) {
        const search = await notion.search({
            query: title
        }).then(res => res.results)
        if (!search.length) return false
        return search
    }

    static async createPage(PageId, title, blocks) {
        return await notion.pages.create({
            parent: {
                page_id: PageId
            },
            properties: {
                title: [{
                    "text": {
                        "content": title
                    }
                }]
            }
        }).then(res => {
            const title = res.properties.title.title[0].text.content
            const url = res.url
            const id = res.id
            return [{
                title: title,
                url: url,
                id: id
            }]
        })
        // return this
    }

    static async appendChilds(parentId, blocks) {
        //TODO Почему-то не могу вернуть значение прямо в then. Почему?
        let output
        await notion.blocks.children.append({
            block_id: parentId,
            children: blocks
        }).then(async res => {
            output = await blocksToArr(res.results, parentId)
        }).catch(async e => {
            if (e.code = 'object_not_found') {
                await this.discowerTitleById(parentId)
                throw new Error('Блок не найден.')
            } else throw new Error(e.code)
        })
        return output
    }

    static async appendAudio(parentId, fileLink) {
        let id
        await notion.blocks.children.append({
            block_id: parentId,
            children: [{
                type: 'audio',
                audio: {
                    type: "external",
                    external: {
                        url: fileLink
                    }
                }
            }]
        }).then(res => id = res.results[0].id)
        return id
    }

    static async appendPhoto(parentId, fileLink) {
        let id
        await notion.blocks.children.append({
            block_id: parentId,
            children: [{
                type: 'image',
                image: {
                    type: "external",
                    external: {
                        url: fileLink
                    }
                }
            }]
        }).then(res => {
            id = res.results[0].id
        })
        return id
    }

    static async remove(id, option) {
        this.childrens = []
        await notion.blocks.delete({
            block_id: id,
        }).then(async res => {
            if (option == 'empty') return
            let text, voiceUrl
            if (res.type == 'audio') {
                voiceUrl = res.audio.external.url
            } else if (res.type == 'child_page') {
                //Удалили страницу
                text = res.child_page.title
            } else {
                //Удалили блок
                text = res.paragraph.rich_text[0].text.content
            }
            this.childrens.push({
                text: text ? text : null,
                voiceUrl: voiceUrl ? voiceUrl : null,
                url: await this.idToUrl(res.id),
                has_children: res.has_children
            })
        })
        return this.childrens
    }

    static async restore(id) {
        try {
            await notion.pages.update({
                page_id: id,
                archived: false
            })
            return true
        } catch (e) {
            throw new Error('Ошибка в восстановлении.')
        }
    }

    static async showAllBlocks(parentId) {
        return await notion.blocks.children.list({
            block_id: parentId,
            page_size: 50,
        }).then(res => {
            return res.results
        }).catch(async e => {
            if (e.code = 'object_not_found') {
                await this.discowerTitleById(parentId)
                throw new Error('Блок не найден.')
            } else throw new Error(e.code)
        })
    }

    static async discowerTitleById(pageId, option) {
        let title
        await notion.pages.retrieve({
            page_id: pageId
        }).then(res => {
            if (res.archived) {
                if (option == 'restore') {
                    return false
                } else {
                    throw new Error('Страница удалена. Восстановите, ответив на сообщение со знаком "+".')
                }
            }
            return title = res.properties.title.title[0].text.content
        }).catch(async e => {
            if (e.code == 'object_not_found') {
                throw new Error('Блок не найден.')
            } else {
                throw new Error(e.message)
            }
        })
        return title
    }
}