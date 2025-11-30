import express from 'express';
import cors from 'cors';
import { PublicKey } from '@solana/web3.js';
import { Logger } from './logger.js';
import { fetchPositions } from './liquidator.js';
import { config } from './config.js';

const app = express();
const port = process.env.PORT || 3001;
const logger = new Logger(true);

app.use(cors());
app.use(express.json());

app.get('/api/positions/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;
  logger.info(`Fetching positions for wallet: ${walletAddress}`);

  try {
    // Validate the wallet address
    new PublicKey(walletAddress);
  } catch (error) {
    logger.error('Invalid wallet address provided.');
    return res.status(400).json({ error: 'Invalid wallet address.' });
  }

  try {
    // TODO: This will be replaced with real data fetching
    const positions = await fetchPositions(new PublicKey(walletAddress));
    res.json(positions);
  } catch (error) {
    logger.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions.' });
  }
});

app.listen(port, () => {
  logger.info(`Backend server is running on http://localhost:${port}`);
});
