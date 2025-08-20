import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Add cookie parser middleware

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cookie-based favorites storage (Vercel compatible)
app.use((req, res, next) => {
    // Parse favorites from cookies
    const favoritesCookie = req.cookies?.favorites || '[]';
    try {
        req.favorites = JSON.parse(favoritesCookie);
    } catch (error) {
        req.favorites = [];
    }
    next();
});

// Routes
app.get("/", (req, res) => {
    res.render("index", { 
        title: "Yu-Gi-Oh! Deck Builder"
    });
});

app.get("/favorites", (req, res) => {
    res.render("favorite", { 
        title: "My Favorites",
        favorites: req.favorites || []
    });
});

app.get("/advisor", (req, res) => {
    res.render("advisor", { 
        title: "Deck Advisor"
    });
});

app.post("/post-cards", async (req, res) => {
    try {
        const { cardName, fName, attribute, archetype, type, level, race } = req.body;
        let URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?";
        
        if (cardName) URL += `name=${encodeURIComponent(cardName)}&`;
        if (fName) URL += `fname=${encodeURIComponent(fName)}&`;
        if (attribute) URL += `attribute=${encodeURIComponent(attribute)}&`;
        if (archetype) URL += `archetype=${encodeURIComponent(archetype)}&`;
        if (type) URL += `type=${encodeURIComponent(type)}&`;
        if (level) URL += `level=${encodeURIComponent(level)}&`;
        if (race) URL += `race=${encodeURIComponent(race)}&`;

        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            return res.render("search-post", { 
                title: "No Cards Found",
                content: { data: [] },
                message: "No cards found. Try different search parameters."
            });
        }

        res.render("search-post", { 
            title: "Search Results",
            content: data
        });
    } catch (error) {
        console.error('Search error:', error);
        res.render("search-post", { 
            title: "Search Error",
            content: { data: [] },
            message: "Error occurred during search. Please try again."
        });
    }
});

// API endpoints for favorites (cookie-based)
app.get("/api/favorites", (req, res) => {
    res.json({ favorites: req.favorites || [] });
});

app.post("/api/favorites", (req, res) => {
    const { card } = req.body;
    if (card) {
        const exists = req.favorites.some(fav => fav.id === card.id);
        if (!exists) {
            req.favorites.push(card);
            // Set cookie with updated favorites
            res.cookie('favorites', JSON.stringify(req.favorites), {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }
        res.json({ success: true, favorites: req.favorites });
    } else {
        res.status(400).json({ error: 'Card data is required' });
    }
});

app.delete("/api/favorites/:cardId", (req, res) => {
    const cardId = req.params.cardId;
    req.favorites = req.favorites.filter(card => card.id !== cardId);
    
    // Update cookie
    res.cookie('favorites', JSON.stringify(req.favorites), {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    
    res.json({ success: true, favorites: req.favorites });
});

// Health check route for Vercel
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'DeckBuilder is running on Vercel!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        isVercel: process.env.VERCEL === '1'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('index', { 
        title: "Page Not Found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('index', { 
        title: "Error"
    });
});

// Export for Vercel (no app.listen)
export default app;
