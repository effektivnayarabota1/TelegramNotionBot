export class Message {
    constructor(ctx) {
        // this.cli = {}
        // this.cli.id = ctx.message.message_id
        // this.cli.text = ctx.message.text

        // const botMessage = ctx.message.reply_to_message
        // let botEntities
        // if (botMessage) {
        //     botEntities = botMessage.entities
        // }

        // if (botEntities) {
        //     this.bot = {}
        //     this.bot.text = botMessage.text
        //     this.botMsgToUrlId(botEntities)
        //     this.cliMsgToNotes(ctx, 'blocks')
        // } else this.cliMsgToNotes(ctx)

        // return new Promise(resolve => {
        //     resolve(ctx)
        // })
    }

    async init(ctx) {
        this.cli = {}
        this.cli.id = ctx.message.message_id
        this.cli.text = ctx.message.text

        const botMessage = ctx.message.reply_to_message
        let botEntities
        if (botMessage) {
            botEntities = botMessage.entities
        }

        if (botEntities) {
            this.bot = {}
            this.bot.text = botMessage.text
            await this.botMsgToUrlId(botEntities)
            await this.cliMsgToNotes(ctx, 'blocks')
        } else this.cliMsgToNotes(ctx)
    }

    async cliMsgToNotes(ctx, option) {
        const cliText = ctx.message.text
        this.cli.notes = []

        if (option == 'blocks') {
            let blocks = cliText.split(/(\n){2,}/).filter(n => n != '\n')
            this.cli.notes.push({
                blocks: blocks
            })
        } else {
            const notes = cliText.split(/(\n){3,}/).filter(n => n != '\n')
            for (let note of notes) {
                let blocks = []
                let title

                const lines = note.split('\n')

                title = lines.splice(0, 1)[0]
                if (lines.length) blocks = lines.join('\n').split('\n\n')

                this.cli.notes.push({
                    title: title,
                    blocks: blocks
                })
            }
        }
    }

    async botMsgToUrlId(botEntities) {
        // if (this.bot) this.bot = {}
        const ent = botEntities
        if (ent[0].offset == 0) {
            // Title
            if (ent.length > 1) {
                const title = ent[1]
                this.bot.title = this.bot.text.slice(title.offset, title.offset + title.length)
            } else this.bot.title = this.bot.text
            this.bot.parentUrl = await ent[0].url
            this.bot.parentId = await urlToId(ent[0].url)
            delete await this.bot.text
        } else {
            // Block
            const parentDot = ent[ent.length - 2]
            const childDot = ent[ent.length - 1]

            this.bot.parentUrl = parentDot.url
            this.bot.parentId = await urlToId(parentDot.url)

            this.bot.childUrl = childDot.url
            this.bot.childId = await urlToId(childDot.url)
        }
    }
}

async function urlToId(url) {
    const urlArray = url.split('/')
    const urlId = urlArray[urlArray.length - 1].split('-')
    const URL = urlId[urlId.length - 1]
    return [URL.slice(0, 8), URL.slice(8, 12), URL.slice(12, 16), URL.slice(16, 20), URL.slice(20)].join('-')
}
async function idToUrl(id) {
    return id.split('-').join('')
}