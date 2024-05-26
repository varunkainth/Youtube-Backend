import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description, videos } = req.body;

    //TODO: create playlist
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
      videos: videos.map((videoId) => mongoose.Types.ObjectId(videoId)),
    });
    return res
      .status(201)
      .json(new ApiResponse(201, "Playlist created", playlist));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    //TODO: get user playlists
    const playlists = await Playlist.find({ owner: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, "User playlists", playlists));
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
      .json(new ApiResponse(200, "Playlist found", playlist));
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
      .json(new ApiResponse(200, "Video added to playlist", playlist));
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
    .json(new ApiResponse(200, "Video removed from playlist", playlist));
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
    .json(new ApiResponse(200, "Playlist deleted", playlist));
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
    .json(new ApiResponse(200, "Playlist updated", playlist));
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
