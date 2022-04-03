import {
    Message
} from '../models/message.js';
import {
    Notion
} from './notionController.js'
import dotenv from 'dotenv'
dotenv.config()

export class Telegram {
    static async showHelp(ctx) {
        await ctx.replyWithMarkdown(`Чтобы произвести действия над сообщением, необходимо на них ответить со специальным знаком.\n\nОтвет на "[ЗАГОЛОВОК](https://www.notion.so/)":\n"." – Развернуть страницу.\n"-" – Удалить страницу.\n"Сообщение" – Добавить к странице новые блоки. Блоки разделятся переносами на новую строку.\n\nОтвет на "Блок заметки [d:](https://www.notion.so/)":\n"-" – Удалить блок.\n"Сообщение" – Добавить к родительской странице новые блоки. Блоки разделятся переносами на новую строку.\n\n/helpoff – Отключить подсказки.`)
    }

    constructor(PageId, ctx, message) {
        this.PageId = PageId
        this.ctx = ctx
        this.message = message
    }

    async reply(res, option) {
        const childrens = res.childrens
        const childsQuantity = childrens.length
        if (!option) {
            await this.ctx.replyWithMarkdown('`▾   +   ▾   +   1   +   ▾   +   ▾`')
        }
        if (res.parent) {
            const title = res.parent.title
            const url = res.parent.url
            // TODO Что с методом.titleReply? Не могу разобраться. Почитать про статические методы. Нужно чтобы вызывался по this!
            await Telegram.titleReply(this.ctx, title, url)
            if (childsQuantity) {
                switch (option) {
                    case 'add':
                        await this.ctx.replyWithMarkdown(`\`+ ${childsQuantity} ▾\``)
                        break
                    case 'remove':
                        await this.ctx.replyWithMarkdown(`\`- ${childsQuantity} ▾\``)
                        break
                }
                for (let child of childrens) {
                    const text = child.text
                    const parentUrl = url
                    const childUrl = child.url
                    await Telegram.blockReply(this.ctx, text, parentUrl, childUrl)
                }
            }
        }
    }

