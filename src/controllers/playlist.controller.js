import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description, videos } = req.body;

    if (!name || !description || !videos) {
      throw new ApiError(400, "All fields are required");
    }

    // console.log(videos);
    //TODO: create playlist
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
      videos: videos.map((videoId) =>new  mongoose.Types.ObjectId(videoId)),
    });
    return res
      .status(201)
      .json(new ApiResponse(201, playlist, "Playlist created"));
  } catch (error) {
    console.log(error)
    return res.status(500).json(new ApiError(500, error.message,error));
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    //TODO: get user playlists
    const playlists = await Playlist.find({ owner: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "User playlists"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json(new ApiError(404, "Playlist not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist found"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    //TODO: add video to playlist
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: { videos: videoId },
      },
      { new: true }
    );
    if (!playlist) {
      return res.status(404).json(new ApiError(404, "Playlist not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video added to playlist"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );
  if (!playlist) {
    return res.status(404).json(new ApiError(404, "Playlist not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    return res.status(404).json(new ApiError(404, "Playlist not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    { new: true }
  );
  if (!playlist) {
    return res.status(404).json(new ApiError(404, "Playlist not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
