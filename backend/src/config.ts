import { Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { Logger } from './logger.js';

dotenv.config();

const logger = new Logger(true);

export interface Config {
  rpcEndpoint: string;
  connection: Connection;
}

// Load RPC Endpoint from environment variables, with a fallback to a public RPC.
const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';

if (!rpcEndpoint) {
  throw new Error('RPC_ENDPOINT is not set. Please provide an RPC endpoint.');
}

logger.info(`Using RPC Endpoint: ${rpcEndpoint}`);

export const config: Config = {
  rpcEndpoint,
  connection: new Connection(rpcEndpoint, 'confirmed'),
};