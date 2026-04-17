const express = require("express");
const RFP = require("../models/RFP");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/* =========================
   CREATE RFP
========================= */
router.post("/", protect, async (req, res) => {
  try {
    const { title, clientName, description, deadline, overallStatus } = req.body;

    if (!title || !clientName || !deadline) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const rfp = await RFP.create({
      title,
      clientName,
      description,
      deadline,
      overallStatus: overallStatus || "Draft",
      createdBy: req.user._id,
      sections: [],
      versions: [],
      currentVersion: 1
    });

    res.status(201).json(rfp);
  } catch (error) {
    console.error("Create RFP error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET ALL RFPs
========================= */
router.get("/", protect, async (req, res) => {
  try {
    const rfps = await RFP.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(rfps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET SINGLE RFP
========================= */
router.get("/:id", protect, async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("sections.owner", "name email")
      .populate("sections.questions.assignedTo", "name email")
      .populate("sections.questions.libraryAnswer");

    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    res.json(rfp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   UPDATE RFP
========================= */
router.put("/:id", protect, async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);

    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    rfp.title = req.body.title ?? rfp.title;
    rfp.clientName = req.body.clientName ?? rfp.clientName;
    rfp.description = req.body.description ?? rfp.description;
    rfp.deadline = req.body.deadline ?? rfp.deadline;
    rfp.overallStatus = req.body.overallStatus ?? rfp.overallStatus;

    await rfp.save();

    res.json(rfp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   DELETE RFP
========================= */
router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);

    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    await rfp.deleteOne();

    res.json({ message: "RFP deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   ADD SECTION
========================= */
router.post("/:id/sections", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    const rfp = await RFP.findById(req.params.id);
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    rfp.sections.push({
      title,
      description,
      owner: req.user._id,
      status: "Not Started",
      questions: []
    });

    await rfp.save();

    res.json(rfp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   ADD QUESTION
========================= */
router.post("/:id/sections/:sectionId/questions", protect, async (req, res) => {
  try {
    const { text, notes } = req.body;

    const rfp = await RFP.findById(req.params.id);
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    const section = rfp.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    section.questions.push({
      text,
      notes,
      status: "Not Started"
    });

    await rfp.save();

    res.json(rfp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   UPDATE QUESTION
========================= */
router.put("/:id/sections/:sectionId/questions/:questionId", protect, async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    const section = rfp.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const question = section.questions.id(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.text = req.body.text ?? question.text;
    question.notes = req.body.notes ?? question.notes;
    question.answerHtml = req.body.answerHtml ?? question.answerHtml;
    question.status = req.body.status ?? question.status;
    question.assignedTo = req.body.assignedTo ?? question.assignedTo;
    question.libraryAnswer = req.body.libraryAnswer ?? question.libraryAnswer;

    await rfp.save();

    res.json(rfp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;