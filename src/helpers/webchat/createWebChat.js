const express = require("express");

const Chat = require("../../models/chat.model");
const { connectToMongoDB } = require("../db");

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

    await connectToMongoDB();

    const { org, botId } = req.body;

    const toType = "BOT";
    const fromType = "USER";

    const from = generateRandomAlphaNumeric();
    const to = botId;

    let chat = await new Chat({
      org: org,
      members: [
        {
          id: to,
          joined_at: utcTime,
          show_previous_chat: true,
          userType: toType,
        },
        {
          id: from,
          joined_at: utcTime,
          show_previous_chat: true,
          userType: fromType,
        },
      ],
      chatType: "LIVECHAT",
      botId: botId,
    }).save();

    res
      .status(200)
      .json({
        status: 200,
        message: "chat created successfully",
        data: chat,
        userId: from,
      });
  } catch (error) {
    console.log("Err: ", error);
    res
      .status(400)
      .json({ status: 400, message: "invalid payload sent", data: [] });
  }
});

function generateRandomAlphaNumeric() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

export default router;
