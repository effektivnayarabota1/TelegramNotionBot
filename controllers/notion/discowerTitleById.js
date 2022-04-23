export default async function discowerTitleById(notion, pageId, option) {
    return await notion.pages.retrieve({
        page_id: pageId
    }).then(res => {
        if (res.archived) {
            if (option == 'restore') {
                return false
            } else {
                throw new Error('Страница удалена. Восстановите, ответив на сообщение со знаком "+".')
            }
        }
        if (res.properties.title) return res.properties.title.title[0].text.content
        else return "Страница не поддерживается"
    }).catch(async e => {
        if (e.code == 'object_not_found') {
            throw new Error('Блок не найден.')
        } else {
            throw new Error(e.message)
        }
    })
};
