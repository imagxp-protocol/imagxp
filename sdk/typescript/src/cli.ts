#!/usr/bin/env node
import { generateKeyPair, exportPrivateKey, exportPublicKey } from './crypto.js';
declare const process: any;

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'generate-identity') {
        console.log('Generating new IMAGXP Identity...');
        const keyPair = await generateKeyPair();
        const privateKey = await exportPrivateKey(keyPair.privateKey);
        const publicKey = await exportPublicKey(keyPair.publicKey);

        console.log('\n--- IMAGXP IDENTITY ---');
        console.log(`IMAGXP_PRIVATE_KEY="${privateKey}"`);
        console.log(`IMAGXP_PUBLIC_KEY="${publicKey}"`);
        console.log('-----------------------\n');
        console.log('Save these to your .env file immediately!');
    } else {
        console.log('Usage: imagxp generate-identity');
        process.exit(1);
    }
}

main().catch(console.error);
