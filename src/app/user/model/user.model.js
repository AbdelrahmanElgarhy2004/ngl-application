// schema
import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {

    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: function () {
        return this.provider === 'local';
      }
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    dob: Date,
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    profilePicPath: String,
    coverImagePaths: [String],
    cvPath: String,
    twoStepVerification: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true }
  }
)


export const User = model('User', userSchema);