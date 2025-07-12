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

module.exports = router;
