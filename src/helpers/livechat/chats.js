const express = require("express");
const mongoose = require("mongoose");
// const verifyToken = require("../verifyToken");
var router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const { org, id } = req.user;
    const { page = 1, offset = 20, assigned = "" } = req.query;

    let membersCondition = {
      $not: {
        $elemMatch: { userType: "STAFF" },
      },
    };
    if (assigned) {
      membersCondition = {
        $elemMatch: { id: id },
      };
    }
    // await connectToMongoDB();

    const totalDocuments = await Chat.countDocuments({
      org: org,
      active: true,
      $or: [{ chatType: "WHATSAPP" }, { chatType: "LIVECHAT" }],
      members: {
        ...membersCondition,
      },
    });
    const totalPages = Math.ceil(totalDocuments / offset);

    const skip = (page - 1) * offset;

    let chats = await Chat.find({
      org: org,
      active: true,
      $or: [{ chatType: "WHATSAPP" }, { chatType: "LIVECHAT" }],
      members: {
        ...membersCondition,
      },
    })
      .select([
        "members",
        "_id",
        "chatType",
        "created_at",
        "updated_at",
        "unread_count",
        "last_message",
        "variables",
      ])
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(offset);

    // await disconnectFromMongoDB();

    return res.status(200).json({
      status: 200,
      message: "Chat Messages",
      data: chats,
      pages: totalPages,
      count: totalDocuments,
    });
  } catch (error) {
    console.log("ERR", error);
    res.status(500).json({
      status: 500,
      message: "Server error please try after some time",
      data: [],
    });
  }
});

router.get("/:chatId", verifyToken, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { org } = req.user;
  const { chatId } = req.params;

  // await connectToMongoDB();

  const chat = await Chat.findOne({
    _id: new ObjectId(chatId),
    org: org,
    active: true,
  }).select([
    "members",
    "_id",
    "chatType",
    "created_at",
    "updated_at",
    "notes",
    "variables",
  ]);

  // await disconnectFromMongoDB();

  return res
    .status(200)
    .json({ status: 200, message: "Chat Messages", data: chat });
});

router.get("/:chatId/join", verifyToken, async (req, res) => {
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

    const ObjectId = mongoose.Types.ObjectId;
    const { org, id } = req.user;

    const { chatId } = req.params;

    // await connectToMongoDB();

    const chat = await Chat.findOneAndUpdate(
      {
        _id: new ObjectId(chatId),
        org: org,
        active: true,
        $or: [{ chatType: "WHATSAPP" }, { chatType: "LIVECHAT" }],
        members: {
          $not: {
            $elemMatch: { userType: "STAFF" },
          },
        },
      },
      {
        $push: {
          members: {
            id: id,
            name: "NA",
            joined_at: utcTime,
            show_previous_chat: true,
            userType: "STAFF",
          },
        },
      },
      { new: true }
    ).select([
      "members",
      "_id",
      "chatType",
      "created_at",
      "updated_at",
      "notes",
      "variables",
    ]);

    if (chat) {
      return res
        .status(200)
        .json({ status: 200, message: "Chat Messages", data: chat });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid Payload Sent", data: [] });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server Error, try after some time",
      data: [],
    });
  }
});

router.post("/:chatId/add", verifyToken, async (req, res) => {
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

    const ObjectId = mongoose.Types.ObjectId;
    const { org, id } = req.user;

    const { staff } = req.body;

    const { chatId } = req.params;

    // await connectToMongoDB();

    const chat = await Chat.findOneAndUpdate(
      {
        _id: new ObjectId(chatId),
        org: org,
        active: true,
        $or: [{ chatType: "WHATSAPP" }, { chatType: "LIVECHAT" }],
        members: {
          $elemMatch: { id: id },
        },
        "members.id": { $ne: staff },
      },
      {
        $push: {
          members: {
            id: staff,
            name: "NA",
            joined_at: utcTime,
            show_previous_chat: true,
            userType: "STAFF",
          },
        },
      },
      { new: true }
    ).select([
      "members",
      "_id",
      "chatType",
      "created_at",
      "updated_at",
      "notes",
      "variables",
    ]);

    if (chat) {
      return res
        .status(200)
        .json({ status: 200, message: "Chat Messages", data: chat });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid Payload Sent", data: [] });
    }
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      status: 500,
      message: "Server Error, try after some time",
      data: [],
    });
  }
});

router.post("/:chatId/transfer", verifyToken, async (req, res) => {
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

    const ObjectId = mongoose.Types.ObjectId;
    const { org, id } = req.user;
    const { staff } = req.body;

    const { chatId } = req.params;

    // await connectToMongoDB();

    let chat = await Chat.findOneAndUpdate(
      {
        _id: new ObjectId(chatId),
        org: org,
        active: true,
        $or: [{ chatType: "WHATSAPP" }, { chatType: "LIVECHAT" }],
        members: {
          $elemMatch: { id: id },
        },
      },
      {
        $pull: { members: { id: id } },
      },
      { new: true }
    );

    chat = await Chat.findOneAndUpdate(
      {
        _id: chat?._id,
      },
      {
        $push: {
          members: {
            id: staff,
            name: "NA",
            joined_at: utcTime,
            show_previous_chat: true,
            userType: "STAFF",
          },
        },
      },
      { new: true }
    ).select([
      "members",
      "_id",
      "chatType",
      "created_at",
      "updated_at",
      "notes",
      "variables",
    ]);

    if (chat) {
      return res
        .status(200)
        .json({ status: 200, message: "Chat Messages", data: chat });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid Payload Sent", data: [] });
    }
  } catch (error) {
    console.log("Err", error);
    return res.status(500).json({
      status: 500,
      message: "Server Error, try after some time",
      data: [],
    });
  }
});

module.exports = router;
