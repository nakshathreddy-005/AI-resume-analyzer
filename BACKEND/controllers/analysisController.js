 import Resume from "../models/resumeModel.js";
import OpenAI from "openai";
import fs from "fs";
import pdfParse from "pdf-parse";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { jobRole } = req.body; // optional

        // 1. Get resume from DB
        const resume = await Resume.findById(resumeId);

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // 2. Read file
        const dataBuffer = await fs.promises.readFile(resume.fileUrl);

        // 3. Extract text from PDF
        const pdfData = await pdfParse(dataBuffer);

        // limit text size (important)
        const resumeText = pdfData.text.slice(0, 5000);

        // 4. Send to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: "You are an advanced ATS resume analyzer.",
                },
                {
                    role: "user",
                    content: `
Analyze this resume.

${jobRole ? `Focus more on this role: ${jobRole}` : ""}

Give:
1. ATS score (0–100)
2. 3 improvement suggestions
3. Top 3 suitable job roles
4. Match score for each role
5. Missing skills for each role
6. Short reason for each role match

Return JSON:
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
                    `,
                },
            ],
        });

        // 5. Parse AI response safely
        let analysis;
        try {
            analysis = JSON.parse(response.choices[0].message.content);
        } catch (err) {
            return res.status(500).json({ message: "Invalid AI response format" });
        }

        // 6. Optional validation (extra safety)
        if (
            typeof analysis.atsScore !== "number" ||
            !Array.isArray(analysis.suggestions) ||
            !Array.isArray(analysis.recommendedJobs)
        ) {
            return res.status(500).json({ message: "AI returned unexpected structure" });
        }

        // 7. Save in DB
        resume.analysis = {
            ...analysis,
            roleFocus: jobRole || null,
        };

        await resume.save();

        // 8. Send response
        res.json(resume.analysis);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Analysis failed" });
    }
};