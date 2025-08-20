import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import fetch from 'node-fetch';
import { config } from 'dotenv';
import session from 'express-session';

// Initialize dotenv (locally, Vercel will handle this in production)
config();

const app = express();
const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Session configuration
app.use(session({
    name: 'deckbuilder.sid',
    secret: process.env.SESSION_SECRET || 'deck-builder-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Initialize user favorites in session if not exists
app.use((req, res, next) => {
    if (!req.session.favorites) {
        req.session.favorites = [];
    }
    
    // Debug logging for session management
    console.log(`[Session] User ${req.sessionID ? req.sessionID.substring(0, 8) : 'new'} - Favorites: ${req.session.favorites.length}`);
    
    next();
});

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

// API endpoints for favorites management
app.get("/api/favorites", (req, res) => {
    console.log(`[GET] User ${req.sessionID ? req.sessionID.substring(0, 8) : 'new'} requesting favorites: ${req.session.favorites.length} cards`);
    res.json({ favorites: req.session.favorites || [] });
});

app.post("/api/favorites", (req, res) => {
    const { card } = req.body;
    if (card) {
        // Check if card already exists in favorites
        const exists = req.session.favorites.some(fav => fav.id === card.id);
        if (!exists) {
            req.session.favorites.push(card);
        }
        console.log(`[POST] User ${req.sessionID ? req.sessionID.substring(0, 8) : 'new'} added card: ${card.name} - Total: ${req.session.favorites.length}`);
        res.json({ success: true, favorites: req.session.favorites });
    } else {
        res.status(400).json({ error: 'Card data is required' });
    }
});

app.delete("/api/favorites/:cardId", (req, res) => {
    const cardId = req.params.cardId;
    const beforeCount = req.session.favorites.length;
    req.session.favorites = req.session.favorites.filter(card => card.id !== cardId);
    const afterCount = req.session.favorites.length;
    console.log(`[DELETE] User ${req.sessionID ? req.sessionID.substring(0, 8) : 'new'} removed card ${cardId}: ${beforeCount} -> ${afterCount} cards`);
    res.json({ success: true, favorites: req.session.favorites });
});

// Export the app for Vercel
export default app;

// Start server for local development only (not on Vercel)
// Check if we're running in a Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
console.log(`[Environment] NODE_ENV: ${process.env.NODE_ENV}, VERCEL: ${process.env.VERCEL}, isVercel: ${isVercel}`);

if (!isVercel) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 DeckBuilder server running on http://localhost:${PORT}`);
        console.log(`📱 Yu-Gi-Oh! card search and deck building ready!`);
    });
}
