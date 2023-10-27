const express = require("express");
const { default: mongoose } = require("mongoose");

const Message = require("../../models/message.model");
const Chat = require("../../models/chat.model");
const saveMessage = require("../whatsapp/saveChat");
const { connectToMongoDB } = require("../db");
const sendNextMessage = require("../whatsapp/sendNextMessage");

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const now = new Date();
    const utcTime = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );

    let body = req.body;
    body.timestamp = utcTime;

    await connectToMongoDB();

    let chat = await Chat.findOne({
      _id: body.chatId,
      active: true,
    });

    if (!chat)
      return res
        .status(400)
        .json({ status: 400, message: "Invalid chat id", data: [] });

    body.botId = chat.botId;

    if (
      body?.message?.text?.body !== "BOT_START" &&
      body?.message?.text?.body !== "BOT_CONTINUE"
    ) {
      const msg = await saveMessage({
        ...body,
        message: body.message,
        from: body.from,
        to: body.botId,
        botId: body.botId,
        chatId: body.chatId,
        org: body.org,
      });
    }

    const reply = await sendNextMessage(body, "LIVECHAT");

    return res
      .status(200)
      .json({
        status: 200,
        message: "message added successfully",
        data: reply,
      });
  } catch (error) {
    console.log("Err: ", error);
    return res
      .status(400)
      .json({ status: 400, message: "invalid payload sent", data: [] });
  }
});

router.get("/:chatId", async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;

  const { org } = req?.query;

  const { chatId } = req.params;
  const { page = 1, offset = 20 } = req.query;

  await connectToMongoDB();

  const totalDocuments = await Message.countDocuments({
    chat: new ObjectId(chatId),
    org: org,
    active: true,
  });
  const totalPages = Math.ceil(totalDocuments / offset);

  const skip = (page - 1) * offset;
  const messages = await Message.find({
    chat: new ObjectId(chatId),
    org: org,
    active: true,
  })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(offset);

  // await disconnectFromMongoDB();

  return res
    .status(200)
    .json({
      status: 200,
      message: "Chat Messages",
      data: messages.reverse(),
      pages: totalPages,
      count: totalDocuments,
    });
});

export default router;
