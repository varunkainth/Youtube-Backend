import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const comments = await Comment.find({ video:videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Comment.countDocuments({ video:videoId });
  const totalPages = Math.ceil(total / limit);
  const nextPage = page + 1 > totalPages ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  const response = new ApiResponse(200, {
    comments,
    total,
    totalPages,
    nextPage,
    prevPage,
  });
  res.status(200).json(response);
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { text } = req.body;
  const comment = await Comment.create({
    video: videoId,
    content: text,
    user: req.user._id,
  });
  res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { text } = req.body;
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId },
    { content:text },
    { new: true }
  );
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const comment = await Comment.findOneAndDelete({ _id: commentId });
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
