import express from 'express';
import patternRoutes from './routes.js';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Hook up the route we just built
app.use('/api/patterns', patternRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🧶 Pattern Defuzzer running on http://localhost:${PORT}`);
});
