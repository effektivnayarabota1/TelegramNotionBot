import {
    Note
} from "../models/note.js"

export class TelegramToDb {
    static MessageToArray(text) {
        return text.match(/^.*/gm)
    }

    static message(ctx) {
        const baseNote = ctx.update.message.reply_to_message
        const newMessageText = ctx.update.message.text
        if (!baseNote) this.create(ctx)
        else {
            if (newMessageText == '-') this.destroy(ctx, baseNote)
            else if (newMessageText.match(/^-/gm)) this.overwrite(ctx, baseNote)
            else this.add(ctx, baseNote)
        }

    }

    static create(ctx) {
        const msgArray = this.MessageToArray(ctx.message.text)
        const newBody = msgArray.slice(1).join("\n")
        const note = new Note({
            title: msgArray[0],
            body: newBody,
            date: new Date()
        })
        note.save().then(async () => {
            await ctx.reply('Заметка добавлена')
            this.showList(ctx)
        })
    }

    static add(ctx, baseNote) {
        const baseMsgArray = this.MessageToArray(baseNote.text)
        const msgArray = this.MessageToArray(ctx.message.text)

        const oldBody = baseMsgArray.slice(1).join("\n")
        const newBody = msgArray.join("\n")

        console.log(baseMsgArray)
        console.log(msgArray)

        const newNote = new Note({
            title: baseMsgArray[0],
            body: oldBody + '\n' + newBody,
        })
        Note.findOne({
            title: baseMsgArray[0],
            body: oldBody,
        }).then((oldNote) => {
            newNote._id = oldNote._id
            Note.updateOne({
                _id: oldNote._id
            }, newNote).then(() => {
                ctx.reply('Заметка дополнена')
                this.showList(ctx)
            })
        }).catch((error) => {
            ctx.reply(error)
        })

    }

    static overwrite(ctx, baseNote) {
        const baseMsgArray = this.MessageToArray(baseNote.text)
        const msgArray = this.MessageToArray(ctx.message.text)

        const oldBody = baseMsgArray.slice(1).join("\n")
        const newBody = msgArray.slice(1).join("\n")

        const newNote = new Note({
            title: msgArray[0].substring(1),
            body: newBody,
        })
        Note.findOne({
            title: baseMsgArray[0],
            body: oldBody,
        }).then((oldNote) => {
            newNote._id = oldNote._id
            Note.updateOne({
                _id: oldNote._id
            }, newNote).then(() => {
                this.showList(ctx)
                ctx.reply('Заметка изменена')
            })
        }).catch((error) => {
            ctx.reply(error)
        })

    }

    // TODO Добавить ссылку в хедере на ноушен при помощи маркдауна
    static showList(ctx) {
        Note.find().then(async (notes) => {
            if (!notes.length) {
                ctx.reply('Заметок нет.')
            }
            for (let note of notes) {
                if (note.title) await ctx.replyWithMarkdown(` *${note.title}* \n${note.body} `)
            }
        }).catch((error) => {
            ctx.reply(error)
        })
    }

    static update(ctx) {
        const editedMsgArray = ctx.update.edited_message.text.match(/^.*/gm)
        const newNote = new Note({
            title: editedMsgArray[0],
            body: editedMsgArray[1],
        })
        // Ищет старую заметку по заголовку и телу, вытаскивает из нее айди и апдейтит новую заметку по айди.
        Note.findOne({
            title: editedMsgArray[0],
        }).then((oldNote) => {
            newNote._id = oldNote._id
            Note.updateOne({
                _id: oldNote._id
            }, newNote).then(() => {
                this.showList(ctx)
                ctx.reply('Заметка изменена')
            })
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }

    static destroy(ctx, baseNote = null) {
        if (!baseNote) baseNote = ctx
        const baseMsgArray = this.MessageToArray(baseNote.text)
        const bodyString = baseMsgArray.slice(1).join('\n')
        Note.deleteOne({
            title: baseMsgArray[0],
            body: bodyString
        }).then(() => {
            this.showList(ctx)
            ctx.reply('Заметка удалена')
        }).catch((error) => {
            ctx.reply(error)
        })
    }

    static help(ctx) {
        return ctx.reply('Help')
    }
}