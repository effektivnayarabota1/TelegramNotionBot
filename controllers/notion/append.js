import discowerTitleById from './discowerTitleById.js';
import blocksToArr from "../../services/blocksToArray.js"
import idToUrl from '../../services/idToUrl.js';
import search from './search.js';

export default class append {
    static async notes(PageId, notion, message) {
        let option
        const notes = message.cli.notes
        let reses = []
        for (let note of notes) {
            const pages = await search(notion, note.title)
            if (!pages) {
                //Если поиск не нашел страницы.
                reses.push(await notion.pages.create({
                    parent: {
                        page_id: PageId
                    },
                    properties: {
                        title: [{
                            "text": {
                                "content": note.title
                            }
                        }]
                    }
                }).then(async res => {
                    return await this.paragraphs(notion, {
                        cli: {
                            paragraphs: note.blocks
                        },
                        bot: {
                            title: res.properties.title.title[0].text.content,
                            parentId: res.id,
                            parentUrl: res.url
                        }
                    })
                }))
                option = 'addPage'
            } else {
                for (let page of pages) {
                    reses.push(
                        await this.paragraphs(notion, {
                            cli: {
                                paragraphs: note.blocks
                            },
                            bot: {
                                title: page.properties.title.title[0].text.content,
                                parentId: page.id,
                                parentUrl: page.url
                            }
                        }))
                }
                option = 'addBlocks'
            }
        }
        return [reses, option]
    }

    static async paragraphs(notion, message) {
        return await notion.blocks.children.append({
            block_id: message.bot.parentId,
            children: await this.blocksToChilds(message.cli.paragraphs)
        }).then(async res => {
            return ({
                parents: [{
                    title: message.bot.title || await discowerTitleById(notion, message.bot.parentId),
                    url: message.bot.parentUrl
                }],
                childrens: await blocksToArr(res.results, message.bot.parentId)
            })
        })
    }

    static async photos(PageId, notion, message) {
        let title, id, url
        if (message.bot) {
            id = message.bot.parentId
            title = message.bot.title || await discowerTitleById(notion, id)
            url = message.bot.parentUrl || await idToUrl(id)
        } else {
            id = PageId
            title = await discowerTitleById(notion, id)
            url = await idToUrl(id)
        }
        return await notion.blocks.children.append({
            block_id: id,
            children: [{
                type: 'image',
                image: {
                    type: "external",
                    external: {
                        url: message.cli.photo.link
                    }
                }
            }]
        }).then(async res => {
            return ([{
                parents: [{
                    title: title,
                    url: url
                }],
                childrens: await blocksToArr(res.results, id)
            }])
        })
    }

    static async voice(PageId, notion, message) {
        let id, title, url
        if (message.bot) {
            id = message.bot.parentId
            title = message.bot.title || await discowerTitleById(notion, id)
            url = await idToUrl(id)
        } else {
            id = PageId
            title = await discowerTitleById(notion, id)
            url = await idToUrl(id)
        }
        return await notion.blocks.children.append({
            block_id: id,
            children: [{
                type: 'audio',
                audio: {
                    type: "external",
                    external: {
                        url: message.cli.voice.link
                    }
                }
            }]
        }).then(async res => {
            return ({
                parents: [{
                    title: title,
                    url: url
                }],
                childrens: await blocksToArr(res.results, id)
            })
        })
    }

    static async blocksToChilds(blocks) {
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