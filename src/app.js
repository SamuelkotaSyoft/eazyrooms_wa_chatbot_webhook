const express = require("express");
const cors = require("cors");

// const liveChatRoutes = require("./helpers/livechat/liveChatRoutes");
const whatsappWebhook = require("./whatsappWebhook");
// const webChatRoutes = require("./helpers/webchat/webChatRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/wa-webhook/whatsapp", whatsappWebhook);
// app.use("/wa-webhook/webchat", webChatRoutes);
// app.use("/wa-webhook", liveChatRoutes);

// exports.handler = serverless(app);

module.exports = app;
