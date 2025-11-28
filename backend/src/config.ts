import { Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { Logger } from './logger.js';

dotenv.config();

const logger = new Logger(true);

export interface Config {
  rpcEndpoints: string[];
  walletKeypair: Keypair;
  minProfitUsd: number;
  telegramBotToken?: string;
  telegramChatId?: string;
  verbose: boolean;
  maxRequestsPerRpc: number;
  delayBetweenVaults: number;
}

export function loadConfig(): Config {
  // RPC Endpoints
  const rpcEndpoints = process.env.RPC_ENDPOINTS?.split(',').map(e => e.trim()) || [];
  if (rpcEndpoints.length === 0) {
    throw new Error('RPC_ENDPOINTS is not set. Please provide at least one RPC endpoint.');
  }

  // Wallet Keypair
  const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
  let walletKeypair: Keypair;
  if (WALLET_PRIVATE_KEY) {
    logger.info('Loading wallet from WALLET_PRIVATE_KEY environment variable...');
    walletKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(WALLET_PRIVATE_KEY)));
  } else if (process.env.WALLET_KEYPAIR_PATH) {
    logger.info(`Loading wallet from file: ${process.env.WALLET_KEYPAIR_PATH}`);
    const keypairFile = readFileSync(process.env.WALLET_KEYPAIR_PATH, 'utf-8');
    walletKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairFile)));
  } else {
    throw new Error('Neither WALLET_PRIVATE_KEY nor WALLET_KEYPAIR_PATH is set. Please provide one.');
  }

  // Minimum Profit
  const minProfitUsd = parseFloat(process.env.MIN_PROFIT_USD || '0.01'); // Default to $0.01

  // Telegram
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  // Verbose logging
  const verbose = process.env.VERBOSE === 'true';

  // Max requests per RPC
  const maxRequestsPerRpc = parseInt(process.env.MAX_REQUESTS_PER_RPC || '9');

  // Delay between vault scans
  const delayBetweenVaults = parseInt(process.env.DELAY_BETWEEN_VAULTS || '300');


  logger.info('Configuration loaded successfully.');

  return {
    rpcEndpoints,
    walletKeypair,
    minProfitUsd,
    telegramBotToken,
    telegramChatId,
    verbose,
    maxRequestsPerRpc,
    delayBetweenVaults,
  };
}