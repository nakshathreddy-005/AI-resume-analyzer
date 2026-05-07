import mongoose from "mongoose";

// Job recommendation schema
const recommendedJobSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    missingSkills: [
        {
            type: String,
        }
    ],
    reason: {
        type: String,
    }
}, { _id: false });

//Analysis schema
const analysisSchema = new mongoose.Schema({
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    suggestions: [
        {
            type: String,
        }
    ],
    recommendedJobs: [recommendedJobSchema],
    roleFocus: {
        type: String,
        default: null,
    }
}, { _id: false });

// Main resume schema
const resumeSchema = new mongoose.Schema({
    fileUrl: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    analysis: analysisSchema,

}, { timestamps: true });

export default mongoose.model("Resume", resumeSchema);