import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


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
    const likevideo = await Like.create({ video: videoId, likedBy: req.user._id });
    video.likes++;
  }
  await video.save();
  return res
  .status(200)
  .json(new ApiResponse(200, likevideo,"Video like toggled successfully", ));
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
  const like = await Like.findOne({ comment: commentId, likedBy: req.user._id });
  if (like) {
    await Like.findByIdAndDelete(like._id);
    
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    
  }
  await comment.save();
  return res
  .status(200)
  .json(new ApiResponse(200, { like },"Comment like toggled successfully", ));
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
  const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });
  if (like) {
    await Like.findByIdAndDelete(like._id);
  } else {
    const newLike = await Like.create({ tweet: tweetId, likedBy: req.user._id });
  }
  await tweet.save();
  return res
  .status(200)
  .json(new ApiResponse(200, tweet,"Tweet like toggled successfully", ));
});


const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likes = await Like.find({ user: req.user._id });

  const videos = await Video.find({
    _id: { $in: likes.map((like) => like.video) },
  });
  return res
  .status(200)
  .json(new ApiResponse(200,{
    likes,videos
  } ,"Liked videos fetched successfully", ));

});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
