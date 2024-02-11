"use server";
import mongoose from "mongoose";
import { init, createId } from "@paralleldrive/cuid2";
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority`,
);

const createSecretId = init({
  random: Math.random,
  length: Number(process.env.SECRET_ID_LENGTH) || 10,
  fingerprint: process.env.SECRET_ID_FINGERPRINT || createId(),
});
const secretSchema = new mongoose.Schema({
  secretId: {
    type: String,
    default: createSecretId(),
  },
  secretContent: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, expires: 60 },
});
const Secret = mongoose.models.Secrets || mongoose.model("Secrets", secretSchema);
export default Secret;
