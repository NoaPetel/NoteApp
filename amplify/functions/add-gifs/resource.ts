import { defineFunction } from "@aws-amplify/backend";

export const addGifs = defineFunction({
    name:"addGifs",
    entry:"./handler.ts"
});