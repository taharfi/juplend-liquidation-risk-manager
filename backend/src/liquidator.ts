import { PublicKey } from '@solana/web3.js';
import { Logger } from './logger.js';

const logger = new Logger(true);

// Interface for the raw position data from Jupiter API (based on a more detailed sample)
interface JupiterPosition {
  symbol: string;
  address: string;
  price: number;
  convertToAssets: string; // This is a string representing a large number
  // Other relevant fields from the sample
  ownerAddress: string;
  coingeckoId: string;
  supply: string;
  decimals: number; // Assuming we can get this from somewhere
}

// Function to map raw Jupiter positions to the format expected by the frontend
function mapPositions(rawPositions: JupiterPosition[]): any[] {
  if (!rawPositions || rawPositions.length === 0) {
    return [];
  }

  return rawPositions.map(pos => {
    if (!pos || typeof pos !== 'object') {
      return {
        collateral: 'Invalid position data',
        debt: 'N/A',
        ltv: 'N/A',
        risk: 'N/A',
      };
    }

    const symbol = typeof pos.symbol === 'string' ? pos.symbol : 'Unknown Symbol';
    const decimals = pos.decimals || 6;
    let amount = 0;

    if (pos.convertToAssets) {
      const parsedAmount = parseFloat(pos.convertToAssets);
      if (!isNaN(parsedAmount)) {
        amount = parsedAmount / Math.pow(10, decimals);
      }
    }

    return {
      collateral: `${amount.toFixed(2)} ${symbol}`,
      debt: 'N/A', // TODO: Determine the correct field for debt
      ltv: 'N/A', // TODO: Determine the correct field for LTV
      risk: 'N/A', // TODO: Determine the correct field for risk
    };
  });
}

export async function fetchPositions(wallet: PublicKey) {
  try {
    const LEND_API_URL = 'https://lite-api.jup.ag/lend/v1';
    logger.info(`Fetching from: ${LEND_API_URL}/earn/positions?users=${wallet.toBase58()}`);

    const response = await fetch(`${LEND_API_URL}/earn/positions?users=${wallet.toBase58()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch from Jupiter API: ${response.statusText}`);
    }
    const collateralPositions: JupiterPosition[] = await response.json();

    if (!collateralPositions || collateralPositions.length === 0) {
        logger.info('API returned no positions for this wallet. Returning mock data to the frontend for testing.');
        return [
            { collateral: '100.00 MOCK', debt: '50.00 USD', ltv: '50%', risk: 'Low' }
        ];
    }

    // If we get here, data was found. Log the raw data to the console.
    logger.info('========= RAW API RESPONSE RECEIVED =========');
    console.log(JSON.stringify(collateralPositions, null, 2));
    logger.info('===========================================');

    // Map the raw positions to the frontend format
    const mappedPositions = mapPositions(collateralPositions);
    return mappedPositions;

  } catch (error) {
    logger.error('A critical error occurred while fetching positions:', error);
    throw new Error('Failed to retrieve positions.');
  }
}
