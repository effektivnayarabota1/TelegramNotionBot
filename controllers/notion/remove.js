import idToUrl from '../../services/idToUrl.js'

export default async function remove(notion, id, option) {
    return await notion.blocks.delete({
        block_id: id,
    }).then(async res => {
        if (option == 'empty') return
        let title, text, voiceUrl
        if (res.type == 'audio') {
            voiceUrl = res.audio.external.url
        } else if (res.type == 'child_page') {
            //Удалили страницу
            title = res.child_page.title
        } else if (res.type == 'paragraph') {
            //Удалили блок

            let type = res.paragraph.rich_text[0].type
            if (type == 'mention') {
                const mention = res.paragraph.rich_text[0].mention.type
                if (mention == 'date') {
                    let date = res.paragraph.rich_text[0].plain_text
                    date = new Date(date.slice(0, date.length - 3))
                    text = await date.toDateString()
                } else throw new Error('Данное сообщение не поддерживается.')
                //TODO Подключить все mentions
            } else if (type == 'text') {
                text = res.paragraph.rich_text[0].text.content
            }
        }
        return ([{
            title: title || null,
            text: text || null,
            voiceUrl: voiceUrl || null,
            url: await idToUrl(res.id),
            has_children: res.has_children
        }])
    })
};