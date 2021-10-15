// Dependencies
const player = require('play-sound')(opts = {});
const { ethers } = require('hardhat');
const BundleLauncher = require('./utils/bundle_launcher');
const log = require('./utils/logger');
const getBaseGasPrice = require('./utils/gas_analyzer');

// Constants
const ONE_ETH = ethers.utils.parseEther('1.0');
const ZERO = ethers.BigNumber.from(0);
const ENVIRONMENT = process.env.ENVIRONMENT;

// Variables
let bundleLauncher;
let provider;
let lastBlock;
let owner;

/**
 * Initialize dependencies
 */
 async function main() {
    log('Bot is starting. Listening for new mined blocks...');
    // Setup web sockets provider for production
    log('Listening for new mined blocks...');
    log('='.repeat(78));
    // Init web sockets provider
    provider = new ethers.providers.WebSocketProvider(
        `${process.env.WS_MAINNET_URL}/${process.env.ALCHEMY_API_KEY}`
    );
    // Init trade launcher
    bundleLauncher = new BundleLauncher();
    // Init owner
    owner = new ethers.Wallet(
        `0x${process.env.BOT_PRIVATE_KEY}`
    );
}

/**
 * Notifications manager. Get notified with a sound on every bundle attempt
 * (only when public sale is open).
 */
 async function sendNotification() {
    // Sound alert
    await player.play('./assets/alert.wav', function(err){
        if (err) {
            console.error(err);
        }
    });
}

async function processBlock(block) {
    // Check current gas price
    let feeData = await getBaseGasPrice(ethers.provider, block);
    log(`> Expected total fee cost: ${feeData.total_min_gas_fee / ONE_ETH} ETH`);
    log(
        `> Total expected cost (price per token * token amount + gas fees) = ${bundleLauncher.getTotalPrice().add(feeData.total_min_gas_fee) / ONE_ETH} ETH`
    );
    // Check if public sale is open
    // TODO: Modify the name of the public sale getter function
    log(`Checking if public sale is open...`);
    let isSaleLive = await bundleLauncher.getContract().callStatic.saleOpen();
    if(isSaleLive) {
        log('Public sale is open!');
        await sendNotification();
        log('Starting bundle launcher...');
        await bundleLauncher.fire(block, feeData);
    } else {
        log('Public sale is still closed.');
    }
    log('/'.repeat(78));
}

main()
    .then(() => {
        lastBlock = 0;
        provider.on('block', (block) => {
            log('='.repeat(78));
            if(block <= lastBlock) {
                log(`New block #${block}: Ignoring current update because last block was ${lastBlock} and current one is ${block}`);
                log('='.repeat(78));
            } else {
                lastBlock = block;
                log('New block #' + block);
                log('='.repeat(78));
                processBlock(block);
            }
        });
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
