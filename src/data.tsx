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

export async function createNote(title: string) {
  try {
    const res = await client.models.Note.create({
      title,
      content: "",
      expiration: Math.floor(Date.now() / 1000) + 60,
    });
    return res;
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

export async function updateNote(
  noteId: string,
  title: string,
  content: string
) {
  try {
    return await client.models.Note.update({
      id: noteId,
      title: title,
      content: content,
      expiration: Math.floor(Date.now() / 1000) + 60,
    });
  } catch (err) {
    console.log("Error while updating note", err);
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
    const response = await client.models.Tag.delete({ id: tagId });
    const noteTags = await client.models.NoteTag.list({ filter: { tagId: { eq: tagId } } });
    for (const noteTag of noteTags.data) {
      await client.models.NoteTag.delete({ id: noteTag.id });
    }
    return response;
  } catch (err) {
    console.log("Error while deleting Tag", err);
  }
}

export async function createNoteTag(noteId: string, tagId: string) {
  try {
    return await client.models.NoteTag.create({ noteId, tagId });
  } catch (err) {
    console.error("Error while creating NoteTag", err);
  }
}

export async function getSummary(content: string) {
  try {
    const response = await client.queries.summarizeNote({ content: content });
    return response?.data?.content;
  } catch (err) {
    console.error("Error while summarizing note", err);
  }
}

export async function fetchGifs(query: string) {
  try {
    const response = await client.queries.fetchGifs({ query: query });
    return response;
  } catch (err) {
    console.error("Error while fetching GIFs", err);
  }
}

