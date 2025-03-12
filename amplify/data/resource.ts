import {
  type ClientSchema,
  a,
  defineData,
  defineFunction,
} from "@aws-amplify/backend";
import { addGifs } from "../functions/add-gifs/resource";
import { defineSummarizeNote} from "../functions/summarize-note/resource";

const schema = a.schema({
  Note: a
    .model({
      id: a.id().required(),
      title: a.string(),
      content: a.string(),
      noteTags: a.hasMany("NoteTag", "noteId"),
      expiration: a.timestamp(),
    })
    .authorization((allow) => [allow.owner()]),

  Tag: a
    .model({
      id: a.id().required(),
      title: a.string(),
      noteTags: a.hasMany("NoteTag", "tagId"),
    })
    .authorization((allow) => [allow.owner()]),

  NoteTag: a
    .model({
      noteId: a.id(),
      tagId: a.id(),
      note: a.belongsTo("Note", "noteId"),
      tag: a.belongsTo("Tag", "tagId"),
    })
    .authorization((allow) => [allow.owner()]),

  SummarizeNoteResponse: a.customType({
    content: a.string(),
    executionDuration: a.float(),
  }),

  AddGifsResponse : a.customType({
    id: a.string(),
    url: a.string(),
    title: a.string()
  }),
  

  summarizeNote: a
    .query()
    .arguments({ content: a.string() })
    .returns(a.ref("SummarizeNoteResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(defineSummarizeNote)),

  fetchGifs: a
    .query()
    .arguments({ query: a.string() })
    .returns(a.ref("AddGifsResponse").array())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(addGifs)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
