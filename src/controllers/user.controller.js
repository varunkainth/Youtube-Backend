import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asynchandle.js";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // vaildation --> not empty
  //check if user is already exist : username , email
  // if not exist create user
  //check for images and check for avatar
  // upload them to cloudinary
  // create user object --> create entry for DB
  // send response to frontend and remove password and refresh token field from response
  // check the response for user creation
  // if user is created send response to frontend
  // if user is not created send error message to frontend

  const { fullname, username, email, password } = req.body;
  // if(fullname===""){
  //   throw new ApiError(400,"FullName is required")
  // }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  // console.log(req.body);
  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverimage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverImageLocalPath = req.files.coverimage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
  const coverimageCloudinary = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarCloudinary) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatarCloudinary.url,
    coverimage: coverimageCloudinary?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering User");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User registered Successfully....")
    );

  // console.log("email: ", email, "\n fullname:", fullname);
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  // console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized and invaild token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refresh } = await generateAccessAndRefereshTokens(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshAccessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refresh },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invaild refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invaild Password");
  }

  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change SuccessFully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Deatils Fetch Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!(fullname || email)) {
    throw new ApiError(400, "All Field are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  // const user = await User.findById(req.user?._id);
  // if (fullname) {
  //   user.fullname = fullname;
  // }
  // if (email) {
  //   user.email = email;
  // }
  // await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

const avatarUpdate = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please Upload a Valid Image");
  }

  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUrl) {
    throw new ApiError(400, "Something Went Wrong on AvatarUpdate");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUrl.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});

const CoverImageUpdate = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Please Upload a Valid Image");
  }

  const coverimageUrl = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverimageUrl) {
    throw new ApiError(400, "Something Went Wrong on Cover Image Update");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage: coverimageUrl.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"));
});

const getuserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is not found");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(), // lowercase
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        ChannelsubscribeToCount: { $size: "$subscribeTo" },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"], // check if user is subscribed to channel
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        ChannelsubscribeToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverimage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }
  console.log(channel);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetch successfully"
      )
    );
});

export {
  getuserChannelProfile,
  registerUser,
  refreshAccessToken,
  loginUser,
  logout,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  avatarUpdate,
  CoverImageUpdate,
  getWatchHistory,
};
