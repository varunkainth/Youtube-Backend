import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const like = await Like.findOne({ video: videoId, likedBy: req.user._id });
  if (like) {
    await Like.findByIdAndDelete(like._id);
    video.likes--;
  } else {
    const newLike = await Like.create({ video: videoId, likedBy: req.user._id });
    video.likes++;
  }
  await video.save();
  return new ApiResponse(200, "Like toggled",);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  const like = await Like.findOne({ comment: commentId, user: req.user._id });
  if (like) {
    await Like.findByIdAndDelete(like._id);
    comment.likes--;
  } else {
    const newLike = await Like.create({
      comment: commentId,
      user: req.user._id,
    });
    comment.likes++;
  }
  await comment.save();
  return new ApiResponse(200, "Like toggled", { like: comment.likes });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  const like = await Like.findOne({ tweet: tweetId, user: req.user._id });
  if (like) {
    await Like.findByIdAndDelete(like._id);
    tweet.likes--;
  } else {
    const newLike = await Like.create({ tweet: tweetId, user: req.user._id });
    tweet.likes++;
  }
  await tweet.save();
  return new ApiResponse(200, "Like toggled", { like: tweet.likes });
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likes = await Like.find({ user: req.user._id });
  const videos = await Video.find({
    _id: { $in: likes.map((like) => like.video) },
  });
  return new ApiResponse(200, "Liked videos", videos);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
