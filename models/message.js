export default class Message {
    // constructor(ctx) {
    //     (async () => {

    //     })()
    // }

    async init(ctx, option) {
        const botMessage = ctx.message.reply_to_message
        this.cli = {
            id: ctx.message.message_id,
            text: ctx.message.text ? ctx.message.text : null,
            [option]: option == 'paragraph' ? await this.blocks(ctx) : await this.notes(ctx),
            photo: ctx.message.photo ? await this.photo(ctx) : null,
            voice: ctx.message.voice ? await this.voice(ctx) : null,
        }
        if (botMessage) {
            if (botMessage.voice) throw new Error('Отправьте родительскую сообщение этого голосового.')
            else if (botMessage.photo) throw new Error('Отправьте родительскую сообщение этого изображения.')
            this.bot = {}
            this.bot.type = await this.msgType(botMessage)
            this.bot.text = botMessage.text
            this.bot.title = await this.title(botMessage)
            this.bot.parentUrl = await this.parentUrl(botMessage)
            this.bot.parentId = await urlToId(this.bot.parentUrl)
            this.bot.url = await this.url(botMessage)
            this.bot.id = await urlToId(this.bot.url)
        }
        return this;
    }

    //Client message.
    async init1(ctx) {
        this.cli = {}
        this.cli.id = ctx.message.message_id
        if (ctx.message.text) this.cli.text = ctx.message.text

        const botMessage = ctx.message.reply_to_message

        let botEntities
        if (botMessage) {
            botEntities = botMessage.entities
            if (botMessage.voice) {
                throw new Error('Отправьте родительскую сообщение этого голосового.')
            } else if (botMessage.photo) {
                throw new Error('Отправьте родительскую сообщение этого изображения.')
            }
        }

        if (botEntities) {
            this.bot = {}
            this.bot.text = botMessage.text
            await this.botMsgToUrlId(botEntities)
            if (ctx.message.voice) await this.cliVoiceToFile(ctx)
            else await this.cliMsgToNotes(ctx, 'blocks')
        } else {
            if (ctx.message.text) this.cliMsgToNotes(ctx)
            else if (ctx.message.voice) await this.cliVoiceToFile(ctx)
            else if (ctx.message.photo) await this.cliPhotoToFile(ctx)
            else throw new Error('Данный тип файла неподдерживатеся.')
        }
    }

    async notes(ctx) {
        let output =[]
        const notes = ctx.message.text.split(/(\n){3,}/).filter(n => n != '\n')
        for (let note of notes) {
            let blocks = []
            let title

            const lines = note.split('\n')

            title = lines.splice(0, 1)[0]
            if (lines.length) blocks = lines.join('\n').split('\n\n')

            output.push({
                title: title,
                blocks: blocks
            })
        }
        return output
    }
    async blocks(ctx) {
        return ctx.message.text.split(/(\n){2,}/).filter(n => n != '\n')
    }

    async photo(ctx) {
        const photos = ctx.message.photo
        const id = photos[photos.length - 1].file_id
        return await ctx.telegram.getFileLink(id).then(res => {
            return {
                link: res.href,
                id: id,
                caption: ctx.message.caption
            }
        })
    }

    async voice(ctx) {
        const id = ctx.message.voice.file_id
        return await ctx.telegram.getFileLink(id).then(res => {
            return {
                link: res.href,
                id: id,
            }
        })
    }

    //Bot message.
    async msgType(botMessage) {
        const entities = botMessage.entities
        if (entities[0].offset == 0 && entities[0].type == 'text_link') return 'page'
        else if (entities[entities.length - 1].type == 'text_link' && entities[entities.length - 2].type == 'text_link') return 'block'
        else throw new Error('Отправьте корректное сообщение.')
    }

    async title(botMessage) {
        const type = this.bot.type
        const entities = botMessage.entities
        if (type == 'page') {
            if (entities.length > 1) {
                const title = entities[1]
                return this.bot.text.slice(title.offset, title.offset + title.length)
            } else {
                return this.bot.text
            }
        } else if (type == 'block') return null
    }

    async parentUrl(botMessage) {
        const type = this.bot.type
        const entities = botMessage.entities
        if (type == 'page') {
            return await entities[0].url
        } else if (type == 'block') {
            return entities[entities.length - 2].url
        }
    }

    async url(botMessage) {
        const type = this.bot.type
        const entities = botMessage.entities
        if (type == 'page') {
            return null
        } else if (type == 'block') {
            return entities[entities.length - 1].url
        }
    }

    async botMsgToUrlId(botEntities) {
        // if (this.bot) this.bot = {}
        const ent = botEntities
        if (ent[0].offset == 0 && ent[0].type == 'text_link') {
            // Title
            if (ent.length > 1) {
                const title = ent[1]
                this.bot.title = this.bot.text.slice(title.offset, title.offset + title.length)
            } else this.bot.title = this.bot.text
            this.bot.parentUrl = await ent[0].url
            this.bot.parentId = await urlToId(ent[0].url)
            delete await this.bot.text
        } else if (ent[ent.length - 1].type == 'text_link' && ent[ent.length - 2].type == 'text_link') {
            // Block
            const parentDot = ent[ent.length - 2]
            const childDot = ent[ent.length - 1]

            this.bot.parentUrl = parentDot.url
            this.bot.parentId = await urlToId(parentDot.url)

            this.bot.childUrl = childDot.url
            this.bot.childId = await urlToId(childDot.url)
        } else {
            throw new Error('Отправьте корректное сообщение.')
        }
    }
}

async function urlToId(url) {
    if (!url) return null
    const urlArray = url.split('/')
    const urlId = urlArray[urlArray.length - 1].split('-')
    const URL = urlId[urlId.length - 1]
    return [URL.slice(0, 8), URL.slice(8, 12), URL.slice(12, 16), URL.slice(16, 20), URL.slice(20)].join('-')
}
async function idToUrl(id) {
    return id.split('-').join('')
}