import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from 'cloudinary'
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in createPost controller: ", error);
  }


}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const likeUnlikePost = async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);
    // Checking whether the user has already liked or disliked the post
    const isPostLikedByUser = post.likes.includes(req.user._id)
    if (isPostLikedByUser) {
      //unlike the post
      await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } })
      await User.updateOne(req.user._id, { $pull: { likedPosts: req.params.id } })
      await post.save();
      res.status(200).json({ message: " post successfully unliked" })

      console.log('12');
    }
    else {
      //like the post
      await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } })
      await User.updateOne(req.user._id, { $push: { likedPosts: req.params.id } })
      await post.save();
      //send notification to the user
      const notification = new Notification({
        from: req.user._id,
        to: post.user,
        type: "like"
      })
      await notification.save();
      res.status(200).send('post liked sucessfully and notification sent');
    }
  } catch (error) {
    console.log('error in the like/unlike controller ', error);
    res.status(400).json({ error: "internal server error" });
  }

}

export const commentOnPost = async (req, res) => {

  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ error: "Comment must have text" });
    }

    const post = await Post.findById(postId);
    // Create new comment and save it to the database

    const comment = {
      user: userId,
      text
    }

    post.comments.push(comment);
    await post.save();
    res.status(201).json({ message: "Comment added successfully", post });

  } catch (error) {
    console.log("error in comment post controller", error);
    res.status(500).json({ error: "Internal server error" });
  }

}

export const getAllPosts = async (req, res) => {

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }


}

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 }).populate({
        path: "user",
        select: "-password",
      }).populate({
        path: "comments.user",
        select: "-password",
      })

    res.status(200).json(posts);
  } catch (error) {
    console.log('error in likedposts controller', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};