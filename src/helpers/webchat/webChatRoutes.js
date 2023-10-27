const express = require("express");
const createWebChat = require("./createWebChat");
const webChatWebhook = require("./webChatWebhook");

const webChatRoutes = express();

webChatRoutes.use("/create", createWebChat);
webChatRoutes.use("/message", webChatWebhook);

module.exports= webChatRoutes;
