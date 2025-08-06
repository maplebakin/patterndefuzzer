// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patternRoutes from './routes/patternRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/patterns', patternRoutes);

// Health-check route
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
