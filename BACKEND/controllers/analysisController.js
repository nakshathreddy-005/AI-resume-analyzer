// controllers/analysisController.js

import Resume from "../models/resumeModel.js";
import Job from "../models/jobmodel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";

const getGeminiModel = () => {
    const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
    );

    return genAI.getGenerativeModel({
        model:
            process.env.GEMINI_MODEL ||
            "gemini-2.5-flash",
    });
};

const getOwnedResume = async (resumeId, userId) => {
    const resume = await Resume.findById(
        resumeId
    );

    if (!resume) {
        return {
            error: {
                status: 404,
                body: {
                    success: false,
                    message: "Resume not found",
                },
            },
        };
    }

    if (
        resume.user.toString() !==
        userId.toString()
    ) {
        return {
            error: {
                status: 403,
                body: {
                    success: false,
                    message:
                        "You are not allowed to access this resume",
                },
            },
        };
    }

    return { resume };
};

const extractResumeText = async (resume) => {
    const response = await fetch(
        resume.fileUrl
    );

    if (!response.ok) {
        return {
            error: {
                status: 400,
                body: {
                    success: false,
                    message:
                        "Failed to fetch resume PDF",
                },
            },
        };
    }

    // Cloudinary raw uploads may return application/octet-stream for PDFs.
    console.log(
        "PDF Content-Type:",
        response.headers.get("content-type")
    );

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
        return {
            error: {
                status: 400,
                body: {
                    success: false,
                    message:
                        "Uploaded file is not a valid PDF",
                },
            },
        };
    }

    const parser = new PDFParse({
        data: dataBuffer,
    });
    const pdfData = await parser.getText();
    await parser.destroy();

    const resumeText = pdfData.text
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);

    if (!resumeText) {
        return {
            error: {
                status: 400,
                body: {
                    success: false,
                    message:
                        "Could not extract text from the PDF",
                },
            },
        };
    }

    return { resumeText };
};

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

        const { resume, error: resumeError } =
            await getOwnedResume(
                resumeId,
                req.user._id
            );

        if (resumeError) {
            return res
                .status(resumeError.status)
                .json(resumeError.body);
        }

        const {
            resumeText,
            error: extractError,
        } = await extractResumeText(
            resume
        );

        if (extractError) {
            return res
                .status(extractError.status)
                .json(extractError.body);
        }

        const model = getGeminiModel();

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

        const result =
            await model.generateContent(
                prompt
            );

        const text =
            result.response.text();

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let analysis;

        try {
            analysis = JSON.parse(
                cleanText
            );
        } catch {
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

        resume.analysis = {
            ...analysis,
            roleFocus: jobRole || null,
            modifiedResume:
                resume.analysis?.modifiedResume ||
                null,
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

export const rewriteResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { jobRole } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is not configured",
            });
        }

        const { resume, error: resumeError } =
            await getOwnedResume(
                resumeId,
                req.user._id
            );

        if (resumeError) {
            return res
                .status(resumeError.status)
                .json(resumeError.body);
        }

        const {
            resumeText,
            error: extractError,
        } = await extractResumeText(
            resume
        );

        if (extractError) {
            return res
                .status(extractError.status)
                .json(extractError.body);
        }

        const model = getGeminiModel();
        const suggestions =
            resume.analysis?.suggestions || [];
        const missingSkills = [
            ...new Set(
                (
                    resume.analysis
                        ?.recommendedJobs || []
                )
                    .flatMap(
                        (job) =>
                            job.missingSkills ||
                            []
                    )
                    .filter(Boolean)
            ),
        ];
        const roleFocus =
            jobRole ||
            resume.analysis?.roleFocus ||
            "";

        const prompt = `
You are an expert resume writer and ATS optimizer.

Rewrite the resume into a polished, ATS-friendly plain text resume.

Rules:
- Do not invent companies, dates, degrees, certifications, tools, metrics, or experience.
- Preserve the candidate's factual background.
- Improve wording, section order, clarity, action verbs, and keyword alignment.
- If a target role is provided, tailor the summary and skills toward that role.
- Use clean plain text with clear section headings.
- Return ONLY the rewritten resume text. Do not add markdown fences or commentary.

Target Role:
${roleFocus || "General professional resume"}

Suggestions to apply:
${suggestions.length ? suggestions.join("\n") : "No previous suggestions available."}

Relevant missing skills to consider only if already supported by the resume:
${missingSkills.length ? missingSkills.join(", ") : "None"}

Original Resume:
${resumeText}
        `;

        const result =
            await model.generateContent(
                prompt
            );

        const modifiedResume =
            result.response
                .text()
                .replace(/```[a-z]*\n?/gi, "")
                .replace(/```/g, "")
                .trim();

        if (!modifiedResume) {
            return res.status(500).json({
                success: false,
                message:
                    "Could not generate modified resume",
            });
        }

        resume.analysis = {
            ...(resume.analysis?.toObject?.() ||
                resume.analysis ||
                {}),
            roleFocus: roleFocus || null,
            modifiedResume,
        };

        await resume.save();

        return res.status(200).json({
            success: true,
            data: {
                modifiedResume,
                roleFocus: roleFocus || null,
            },
        });
    } catch (error) {
        console.error(
            "Resume Rewrite Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Resume rewrite failed",
        });
    }
};
