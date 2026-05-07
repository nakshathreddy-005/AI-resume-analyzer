 // controllers/analysisController.js

// controllers/analysisController.js

import Resume from "../models/resumeModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfParseModule from "pdf-parse";

const pdfParse =
    pdfParseModule.default || pdfParseModule;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

export const analyzeResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { jobRole } = req.body;

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

        // 3. Validate content type
        const contentType =
            response.headers.get(
                "content-type"
            );

        console.log(
            "PDF Content-Type:",
            contentType
        );

        if (
            !contentType ||
            !contentType.includes("pdf")
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Uploaded file is not a valid PDF",
            });
        }

        // 4. Convert response to buffer
        const arrayBuffer =
            await response.arrayBuffer();

        const dataBuffer = Buffer.from(
            arrayBuffer
        );

        // 5. Extract text from PDF
        const pdfData = await pdfParse(
            dataBuffer
        );

        // 6. Clean and limit text size
        const resumeText = pdfData.text
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 5000);

        // 7. Gemini model
        const model =
            genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
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

        // 14. Return response
        return res.status(200).json({
            success: true,
            data: resume.analysis,
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