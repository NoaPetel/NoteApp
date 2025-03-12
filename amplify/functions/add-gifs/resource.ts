import { defineFunction, secret } from "@aws-amplify/backend";

export const addGifs = defineFunction({
    name:"addGifs",
    entry:"./handler.ts",
    environment:{
        GIPHY_API_KEY: secret("GIPHY_API_KEY"),
    }
});