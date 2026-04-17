const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      default: ""
    },
    answerHtml: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    libraryAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  { _id: true, timestamps: true }
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started"
    },
    questions: [questionSchema]
  },
  { _id: true, timestamps: true }
);

const versionSchema = new mongoose.Schema(
  {
    versionNumber: Number,
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    note: {
      type: String,
      default: "Draft save"
    },
    snapshot: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
);

const rfpSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    deadline: {
      type: Date,
      required: true
    },
    overallStatus: {
      type: String,
      enum: ["Draft", "In Progress", "Submitted", "Overdue"],
      default: "Draft"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sections: [sectionSchema],
    versions: [versionSchema],
    currentVersion: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RFP", rfpSchema);
