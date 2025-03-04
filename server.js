import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.json());

const apiKey = 'bca4d2d6-95e6-4928-8874-7cbc6f89319c'; 
console.log("API Key in server.js:", apiKey);
// Serve frontend file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "frontend.html"));
});

// Image Generation Route
app.post('/generate-image', async (req, res) => {
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ error: "Missing 'description' in request body." });
    }

    if (!apiKey || apiKey === '') {
        return res.status(500).json({ error: "API Key is missing or not set." });
    }

    try {
        const formData = new URLSearchParams();
        formData.append("text", description + ", ultra-realistic 3D digital art, game character style, Unreal Engine, PBR textures, cinematic lighting, 8K resolution, dynamic shading, volumetric lighting, ray tracing");
        formData.append("width", "1024");  // If DeepAI supports it
        formData.append("height", "1024"); // If DeepAI supports it

        const response = await fetch('https://api.deepai.org/api/text2img', {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();

        if (data.err) {
            console.error("API Error:", data.err);
            return res.status(400).json({ error: data.err });
        }

        if (data.output_url) {
            res.json({ imageUrl: data.output_url });
        } else {
            res.status(400).json({ error: 'Failed to generate image.' });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

console.log("API Key:", apiKey); // Add this line
// Start Server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
