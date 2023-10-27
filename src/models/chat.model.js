const mongoose = require("mongoose");
const chatSchema = mongoose.Schema({
  name: {
    type: String,
    default: "CHAT",
  },

  description: {
    type: String,
    default: "NA",
  },

  image: {
    type: String,
    default: "NA",
  },

  members: [
    {
      id: String,
      name: String,
      joined_at: Date,
      show_previous_chat: Boolean,
      userType: String,
    },
  ],

  chatType: {
    type: String,
    enum: ["WHATSAPP", "LIVECHAT", "TEAMCHAT"],
  },

  variables: {
    type: Object,
  },

  flow_node: [
    {
      flow: String,
      node: String,
    },
  ],

  notes: [
    {
      message: String,
      time: Date,
      is_edited: Boolean,
    },
  ],

  unread_count: {
    type: Number,
    default: 0,
  },

  last_message: {
    type: String,
    default: "NA",
  },

  info: {
    type: Object,
  },

  active: {
    type: Boolean,
    default: true,
  },

  org: {
    type: String,
  },

  botId: {
    type: String,
  },

  created_by: {
    type: String,
    default: "NA",
  },

  updated_by: {
    type: String,
    default: "NA",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

chatSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

chatSchema.pre("findOneAndUpdate", function (next) {
  this.findOneAndUpdate({}, { $set: { updatedAt: new Date() } });
  next();
});

module.exports = mongoose.model("Chat", chatSchema);
