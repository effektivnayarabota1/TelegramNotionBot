export default async function restore(notion, id) {
    try {
        return await notion.pages.update({
            page_id: id,
            archived: false
        }).then(res => {
            return ({
                parents: [{
                    title: res.properties.title.title[0].text.content,
                    url: res.url
                }],
                childrens: []
            })
        })
    } catch (e) {
        throw new Error('Ошибка в восстановлении.')
    }
};
