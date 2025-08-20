#!/usr/bin/env node

import app from './index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 DeckBuilder server running on http://localhost:${PORT}`);
    console.log(`📱 Yu-Gi-Oh! card search and deck building ready!`);
    console.log(`🔧 Running in development mode`);
}); 