    static async titleReply(ctx = this.ctx, title, url) {
        if (title.match(/https:\/\//gmi)) {
            title = await title.split(/\s/)
            title = title[title.length - 1]
            return await ctx.replyWithMarkdown(`[NOTION](${url}) | [${title.toUpperCase()}](${title})`)
        }
        return await ctx.replyWithMarkdown(`[${title.toUpperCase()}](${url})`)
    }
    static async blockReply(ctx = this.ctx, text, parentUrl, childUrl) {
        await ctx.replyWithMarkdown(`${text}   [.](${parentUrl})[.](${childUrl})`)
    }

    // TODO Несколько заметок после двойного пропуска.
    // TODO При добавлении заметки проверяем, есть ли заметка с таким-же заголовком. Если есть - поменять название и предупредить пользователя.
    // TODO Перепеши, ctx.message дает всю информацию о сообщении, без лишних символов

    async createNotes() {
        const notes = this.message.cli.notes

        let serviceMessage

        if (notes.length > 1) await this.ctx.reply('Добавляю заметки...').then(res => serviceMessage = res.message_id)
        else await this.ctx.reply('Добавляю заметку...').then(res => serviceMessage = res.message_id)

        for (let note of notes) {
            const pages = await Notion.search(note.title)
            if (pages) {
                //TODO Нашел похожие заметки/у с таким именем. Добавляю. Изменить сервисное сообщение.
                //TODO Если просто написать название заметки, без тела и он ее найдет, вернуть развернутую заметки(у).
                for (let page of pages) {
                    const title = page.properties.title.title[0].text.content
                    if (!note.blocks.length) {
                        const params = {
                            title: title,
                            parentUrl: page.url,
                            parentId: page.id
                        }
                        await this.showPage(params)
                    } else {
                        let res = {
                            parent: {
                                //TODO Посмотри почему тут может быть несоклько заголовков? Могут быть проблемы
                                title: title,
                                url: page.url
                            },
                            childrens: await Notion.appendChilds(page.id, note.blocks)
                        }
                        await this.reply(res, 'add')
                    }
                }
                // Если поиск нашел заметки с таким именем
                // Сделать настройки, чтобы пользователь выбирал поведение по умолчанию. Либо добавить к существующим, либо создавать новые.
                // По умолчанию будет добавляться к существующим!
            } else {
                const res = await Notion.create(this.PageId, note.title, note.blocks)
                await this.reply(res)
            }
        }
        await this.ctx.deleteMessage(this.message.cli.id)
        await this.ctx.deleteMessage(serviceMessage)
    }

    async add() {
        const {
            parentUrl,
            parentId,
        } = await this.message.bot
        const blocks = await this.message.cli.notes[0].blocks

        let res = {
            parent: {
                //TODO Посмотри почему тут может быть несоклько заголовков? Могут быть проблемы
                title: this.message.bot.title || await Notion.discowerTitleById(parentId),
                url: parentUrl
            },
            childrens: await Notion.appendChilds(parentId, blocks)
        }
        await this.reply(res, 'add')
        await this.ctx.deleteMessage(this.message.cli.id)
    }

    // TODO Прописать везде catch, при ненайденной заметке. Ваша заметка не найдена. Обновить список?
    // TODO Выбрать несколько сообщений и переслать их боту, он все удалит.

    async remove() {
        try {
            const parentId = this.message.bot.parentId
            const id = this.message.bot.childId || parentId
            const res = {
                parent: {
                    title: this.message.bot.title || await Notion.discowerTitleById(parentId),
                    url: this.message.bot.parentUrl
                },
                childrens: await Notion.remove(id)
            }
            //TODO Изменить выводимое сообщение при удалении страницы.
            await this.reply(res, 'remove')
            await this.ctx.deleteMessage(this.message.cli.id)
        } catch (e) {
            this.ctx.reply('Ошибка при удалении.')
        }
    }

    // TODO Ссылка на страницу в Notion
    // TODO Сделать автоматическое удаление пустых строк.

    async showPage(params) {

        try {
            let {
                title,
                parentUrl,
                parentId
            } = await this.message.bot || params

            if (!title) title = await Notion.discowerTitleById(parentId)
            console.log(title)
            const blocks = await Notion.showAllBlocks(parentId)

            await Telegram.titleReply(this.ctx, title, parentUrl)

            const romb = await Telegram.romb()
            await this.ctx.replyWithMarkdown(`\`▾   ${romb}   ${blocks.length}   ${romb}   ▾\``)

            for (let block of blocks) {
                if (!block.paragraph.rich_text.length) {
                    // Удаляю пустые строки, если случайно оказались.
                    Notion.remove(block.id)
                    continue
                }
                const text = block.paragraph.rich_text[0].text.content
                const childUrl = await idToUrl(block.id)
                await Telegram.blockReply(this.ctx, text, parentUrl, childUrl)
            }

            if (!params) await this.ctx.deleteMessage(this.message.cli.id)
        } catch (e) {
            await this.ctx.deleteMessage(this.message.cli.id)
            await this.ctx.reply('Страница на найдена.')
            return
        }
    }

    static async showClosedList(ctx, PageId = this.PageId) {
        const pages = await Notion.showAllBlocks(PageId)

        const romb = await this.romb()
        await ctx.replyWithMarkdown(`\`▾   ${romb}   ▾   ${romb}   ${pages.length}   ${romb}   ▾   ${romb}   ▾\``)
        for (let page of pages) {
            if (page.paragraph) {
                if (!page.paragraph.rich_text.length) {
                    // Удаляю пустые строки, если случайно оказались.
                    Notion.remove(page.id)
                    continue
                } else {
                    // Заметка вне страницы, вывожу как блок.
                    const text = page.paragraph.rich_text[0].text.content
                    const parentUrl = await idToUrl(PageId)
                    const childUrl = await idToUrl(page.id)
                    await this.blockReply(ctx, text, parentUrl, childUrl)
                }
            } else {
                const title = page.child_page.title
                const id = page.id
                const url = await idToUrl(id)
                await this.titleReply(ctx, title, url)
            }
        }
        await ctx.deleteMessage(ctx.message.message_id)
    }

    static async romb() {
        const rombies = '◇▽○◦◯◌◊'
        return rombies[Math.round(Math.random() * (rombies.length - 1))]
    }

    // TODO Две заметки с одинаковым именем. Выводить обе!
    // static showOpenList(ctx) {

    // }
}
async function idToUrl(id) {
    return `https://www.notion.so/${id.split('-').join('')}`
}