import express from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import connectDB from './config/MongoDb.js';
import cors from 'cors';
import GameRouter from './routes/EscapeGame.js';
import feedbackRouter from './routes/Feedback.js';
import sessionRouter from './routes/gameplaySession.js';
import hintRouter from './routes/Hint.js';
import invitationRouter from './routes/Invitation.js';
import levelRouter from './routes/Level.js';
//import mediaRouter from './routes/Media.js';
import roomRouter from './routes/MultiplayerRoom.js';

import puzzleRouter from './routes/Puzzle.js';
import QRCodeRouter from './routes/QRcode.js';
import participantRouter from './routes/RoomParticipant.js';
import scenarioRouter from './routes/Scenario.js';
import sceneRouter from './routes/Scene.js';
import userRouter from './routes/User.js';
import https from 'https';
import fs from 'fs';

const PORT = process.env.PORT || 4000;
const app = express();

const options = {
    key: fs.readFileSync('../192.168.100.233+2-key.pem'),
    cert: fs.readFileSync('../192.168.100.233+2.pem')
  };

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors({
    origin: [
      'https://localhost:5173',
      'https://192.168.100.233:5173'
    ],
    credentials: true
  }));

await connectDB();

app.use("/api/users", userRouter);
app.use("/api/room-participant", participantRouter);
app.use("/api/QRcode", QRCodeRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/escape-games", GameRouter);
app.use("/api/levels", levelRouter);
app.use("/api/scenarios", scenarioRouter);
app.use("/api/scenes", sceneRouter);
//app.use("/api/media", mediaRouter);
app.use("/api/puzzles", puzzleRouter);
app.use("/api/hints", hintRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/invitations", invitationRouter);


app.get('/', (req, res) => res.send("API working"));



https.createServer(options, app).listen(4000, '0.0.0.0', () => {
    console.log('HTTPS Server running on https://0.0.0.0:4000');
  });