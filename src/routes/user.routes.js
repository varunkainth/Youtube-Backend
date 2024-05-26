import { Router } from "express";
import {
  CoverImageUpdate,
  avatarUpdate,
  changeCurrentPassword,
  getCurrentUser,
  getWatchHistory,
  getuserChannelProfile,
  loginUser,
  logout,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/refreshtoken").post(refreshAccessToken);
router.route("/changepassword").post(verifyJWT, changeCurrentPassword);
router.route("/currentuser").get(verifyJWT, getCurrentUser);
router.route("/updateaccountdetails").patch(verifyJWT, updateAccountDetails);
router
  .route("/image/avatar")
  .patch(verifyJWT, upload.single("avatar"), avatarUpdate);
router
  .route("/image/coverimage")
  .patch(verifyJWT, upload.single("coverimage"), CoverImageUpdate);
router.route("/c/:username").get(verifyJWT, getuserChannelProfile);
router.route("/watchhistory").get(verifyJWT, getWatchHistory);

export default router;
