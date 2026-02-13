// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Common fields for all users
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ensures uniqueness at DB level
      lowercase: true,
      trim: true,
    },
    phone:{
      type:String,
      trim:true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "owner", "staff"],
      default: "staff",
    },
    ownerId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: function () {
        return this.role === "staff";
      }
    }
,
    // Only for owner and staff
    image: {
      type: String,
      default: "/default.jpg",
    },
    shopName: {
      type: String,
      required: [
        function () {
          return this.role !== "admin";
        },
        "shopName is required for non-admin users",
      ],
    },

    // Staff-only fields
    staffEmail: {
      type: String,
      required: [
        function () {
          return this.role === "staff";
        },
        "staffEmail is required for staff users",
      ],
    },
    jobTitle: {
      type: String,
      default: "staff",
    },
    staffPhone: {
      type: String,
      required: [
        function () {
          return this.role === "staff";
        },
        "staffPhone is required for staff users",
      ],
    },
    staffAddress: {
      type: String,
    },
    salary: {
      type: Number,
      default: 0,
    },

    // Permissions controlled by owner (for staff)
    permissions: {
      canEdit: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
    },

    // Admin control
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // SuperAdmin toggle for full admin rights
    superAdmin: {
      type: Boolean,
      default: false,
    },

    resetPasswordOTP: {
    type: String,
    default: undefined,
  },
  resetPasswordOTPExpire: {
    type: Date,
    default: undefined,
  },
  resetPasswordOTPAttempts: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: {
    type: String,
    default: undefined,
  },
  resetPasswordTokenExpire: {
    type: Date,
    default: undefined,
  },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Optional: compound index to speed up search by shopName and role
userSchema.index({ shopName: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
