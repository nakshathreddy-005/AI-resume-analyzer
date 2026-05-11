// controllers/analysisController.js

import Resume from "../models/resumeModel.js";
import Job from "../models/jobmodel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";

export const analyzeResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { jobRole } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is not configured",
            });
        }

        // Initialize after dotenv has loaded in server.js.
        const genAI = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY
        );

        // 1. Find resume
        const resume = await Resume.findById(
            resumeId
        );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found",
            });
        }

        if (
            resume.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to analyze this resume",
            });
        }

        // 2. Fetch PDF from Cloudinary URL
        const response = await fetch(
            resume.fileUrl
        );

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                message:
                    "Failed to fetch resume PDF",
            });
        }

        // 3. Log content type. Cloudinary raw uploads often return
        // application/octet-stream even for valid PDFs.
        const contentType =
            response.headers.get(
                "content-type"
            );

        console.log(
            "PDF Content-Type:",
            contentType
        );

        // 4. Convert response to buffer
        const arrayBuffer =
            await response.arrayBuffer();

        const dataBuffer = Buffer.from(
            arrayBuffer
        );

        if (
            dataBuffer
                .subarray(0, 5)
                .toString() !== "%PDF-"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Uploaded file is not a valid PDF",
            });
        }

        // 5. Extract text from PDF
        const parser = new PDFParse({
            data: dataBuffer,
        });
        const pdfData = await parser.getText();
        await parser.destroy();

        // 6. Clean and limit text size
        const resumeText = pdfData.text
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 5000);

        if (!resumeText) {
            return res.status(400).json({
                success: false,
                message:
                    "Could not extract text from the PDF",
            });
        }

        // 7. Gemini model
        const model =
            genAI.getGenerativeModel({
                model:
                    process.env.GEMINI_MODEL ||
                    "gemini-2.5-flash",
            });

        // 8. Prompt
        const prompt = `
You are an advanced ATS Resume Analyzer.

Analyze this resume carefully.

${
    jobRole
        ? `Target Role: ${jobRole}`
        : ""
}

Give:
1. ATS score (0-100)
2. 3 improvement suggestions
3. Top 3 suitable job roles
4. Match score for each role
5. Missing skills for each role
6. Short reason for each role match

Return ONLY valid JSON in this exact format:

{
  "atsScore": number,
  "suggestions": [string],
  "recommendedJobs": [
    {
      "role": string,
      "matchScore": number,
      "missingSkills": [string],
      "reason": string
    }
  ]
}

Resume:
${resumeText}
        `;

        // 9. Generate AI response
        const result =
            await model.generateContent(
                prompt
            );

        const text =
            result.response.text();

        // 10. Clean markdown formatting
        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // 11. Parse JSON safely
        let analysis;

        try {
            analysis = JSON.parse(
                cleanText
            );
        } catch (error) {
            console.error(
                "AI JSON Parse Error:",
                cleanText
            );

            return res.status(500).json({
                success: false,
                message:
                    "Invalid AI response format",
            });
        }

        // 12. Validate structure
        if (
            typeof analysis.atsScore !==
                "number" ||
            !Array.isArray(
                analysis.suggestions
            ) ||
            !Array.isArray(
                analysis.recommendedJobs
            )
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "AI returned unexpected structure",
            });
        }

        // 13. Save analysis
        resume.analysis = {
            ...analysis,
            roleFocus: jobRole || null,
        };

        await resume.save();

        const recommendedJobs =
            analysis.recommendedJobs.map((job) => ({
                resume: resume._id,
                user: req.user._id,
                role: job.role,
                matchScore: job.matchScore,
                missingSkills:
                    job.missingSkills || [],
                reason: job.reason,
                roleFocus: jobRole || null,
            }));

        await Job.deleteMany({
            resume: resume._id,
        });

        const savedJobs =
            await Job.insertMany(
                recommendedJobs
            );

        // 14. Return response
        return res.status(200).json({
            success: true,
            data: resume.analysis,
            jobs: savedJobs,
        });

    } catch (error) {
        console.error(
            "Resume Analysis Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Analysis failed",
        });
    }
};
