const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/multerSetup");
const {
  uploadPhoto, getFeed, likePhoto, commentPhoto, getUserPhotos, searchPhotos
} = require("../contollers/photoController");

router.post("/upload", auth, upload.single("photo"), uploadPhoto);
router.get("/feed", getFeed);
router.get("/user/:id", getUserPhotos);
router.post("/:id/like", auth, likePhoto);
router.post("/:id/comment", auth, commentPhoto);
router.get("/search", searchPhotos);
router.get("/image/:id", async (req, res) => {
  const photo = await require("../models/Photo").findById(req.params.id);
  if (!photo || !photo.image?.data) return res.status(404).send("Image not found");

  res.set("Content-Type", photo.image.contentType);
  res.send(photo.image.data);
});
router.delete("/delete/:id", auth, async (req, res) => {

  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    
    if (photo.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await photo.remove();
    res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
