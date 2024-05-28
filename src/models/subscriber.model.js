import mongoose, { Schema } from "mongoose";

// Channel Schema
const channelSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  subscriberCount: { type: Number, default: 0 },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
},{
  timestamps: true
});

// Subscriber Schema
const subscriberSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscribedChannels: [
    {
      channelId: { type: Schema.Types.ObjectId, ref: "Channel" },
      subscribedAt: { type: Date, default: Date.now },
    },
  ],
},{
  timestamps: true
}
);

// Subscription Schema
const subscriptionSchema = new Schema({
  subscriberId: {
    type: Schema.Types.ObjectId,
    ref: "Subscriber",
    required: true,
  },
  channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Channel = mongoose.model("Channel", channelSchema);
const Subscriber = mongoose.model("Subscriber", subscriberSchema);
const Subscription = mongoose.model("Subscription", subscriptionSchema);

export { Channel, Subscriber, Subscription };
