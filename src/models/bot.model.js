const { default: mongoose } = require("mongoose");

const botSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  channel: {
    type: String,
    default: "",
  },

  restart_cmd: {
    type: String,
    default: "MENU",
  },
  end_cmd: {
    type: String,
    default: "END",
  },

  api_key: {
    type: String,
    default: "",
  },
  key_type: {
    type: String,
    default: "",
  },

  info: {
    type: Object,
    default: {},
  },

  styles: {
    type: Object,
    default: {},
  },

  org: {
    type: String,
    required: true,
  },

  status: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
  },

  is_template: {
    type: Boolean,
    default: false,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },

  created_by: {
    type: String,
    default: "",
  },
  updated_by: {
    type: String,
    default: "",
  },
});

botSchema.pre("save", function (next) {
  this.updated_at = Date();
  next();
});

botSchema.pre("findOneAndUpdate", function (next) {
  this.findOneAndUpdate({}, { $set: { updated_at: new Date() } });
  next();
});

module.exports = mongoose.model("Bot", botSchema);
