import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Channel } from "../models/subscriber.model.js";
import { User } from "../models/user.model.js";
const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      query = "",
      sortBy,
      sortType,
      userId,
    } = req.query;
    // const skip = (page - 1) * limit;
    // const videos = await Video.find({
    //   $or: [
    //     { title: { $regex: query, $options: "i" } },
    //     { description: { $regex: query, $options: "i" } },
    //     { tags: { $regex: query, $options: "i" } },
    //     ],
    //     userId,
    //     })
    //     .sort({ [sortBy]: sortType })
    //     .skip(skip)
    //     .limit(limit);
    //     const totalVideos = await Video.countDocuments({
    //       $or: [
    //         { title: { $regex: query, $options: "i" } },
    //         { description: { $regex: query, $options: "i" } },
    //         { tags: { $regex: query, $options: "i" } },
    //         ],
    //         userId,
    //         });
    //         const totalPages = Math.ceil(totalVideos / limit);
    //         const response = new ApiResponse(
    //           true,
    //           "Videos fetched successfully",
    //           {
    //             videos,
    //             totalPages,
    //             totalVideos,
    //             }
    //             );
    //             res.status(200).json(response);
    //             } catch (error) {
    //               const response = new ApiResponse(
    //                 false,
    //                 "Videos not fetched",
    //                 error.message
    //                 );

    // Implement search logic based on query parameter
    const searchQuery = {
      title: { $regex: query, $options: "i" },
      description: { $regex: query, $options: "i" },
    };

    let sortCriteria = {};
    if (sortBy && sortType) {
      sortCriteria = { [sortBy]: sortType };
    }

    const videos = await Video.find(searchQuery)
      .sort(sortCriteria)
      .limit(limit)
      .skip((page - 1) * limit);
    // .populate("userId", "name");

    const totalVideos = await Video.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalVideos / limit);

    const response = {
      videos,
      totalVideos,
      page,
      totalPages,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, response, "all videos are fetch "));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, error.message, "error while fetching videos"));
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    // const { userId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const channelId = user.channels;

    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid Channel Id or No channel Id");
    }
    const { title, description } = req.body;
    if (!title || !description) {
      throw new ApiError(400, "Invaild Fields ");
    }

    const channel = await Channel.findOne({ owner: req.user._id });
    if (!channel) {
      throw new ApiError(404, "Channel not found for the user");
    }
    if (
      !req.files ||
      !req.files.videoFile ||
      !req.files.videoFile[0] ||
      !req.files.thumbnail ||
      !req.files.thumbnail[0]
    ) {
      throw new ApiError(400, "Invalid video and thumbnail path");
    }

    const videoLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    if (!videoLocalPath) {
      throw new ApiError(400, "Invaild video path ");
    }
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Invaild  thumbnail path ");
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // const [uploadedVideo, uploadedThumbnail] = await Promise.all([
    //   uploadOnCloudinary(videoLocalPath),
    //   uploadOnCloudinary(thumbnailLocalPath),
    // ]);

    if (!uploadedVideo || !uploadedThumbnail) {
      throw new ApiError(400, "Cannot upload on server || cloudinary ");
    }

    const video = await Video.create({
      title,
      description,
      videoFile: uploadedVideo.url,
      thumbnail: uploadedThumbnail.url,
      duration: uploadedVideo.duration,
      owner: req.user._id,
    });
    if (!video) {
      throw new ApiError(400, "Cannot create video ");
    }

    await Channel.findByIdAndUpdate(
      channelId,
      {
        $push: { videos: video._id },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, video, "video is published successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Some Error from internal server", error.message)
      );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }

  try {
    const video = await Video.findById(videoId).populate("videoFile", "title"); // Assuming userId references a user model

    if (!video) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Video found", { video }));
  } catch (err) {
    //console.error(err);
    res.status(500).json(new ApiError(500, "Error retrieving video"));
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }
  if (!title || !description) {
    throw new ApiError(400, "Invalid video details provided");
  }
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Invalid thumbnail provided");
    }
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadedThumbnail) {
      throw new ApiError(500, "Error uploading thumbnail");
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        title,
        description,
        thumbnail: uploadedThumbnail.url,
      },
      {
        new: true,
      }
    );
    if (!updatedVideo) {
      throw new ApiError(500, "Error updating video");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Video updated", { updatedVideo }));
  } catch (err) {
    //console.error(err);
    res
      .status(500)
      .json(new ApiError(500, "Error updating video", err.message));
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
      throw new ApiError(500, "Error deleting video");
    }
    return res.status(200).json(new ApiResponse(200, "Video deleted"));
  } catch (err) {
    //console.error(err);
    res
      .status(500)
      .json(new ApiError(500, "Error deleting video", err.message));
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle publish status
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { isPublished: !video.isPublished },
      { new: true }
    );
    if (!updatedVideo) {
      throw new ApiError(500, "Error updating video");
    }
    return res.status(200).json(new ApiResponse(200, "Video updated"));
  } catch (err) {
    //console.error(err);
    return res
      .status(500)
      .json(new ApiError(500, "Error updating video", err.message));
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
