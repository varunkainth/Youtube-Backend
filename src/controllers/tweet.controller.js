import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  try {
    const { text } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    const tweet = await Tweet.create(
      { content: text, user: user._id },
      {
        new: true,
      }
    );
    return res.status(201).json(new ApiResponse(201, tweet));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error.message));
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    const tweets = await Tweet.find({ user: user._id });
    return res.status(200).json(new ApiResponse(200, tweets));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error.message));
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new ApiError(400, "Invalid id");
    const tweet = await Tweet.findById(id);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (tweet.user.toString() !== user._id.toString())
      throw new ApiError(403, "You are not authorized to update this tweet");
    const updatedTweet = await Tweet.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(new ApiResponse(200, updatedTweet));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error.message));
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw new ApiError(400, "Invalid id");
    const tweet = await Tweet.findById(id);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (tweet.user.toString() !== user._id.toString())
      throw new ApiError(403, "You are not authorized to delete this tweet");
    await Tweet.findByIdAndDelete(id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error.message));
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
