/**
 * One-command Stellar TESTNET setup for local development.
 *
 * Creates and funds three accounts (issuer, treasury, ops), opens PHPC
 * trustlines on treasury and ops, mints test PHPC to the treasury, and prints
 * the environment variables to paste into .env.
 *
 * Usage: npm run stellar:setup
 *
 * Testnet only — production uses a licensed anchor's PHPC and a multisig
 * treasury (see docs/stellar-architecture.md).
 */
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const ASSET_CODE = 'PHPC';
const TREASURY_FLOAT = '10000000'; // ₱10M test float

const server = new Horizon.Server(HORIZON_URL);

async function friendbot(publicKey, label) {
  process.stdout.write(`Funding ${label} via Friendbot... `);
  const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
  if (!response.ok) {
    throw new Error(`Friendbot failed for ${label}: ${response.status} ${await response.text()}`);
  }
  console.log('done');
}

async function submit(sourceKeypair, operations, label) {
  process.stdout.write(`${label}... `);
  const account = await server.loadAccount(sourceKeypair.publicKey());
  const builder = new TransactionBuilder(account, {
    fee: String(Number(BASE_FEE) * 10),
    networkPassphrase: Networks.TESTNET,
  });
  for (const operation of operations) {
    builder.addOperation(operation);
  }
  const transaction = builder.setTimeout(60).build();
  transaction.sign(sourceKeypair);
  await server.submitTransaction(transaction);
  console.log('done');
}

async function main() {
  console.log('Setting up Betless Stellar testnet accounts...\n');

  const issuer = Keypair.random();
  const treasury = Keypair.random();
  const ops = Keypair.random();
  const asset = new Asset(ASSET_CODE, issuer.publicKey());

  await friendbot(issuer.publicKey(), 'issuer');
  await friendbot(treasury.publicKey(), 'treasury');
  await friendbot(ops.publicKey(), 'ops');

  await submit(treasury, [Operation.changeTrust({ asset })], `Opening ${ASSET_CODE} trustline on treasury`);
  await submit(ops, [Operation.changeTrust({ asset })], `Opening ${ASSET_CODE} trustline on ops`);
  await submit(
    issuer,
    [Operation.payment({ destination: treasury.publicKey(), asset, amount: TREASURY_FLOAT })],
    `Minting ${TREASURY_FLOAT} ${ASSET_CODE} to treasury`,
  );

  console.log('\nAdd these lines to your .env file:\n');
  console.log('STELLAR_NETWORK=testnet');
  console.log(`STELLAR_ASSET_CODE=${ASSET_CODE}`);
  console.log(`STELLAR_ASSET_ISSUER=${issuer.publicKey()}`);
  console.log(`STELLAR_TREASURY_SECRET=${treasury.secret()}`);
  console.log(`STELLAR_OPS_SECRET=${ops.secret()}`);
  console.log('\nAccounts (for stellar.expert):');
  console.log(`  Issuer:   https://stellar.expert/explorer/testnet/account/${issuer.publicKey()}`);
  console.log(`  Treasury: https://stellar.expert/explorer/testnet/account/${treasury.publicKey()}`);
  console.log(`  Ops:      https://stellar.expert/explorer/testnet/account/${ops.publicKey()}`);
  console.log('\nKeep the secrets out of version control. Store the issuer secret if you need to mint more PHPC:');
  console.log(`  Issuer secret: ${issuer.secret()}`);
}

main().catch((error) => {
  console.error('\nSetup failed:', error?.response?.data ?? error);
  process.exit(1);
});
