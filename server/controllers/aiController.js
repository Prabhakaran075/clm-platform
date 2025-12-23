const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require('pdf-parse');
const fs = require('fs');

const extractContractData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        const text = data.text;

        // Cleanup the temp file after parsing
        fs.unlinkSync(req.file.path);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'AIzaSyAdQ3-7wdH58s_a19asSPc3Pidyj071ssU') {
            console.warn("GEMINI_API_KEY is missing. Returning mock data.");
            return res.json({
                title: "Sample Extract (Provide Gemini Key)",
                vendor: null,
                startDate: "2024-01-01",
                endDate: "2025-12-31",
                amount: 50000,
                currency: "INR",
                department: "General",
                content: text.substring(0, 500) + "..."
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Extract the following metadata from the provided contract text and return ONLY as a valid JSON object.
            Required fields:
            - title: The name or title of the contract.
            - vendor: The name of the vendor/party providing services.
            - startDate: The start date in YYYY-MM-DD format.
            - endDate: The end date in YYYY-MM-DD format.
            - amount: The total contract value as a number.
            - currency: The currency code (e.g., INR, USD).
            - department: One of [IT, HR, Legal, Sales, Finance, General].
            - content: A summary of the contract (max 200 words).

            Contract Text:
            ${text}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text().trim();
        let jsonText = rawText;

        // More robust JSON extraction
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        try {
            const extractedData = JSON.parse(jsonText);
            res.json(extractedData);
        } catch (parseError) {
            console.error("AI returned invalid JSON. Raw:", rawText);
            res.status(500).json({
                message: "AI returned invalid JSON format",
                rawResponse: rawText
            });
        }

    } catch (error) {
        console.error('AI Extraction Error:', error);
        res.status(500).json({ message: error.message || 'AI Extraction Failed' });
    }
};

module.exports = { extractContractData };
