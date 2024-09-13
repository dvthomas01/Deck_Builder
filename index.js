import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import fetch from 'node-fetch';
import { config } from 'dotenv';

// Initialize dotenv (locally, Vercel will handle this in production)
config();

const app = express();
const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Helper Function for OpenAI
async function classifyIntent(text) {
    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are an AI assistant specialized in Yu-Gi-Oh! deck building.' },
                { role: 'user', content: `Help with deck building: "${text}"` }
            ],
            max_tokens: 100,
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    }
}

// Define the /advisor endpoint
app.post('/advisor', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const response = await classifyIntent(question);
        res.json({ answer: response });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/favorites", (req, res) => {
    res.render("favorite.ejs");
});

app.get("/advisor", (req, res) => {
    res.render("advisor.ejs");
});

// Card search POST request
app.post("/post-cards", async (req, res) => {
    const { cardName, fName, attribute, archetype, type, level, race } = req.body;
    let URL = API_URL;

    try {
        if (cardName) URL += `name=${cardName}&`;
        if (fName) URL += `fname=${fName}&`;
        if (attribute) URL += `attribute=${attribute}&`;
        if (archetype) URL += `archetype=${archetype}&`;
        if (type) URL += `type=${type}&`;
        if (level) URL += `level=${level}&`;
        if (race) URL += `race=${race}&`;

        const result = await axios.get(URL);
        res.render("search-post.ejs", { content: result.data });
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.render("search-post.ejs");
    }
});

// Export the app for Vercel
export default app;
