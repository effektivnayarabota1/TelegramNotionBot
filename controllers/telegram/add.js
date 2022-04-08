import notionController from "../notion/controller.js"

export default async function add(message) {
    return await notionController.append(message)
};
