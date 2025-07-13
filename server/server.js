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
import partnershipRouter from './routes/Partnership.js';
import puzzleRouter from './routes/Puzzle.js';
import QRCodeRouter from './routes/QRcode.js';
import participantRouter from './routes/RoomParticipant.js';
import scenarioRouter from './routes/Scenario.js';
//import sceneRouter from './routes/Scene.js';
import userRouter from './routes/User.js';


const PORT = process.env.PORT || 4000;
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

await connectDB();

app.use("/api/user", userRouter);
app.use("/api/room-participant", participantRouter);
app.use("/api/QRcode", QRCodeRouter);
app.use("/api/room", roomRouter);
app.use("/api/session", sessionRouter);
app.use("/api/escape-games", GameRouter);
app.use("/api/level", levelRouter);
app.use("/api/scenario", scenarioRouter);
//app.use("/api/scene", sceneRouter);
//app.use("/api/media", mediaRouter);
app.use("/api/puzzle", puzzleRouter);
app.use("/api/hint", hintRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/invitation?type=Partnership", invitationRouter);


app.get('/', (req, res) => res.send("API working"));



app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));