import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Simple test route
app.get('/', (req, res) => {
    res.render('search', { 
        title: 'Yu-Gi-Oh! Deck Builder',
        message: 'App is working on Vercel!'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'DeckBuilder is running on Vercel!',
        timestamp: new Date().toISOString()
    });
});

// Export for Vercel
export default app; 