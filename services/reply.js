export default class Reply {

    static async listReply(ctx, res, option) {
        const childrens = res.childrens
        const childsQuantity = childrens.length
        const parents = res.parents
        const parentsQuantity = parents.length

        await ctx.replyWithMarkdown(`\`${await this.smile()}\``)

        if (!option) {
            const romb = await this.romb()
            await ctx.replyWithMarkdown(`\`▾   ${romb}   ${childsQuantity||parentsQuantity}   ${romb}   ▾\``)
        } else if (option == 'addPage') {
            await ctx.replyWithMarkdown('`▾   +   1   +   ▾`')
        } else if (option == 'removePage') {
            await ctx.replyWithMarkdown('`▾   -   1   -   ▾`')
        } else if (option == 'restore') {
            await ctx.replyWithMarkdown('`▾   ↺   1   ↻   ▾`')
        }

        if (res.parents) {
            for (let parent of res.parents) {
                const title = parent.title
                const url = parent.url
                const parentUrl = parent.parentUrl
                // TODO Что с методом.titleReply? Не могу разобраться. Почитать про статические методы. Нужно чтобы вызывался по this!
                if (parent.voiceUrl) {
                    await this.voiceReply(ctx, parent.voiceUrl, parentUrl, url)
                } else if (parent.text) {
                    await this.blockReply(ctx, parent.text, null, url)
                } else if (parent.title) {
                    await this.titleReply(ctx, title, url)
                } else if (parent.photoUrl) {
                    await this.photoReply(ctx, parent)
                }
                if (childsQuantity) {
                    if (option == 'addBlocks') {
                        await ctx.replyWithMarkdown(`\`+ ${childsQuantity} ▾\``)
                    } else if (option == 'removeBlock') {
                        await ctx.replyWithMarkdown(`\`- ${childsQuantity} ▾\``)
                    }
                    for (let child of childrens) {
                        const parentUrl = url
                        const childUrl = child.url
                        if (child.voiceUrl) {
                            await this.voiceReply(ctx, child.voiceUrl, parentUrl, childUrl)
                        } else if (child.text) {
                            await this.blockReply(ctx, child.text, parentUrl, childUrl)
                        } else if (child.photoUrl) {
                            await this.photoReply(ctx, child.photoUrl, parentUrl, childUrl)
                        }
                    }
                }
            }
        }
    }

    static async titleReply(ctx, title, url) {
        if (title.match(/https:\/\//gmi)) {
            title = await title.split(/\s/)
            title = title[title.length - 1]
            return await ctx.replyWithMarkdown(`[NOTION](${url}) | [${title.toUpperCase()}](${title})`)
        }
        return await ctx.replyWithMarkdown(`[${title.toUpperCase()}](${url})`)
    }

    static async blockReply(ctx, text, parentUrl, childUrl) {
        await ctx.replyWithMarkdown(`${text}   [.](${parentUrl})[.](${childUrl})`)
    }

    static async voiceReply(ctx, voiceUrl, parentUrl, childUrl) {
        await ctx.replyWithMarkdown(`▾   [VOICE](${voiceUrl})   [.](${parentUrl})[.](${childUrl})`)
        await ctx.replyWithVoice({
            url: voiceUrl
        })
    }

    static async photoReply(ctx, photoUrl, parentUrl, childUrl) {
        await ctx.replyWithMarkdown(`▾   [IMAGE](${photoUrl})   [.](${parentUrl})[.](${childUrl})`)
        // await ctx.replyWithPhoto(
        //     photoUrl,
        //     { caption: `▾   [IMAGE](${photoUrl})   [.](${parentUrl})[.](${childUrl})`, parse_mode: 'Markdown' }
        // )
    }

    static async smile() {
        const smiles = [
            '>:(',
            'O.O',
            '^o^',
            '^.^',
            '(✿◡‿◡)',
            "(>'-'<)",
            '¯\_(ツ)_/¯'
        ]
        return smiles[Math.round(Math.random() * (smiles.length - 1))]
    }

    static async romb() {
        const rombies = '◇▽○◦◯◌◊'
        return rombies[Math.round(Math.random() * (rombies.length - 1))]
    }

}
