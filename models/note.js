import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const NoteSchema = new Schema({
    title: String,
    body: String,
    date: Date
});
export const Note = mongoose.model('Note', NoteSchema);