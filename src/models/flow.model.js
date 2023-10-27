const { default: mongoose } = require("mongoose");

const flowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },

  nodes: {
    type: Object,
    default: {},
  },

  edges: {
    type: Object,
    default: {},
  },

  primary: {
    type: Boolean,
    default: false,
  },
  info: {
    type: Object,
    default: {},
  },

  bot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bot",
  },

  org: {
    type: String,
    required: true,
  },

  active: {
    type: Boolean,
    default: true,
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

flowSchema.pre("save", function (next) {
  this.updated_at = Date();
  next();
});

flowSchema.pre("findOneAndUpdate", function (next) {
  this.findOneAndUpdate({}, { $set: { updated_at: new Date() } });
  next();
});

module.exports=  mongoose.model("Flow", flowSchema);
