const Photo = require("../models/Photo");
const User = require("../models/User");
const path = require("path");


exports.uploadPhoto = async (req, res) => {
  try {
    const { caption, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newPhoto = await Photo.create({
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      caption,
      tags: tags?.split(",") || [],
      user: req.userId,
    });

    res.status(201).json({ message: "Photo uploaded", id: newPhoto._id });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


exports.getFeed = async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    const response = photos.map(p => ({
      ...p.toObject(),
      imageUrl: `/api/photos/image/${p._id}`
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feed", error: err.message });
  }
};


exports.likePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const index = photo.likes.indexOf(req.userId);

    if (index === -1) {
      // Like
      photo.likes.push(req.userId);

      if (photo.user.toString() !== req.userId) {
        await User.findByIdAndUpdate(photo.user, {
          $push: {
            notifications: {
              type: "like",
              photo: photo._id,
              fromUser: req.userId,
              message: "liked your photo"
            }
          }
        });
      }

    } else {
      // Unlike
      photo.likes.splice(index, 1);
    }

    await photo.save();
    res.json({ message: "Like status updated", likes: photo.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Like failed", error: err.message });
  }
};



exports.commentPhoto = async (req, res) => {
  try {
    const { text } = req.body;
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    photo.comments.push({ text, user: req.userId });
    await photo.save();
    if (photo.user.toString() !== req.userId) {
  await User.findByIdAndUpdate(photo.user, {
    $push: {
      notifications: {
        type: "comment",
        photo: photo._id,
        fromUser: req.userId,
        message: "commented on your photo"
      }
    }
  });
}
    res.json({ message: "Comment added" });
  } catch (err) {
    res.status(500).json({ message: "Comment failed", error: err.message });
  }
};


exports.getUserPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch user's photos", error: err.message });
  }
};

exports.searchPhotos = async (req, res) => {
try {
 const q = req.query.q;
 const users = await User.find({ username: new RegExp(q, "i") });
 const userIds = users.map((u) => u._id);

 const photos = await Photo.find({
  $or: [
 { tags: { $in: [q] } },
 { user: { $in: userIds } },
],
 })
 .populate("user", "username")
 .populate("comments.user", "username") 
 .sort({ createdAt: -1 });

const response = photos.map(p => ({
...p.toObject(),
 imageUrl: `/api/photos/image/${p._id}`
  }));

  res.json(response);
 } catch (err) {
  res.status(500).json({ message: "Search failed", error: err.message });
 }
};
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    res.json({ message: "Photo deleted" });
  }
  catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

