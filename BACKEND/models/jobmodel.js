import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
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
    },
    roleFocus: {
        type: String,
        default: null,
    },
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
