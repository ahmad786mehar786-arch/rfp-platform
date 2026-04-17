const express = require("express");
const Library = require("../models/Library");
const ActivityLog = require("../models/ActivityLog");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const logActivity = async (userId, action, entityType, entityId, details = {}) => {
  await ActivityLog.create({
    user: userId,
    action,
    entityType,
    entityId: String(entityId),
    details
  });
};

router.post("/", protect, async (req, res) => {
  try {
    const item = await Library.create({
      ...req.body,
      createdBy: req.user._id
    });

    await logActivity(req.user._id, "Created library answer", "Library", item._id, {
      title: item.title
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { answerHtml: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }
    if (category) filter.category = category;

    const items = await Library.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const item = await Library.findById(req.params.id).populate("createdBy", "name email");
    if (!item) return res.status(404).json({ message: "Library item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const item = await Library.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Library item not found" });

    item.title = req.body.title ?? item.title;
    item.category = req.body.category ?? item.category;
    item.tags = req.body.tags ?? item.tags;
    item.answerHtml = req.body.answerHtml ?? item.answerHtml;

    await item.save();

    await logActivity(req.user._id, "Updated library answer", "Library", item._id, {
      title: item.title
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const item = await Library.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Library item not found" });

    await item.deleteOne();

    await logActivity(req.user._id, "Deleted library answer", "Library", req.params.id);

    res.json({ message: "Library item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
