

export default async function idToUrl(id) {
    return `https://www.notion.so/${id.split('-').join('')}`
}