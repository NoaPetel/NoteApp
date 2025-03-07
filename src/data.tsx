import { generateClient } from "aws-amplify/data";
import { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

export function subscribeNote(setNotes: (notes: any[]) => void) {
  return client.models.Note.observeQuery().subscribe({
    next: (data) => setNotes([...data.items]),
  });
}

export function subscribeTag(setTags: (notes: any[]) => void) {
  return client.models.Tag.observeQuery().subscribe({
    next: (data) => setTags([...data.items]),
  });
}

export function subscribeNoteTag(setNoteTags: (notes: any[]) => void) {
  return client.models.NoteTag.observeQuery().subscribe({
    next: (data) => setNoteTags([...data.items]),
  });
}
export async function fetchNotes() {
  try {
    return await client.models.Note.list();
  } catch (err) {
    console.error("Error while fetching Notes", err);
    return [];
  }
}

export async function fetchTags() {
  try {
    const tags = await client.models.Tag.list();
    console.log("Tags", tags);
    return tags;
  } catch (err) {
    console.error("Error while fetching Tags", err);
    return [];
  }
}

export async function fetchNoteTags() {
  try {
    return await client.models.NoteTag.list();
  } catch (err) {
    console.error("Error while fetching NoteTags", err);
    return [];
  }
}

export async function createNote(title: string, content: string) {
  try {
    return await client.models.Note.create({ title, content });
  } catch (err) {
    console.log("Error while creating note", err);
  }
}

export async function deleteNote(noteId: string) {
  try {
    return await client.models.Note.delete({ id: noteId });
  } catch (err) {
    console.log("Error while deleting Note", err);
  }
}

export async function createTag(tagTitle: string) {
  try {
    return await client.models.Tag.create({ title: tagTitle });
  } catch (err) {
    console.log("Error while creating Tag", err);
  }
}

export async function deleteTag(tagId: string) {
  try {
    return await client.models.Tag.delete({ id: tagId });
  } catch (err) {
    console.log("Error while deleting Tag", err);
  }
}

export async function createNoteTag(noteId: string, tagId: string) {
  try {
    const x = await client.models.NoteTag.create({ noteId, tagId });
    console.log(x);
    return x;
  } catch (err) {
    console.error("Error while creating NoteTag", err);
  }
}
