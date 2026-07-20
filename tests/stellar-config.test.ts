import assert from 'node:assert/strict';
import test from 'node:test';

import {
  StellarNetwork,
  buildAccountExplorerUrl,
  buildTransactionExplorerUrl,
  getStellarNetwork,
  isStellarEnabled,
} from '../lib/stellar-config';

function withEnvironment(values: Record<string, string | undefined>, run: () => void) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('testnet is the safe default and produces testnet explorer links', () => {
  withEnvironment({ STELLAR_NETWORK: undefined }, () => {
    assert.equal(getStellarNetwork(), StellarNetwork.TESTNET);
    assert.equal(
      buildTransactionExplorerUrl('abc123'),
      'https://stellar.expert/explorer/testnet/tx/abc123',
    );
  });
});

test('public network aliases produce mainnet explorer links', () => {
  withEnvironment({ STELLAR_NETWORK: 'mainnet' }, () => {
    assert.equal(getStellarNetwork(), StellarNetwork.PUBLIC);
    assert.equal(
      buildAccountExplorerUrl('GACCOUNT'),
      'https://stellar.expert/explorer/public/account/GACCOUNT',
    );
  });
});

test('settlement is enabled only when every required value is present', () => {
  withEnvironment(
    {
      STELLAR_TREASURY_SECRET: 'treasury',
      STELLAR_OPS_SECRET: 'ops',
      STELLAR_ASSET_ISSUER: 'issuer',
    },
    () => assert.equal(isStellarEnabled(), true),
  );

  withEnvironment(
    {
      STELLAR_TREASURY_SECRET: 'treasury',
      STELLAR_OPS_SECRET: undefined,
      STELLAR_ASSET_ISSUER: 'issuer',
    },
    () => assert.equal(isStellarEnabled(), false),
  );
});
