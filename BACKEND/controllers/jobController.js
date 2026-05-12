import Job from "../models/jobmodel.js";

// Create job
export const createJob = async (req, res) => {
    try {
        const {
            resume,
            role,
            matchScore,
            missingSkills,
            reason,
            roleFocus,
        } = req.body;

        const job = await Job.create({
            resume,
            user: req.user._id,
            role,
            matchScore,
            missingSkills,
            reason,
            roleFocus,
        });

        res.status(201).json(job);

    } catch (err) {
        res.status(500).json({ message: "Job creation failed" });
    }
};

// Get all jobs
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
};

//Get single job
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);

    } catch (err) {
        res.status(500).json({ message: "Error fetching job" });
    }
};
