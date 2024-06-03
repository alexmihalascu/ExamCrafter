import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import intrebariRoute from './routes/intrebari.js';
import saveAnswerRoute from './routes/saveAnswer.js';
import historyRoute from './routes/history.js';
import userRoute from './routes/user.js'; // Import user route

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/intrebari', intrebariRoute);
app.use('/api/saveAnswer', saveAnswerRoute);
app.use('/api/history', historyRoute);
app.use('/api/user', userRoute); // Use user route

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
