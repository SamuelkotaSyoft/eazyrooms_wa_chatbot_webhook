const express = require("express");

const chats = require("./chats");
const messages = require("./messages");
const notes = require("./notes");

const liveChatRoutes = express();

liveChatRoutes.use("/chats", chats);
liveChatRoutes.use("/messages", messages);

liveChatRoutes.use(
  "/chats/:chatId/notes",
  (req, _, next) => {
    req.body.chatId = req.params.chatId;
    next();
  },
  notes
);

module.exports = liveChatRoutes;
