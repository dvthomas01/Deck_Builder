# 🚀 DeckBuilder Startup Guide

## What is DeckBuilder?
DeckBuilder is a Yu-Gi-Oh! card search and deck building web application that allows users to:
- Search for cards using multiple filters (name, attribute, archetype, type, level, race)
- View detailed card information
- Add/remove cards to/from favorites
- Get AI-powered deck building advice

## 🛠️ Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- OpenAI API key (for the Deck Advisor feature)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Edit the `.env` file in your project root:
```bash
# OpenAI API Key for the Deck Advisor feature
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_actual_openai_api_key_here

# Optional: Set a custom port (default is 3000)
PORT=3000
```

**Important**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key.

### 3. Start the Application
```bash
npm start
```

Or run directly:
```bash
node index.js
```

### 4. Access the Application
Open your browser and go to: `http://localhost:3000`

## 🔧 Available Scripts
- `npm start` - Start the application
- `npm run dev` - Start the application (alias for start)

## 📱 Features to Test

### Main Search Page (`/`)
- Test card search with different filters
- Try searching for popular cards like "Blue-Eyes White Dragon"
- Test partial name searches

### Search Results (`/post-cards`)
- Click on cards to see detailed information
- Add cards to favorites
- Test the overlay functionality

### Favorites Page (`/favorites`)
- View your saved cards
- Remove cards from favorites
- Test the card counter

### Deck Advisor (`/advisor`)
- Ask questions about deck building
- Test the AI chat functionality
- Note: Requires valid OpenAI API key

## 🐛 Troubleshooting

### Port Already in Use
If you get "port already in use" error:
1. Change the PORT in your `.env` file
2. Or kill the process using the port:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

### OpenAI API Issues
If the Deck Advisor doesn't work:
1. Check your `.env` file has the correct API key
2. Verify your OpenAI API key is valid and has credits
3. Check the console for error messages

### Card Search Not Working
If card search fails:
1. Check your internet connection
2. The Yu-Gi-Oh! Pro Deck API might be temporarily down
3. Check the browser console for errors

## 🌐 API Endpoints
- `GET /` - Main search page
- `POST /post-cards` - Search for cards
- `GET /favorites` - Favorites page
- `GET /advisor` - Deck advisor page
- `POST /advisor` - AI deck advice endpoint

## 🎨 Customization
- Modify `public/styles/main.css` for styling changes
- Edit EJS templates in the `views/` folder for UI changes
- Update `index.js` for backend logic changes

## 🚀 Deployment
This app is configured for Vercel deployment. The `vercel.json` file handles the production configuration.

## 📞 Support
If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure your `.env` file is properly configured
4. Check that all required APIs are accessible

---

**Happy Dueling! 🃏⚡** 