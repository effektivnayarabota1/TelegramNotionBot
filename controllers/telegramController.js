import {
    Notion
} from './notionController.js'
import Reply from '../services/reply.js'
import blocksToArr from '../services/blocksToArray.js'
import idToUrl from '../services/idToUrl.js'
import dotenv from 'dotenv'
dotenv.config()

const PageId = process.env.NOTION_PAGE_ID

export class Telegram {
    static async showHelp(ctx) {
        await ctx.replyWithMarkdown(`Чтобы произвести действия над сообщением, необходимо на них ответить со специальным знаком.\n\nОтвет на "[ЗАГОЛОВОК](https://www.notion.so/)":\n"." – Развернуть страницу.\n"-" – Удалить страницу.\n"Сообщение" – Добавить к странице новые блоки. Блоки разделятся переносами на новую строку.\n\nОтвет на "Блок заметки [d:](https://www.notion.so/)":\n"-" – Удалить блок.\n"Сообщение" – Добавить к родительской странице новые блоки. Блоки разделятся переносами на новую строку.\n\n/helpoff – Отключить подсказки.`)
    }

    constructor(ctx, message) {
        this.ctx = ctx
        this.message = message
    }

    // TODO Несколько заметок после двойного пропуска.
    // TODO При добавлении заметки проверяем, есть ли заметка с таким-же заголовком. Если есть - поменять название и предупредить пользователя.
    // TODO Перепеши, ctx.message дает всю информацию о сообщении, без лишних символов

    async createNotes(ctx) {
        const notes = this.message.cli.notes

        for (let note of notes) {
            const pages = await Notion.search(note.title)
            if (!pages) {
                //Если поиск не нашел страницы
                let res = {
                    parents: await Notion.createPage(PageId, note.title),
                    childrens: []
                }
                if (note.blocks) {
                    const parentId = res.parents[0].id
                    const blocks = await this.blocksToArr(note.blocks)
                    res.childrens = await Notion.appendChilds(parentId, blocks)
                }
                await Reply.listReply(ctx, res, 'addPage')
            } else {
                for (let page of pages) {
                    const params = {
                        title: page.properties.title.title[0].text.content,
                        parentUrl: page.url,
                        parentId: page.id
                    }
                    if (!note.blocks.length) {
                        await this.showPage(ctx, params)
                    } else {
                        const blocks = await this.blocksToArr(note.blocks)
                        const res = {
                            parents: [{
                                title: params.title,
                                url: params.parentUrl,
                            }],
                            childrens: await Notion.appendChilds(params.parentId, blocks)
                        }
                        await Reply.listReply(ctx, res, 'addBlock')
                    }
                }
            }
        }
    }

    async blocksToArr(blocks) {
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

    async add(ctx) {
        const {
            parentUrl,
            parentId,
        } = await this.message.bot
        let blocks = await this.message.cli.notes[0].blocks
        blocks = await this.blocksToArr(blocks)

        let res = {
            parents: [{
                //TODO Посмотри почему тут может быть несоклько заголовков? Могут быть проблемы
                title: this.message.bot.title || await Notion.discowerTitleById(parentId),
                url: parentUrl
            }],
            childrens: await Notion.appendChilds(parentId, blocks)
        }
        await Reply.listReply(ctx, res, 'addBlock')
    }

    async addFile(ctx, type) {
        const url = this.message.cli[type].link
        let parentId, parentUrl, childUrl
        if (this.message.bot) {
            parentId = this.message.bot.parentId
            parentUrl = await idToUrl(parentId)
        } else {
            parentId = PageId
            parentUrl = await idToUrl(PageId)
        }
        if (type == 'voice') {
            await Notion.appendAudio(parentId, url).then(async res => {
                childUrl = await idToUrl(res)
            })
            await Reply.voiceReply(ctx, url, parentUrl, childUrl)
        } else if (type == 'photo') {
            const caption = this.message.cli.photo.caption
            const id = this.message.cli.photo.id
            await Notion.appendPhoto(parentId, url).then(async res => {
                childUrl = await idToUrl(res)
            })
            await Reply.photoReply(ctx,{
                url: url,
                id: id,
                parentUrl: parentUrl,
                childUrl: childUrl,
                caption: caption
            })
        }
    }

    async remove(ctx) {
        const parentId = this.message.bot.parentId
        let id, res
        if (!this.message.bot.childId) {
            //Родитель - страница
            id = parentId
            res = {
                parents: [{
                    title: this.message.bot.title,
                    url: this.message.bot.parentUrl
                }],
                childrens: []
            }
            await Notion.remove(id)
            await Reply.listReply(ctx, res, 'removePage')
        } else {
            //Ребенок - блок
            id = this.message.bot.childId
            res = {
                parents: [{
                    title: await Notion.discowerTitleById(parentId),
                    url: this.message.bot.parentUrl
                }],
                childrens: await Notion.remove(id)
            }
            await Reply.listReply(ctx, res, 'removeBlock')
        }
    }

    async restore(ctx) {
        const parentId = this.message.bot.parentId
        const isExist = await Notion.discowerTitleById(parentId, 'restore')
        if (!isExist) {
            await Notion.restore(parentId)
            await this.showPage(ctx)
            await ctx.reply('Страница восстановлена.')
        } else {
            await ctx.reply('Эта страница уже существует. Нет необходимости её восстанавливать.')
        }
    }

    // TODO Ссылка на страницу в Notion
    // TODO Сделать автоматическое удаление пустых строк.

    async showPage(ctx, params) {
        let {
            title,
            parentUrl,
            parentId
        } = await this.message.bot || params
        // console.log(parentId)
        // console.log(PageId)
        if (!title) title = await Notion.discowerTitleById(parentId)
        const blocks = await Notion.showAllBlocks(parentId)
        const res = {
            parents: [{
                title: title,
                url: parentUrl || await idToUrl(parentId)
            }],
            childrens: await blocksToArr(blocks, parentId)
        }
        await Reply.listReply(ctx, res)
    }

    static async showClosedList(ctx) {
        const pages = await Notion.showAllBlocks(PageId)
        const res = {
            parents: await blocksToArr(pages, PageId),
            childrens: []
        }
        await Reply.listReply(ctx, res)
    }

    static async romb() {
        const rombies = '◇▽○◦◯◌◊'
        return rombies[Math.round(Math.random() * (rombies.length - 1))]
    }
}