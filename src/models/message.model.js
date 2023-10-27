const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bot",
  },

  from: {
    type: String,
  },

  to: {
    type: String,
  },

  payload: {
    type: Object,
  },

  read_recipts: [
    {
      id: String,
      seen_at: Date,
    },
  ],
  message_type: {
    type: String,
    default: "text",
  },

  active: {
    type: Boolean,
    default: true,
  },

  org: {
    type: String,
  },

  info: {
    type: Object,
  },

  created_by: {
    type: String,
  },

  updated_by: {
    type: String,
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

messageSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

messageSchema.pre("findOneAndUpdate", function (next) {
  this.findOneAndUpdate({}, { $set: { updatedAt: new Date() } });
  next();
});

module.exports = mongoose.model("Message", messageSchema);
