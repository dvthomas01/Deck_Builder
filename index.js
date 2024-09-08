import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import fetch from 'node-fetch';
import { config } from 'dotenv';


const port = 3000;
const app = express();
app.use(bodyParser.json());


config();

const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

app.use(express.json());

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
        console.log(OPENAI_API_KEY);
//        throw error;
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
//        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use(bodyParser.urlencoded({ extended:true}));
app.set('view engine','ejs');

app.use(express.static("public"));

app.get("/", async (req,res)=> {
res.render("index.ejs");
});

app.get("/favorites", (req,res)=> {
res.render("favorite.ejs");
});

app.get("/advisor", (req,res)=> {
res.render("advisor.ejs");
});




app.post("/post-cards", async (req,res) =>{
const cardName= req.body.cardName;
const fName = req.body.fName;
const attribute=req.body.attribute;
const archetype=req.body.archetype;
const type=req.body.type;
const level=req.body.level;
const race = req.body.race;

let URL=API_URL;
try{

if (cardName){
URL=URL+"name="+cardName+"&";
}

if (fName){
URL=URL+"fname="+fName+"&";
}

if (attribute){
URL=URL+"attribute="+attribute+"&";
}

if (archetype){
URL=URL+"archetype="+archetype+"&";
}

if (type){
URL=URL+"type="+type+"&";
}

if (level){
URL=URL+"level="+level+"&";
}
if (race){
URL=URL+"race="+race+"&";
}

const result = await axios.get(URL)

res.render("search-post.ejs",{content: result.data} );

console.log(URL);
} catch(error){
res.render("search-post.ejs");
console.log(URL);
}
});







app.listen(port, () =>{
console.log(`Server is running on port ${port}`);
});
