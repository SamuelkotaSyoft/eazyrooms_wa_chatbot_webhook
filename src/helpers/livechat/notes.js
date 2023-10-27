const { default: mongoose } = require("mongoose");
const express = require("express");

const verifyUser = require("../verifyUser");
const { connectToMongoDB } = require("../db");
const Chat = require("../../models/chat.model");

var router = express.Router();

router.get("/", verifyUser, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { org } = req.user;
  const { chatId } = req.body;

  await connectToMongoDB();

  const chat = await Chat.findOne({
    _id: new ObjectId(chatId),
    org: org,
    active: true,
  });

  // await disconnectFromMongoDB();
  if (chat) {
    return res
      .status(200)
      .json({ status: 200, message: "Notes List", data: chat?.notes || [] });
  } else {
    return res
      .status(404)
      .json({ status: 404, message: "Notes Not found", data: [] });
  }
});

router.post("/", verifyUser, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { org } = req.user;
  const { chatId } = req.body;

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

  const chat = await Chat.findOneAndUpdate(
    {
      _id: new ObjectId(chatId),
      org: org,
      active: true,
    },
    {
      $push: {
        notes: {
          message: req.body.message,
          time: utcTime,
          is_edited: false,
        },
      },
    },
    { new: true }
  );

  // await disconnectFromMongoDB();

  return res
    .status(200)
    .json({ status: 200, message: "Notes added successfully", data: chat });
});

router.put("/:id", verifyUser, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { org } = req.user;
  const { id } = req.params;
  const { chatId } = req.body;
  await connectToMongoDB();

  const now = new Date();
  const utcTime = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );

  const chat = await Chat.findOneAndUpdate(
    {
      _id: new ObjectId(chatId),
      org: org,
      active: true,
      "notes._id": id,
    },
    {
      $set: {
        "notes.$": {
          message: req.body.message,
          time: utcTime,
          is_edited: true,
        },
      },
    },
    { new: true }
  );

  // await disconnectFromMongoDB();
  if (chat) {
    return res
      .status(200)
      .json({ status: 200, message: "Chat Notes updated", data: chat });
  } else {
    return res
      .status(404)
      .json({ status: 404, message: "Notes not found", data: chat });
  }
});

router.delete("/:id", verifyUser, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { org } = req.user;
  const { id } = req.params;
  const { chatId } = req.body;

  await connectToMongoDB();

  const chat = await Chat.findOneAndUpdate(
    {
      _id: new ObjectId(chatId),
      org: org,
      active: true,
    },
    { $pull: { notes: { _id: id } } },
    { new: true }
  );

  // await disconnectFromMongoDB();
  if (chat) {
    return res
      .status(200)
      .json({ status: 200, message: "Chat Notes deleted", data: [] });
  } else {
    return res
      .status(404)
      .json({ status: 404, message: "Notes not found", data: [] });
  }
});

export default router;
