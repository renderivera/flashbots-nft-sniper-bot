const { FlashbotsBundleProvider} = require('@flashbots/ethers-provider-bundle');
const { ethers } = require('hardhat');
const log = require('./logger');
const ONE_ETH = ethers.utils.parseEther('1.0');
const ZERO = ethers.BigNumber.from(0);
const MIN_CONTRACT_GAS_UNITS_CONSUMPTION = parseInt(process.env.GAS_USAGE_ESTIMATION) * parseInt(process.env.TOKEN_AMOUNT);
const abi = require('../../data/abi.json');

class BundleLauncher {

	SEND_BUNDLE_FLAG = process.env.ENVIRONMENT == 'production';

	bribePerc;
	botAddress;
	owner;
	provider;
	authSigner;
	contractAddress;
	contract;
	fbp;
	totalPrice;
	dataPayload;

    constructor() {
        this._init();
    }

    async _init() {
		// Get provider
		this.provider = ethers.provider;
		
		// This priv key identifies our bot, and is NOT the bot's primary priv key.
		// It's only used for identification andd reputation building purposes.
		this.authSigner = new ethers.Wallet(
			`0x${process.env.FLASHBOTS_AUTH_SIGNER_PRIV_KEY}`
		);
		this.owner = new ethers.Wallet(
			`0x${process.env.BOT_PRIVATE_KEY}`, this.provider
		);

		// Init flashbots provider
		this.fbp = await FlashbotsBundleProvider.create(
			this.provider,
			this.authSigner
		);	
		log('Flashbots provider successfully initialized');

		// Init NFT contract
		this.contractAddress = process.env.NFT_CONTRACT;
		this.contract = new ethers.Contract(
			this.contractAddress,
			abi,
			this.provider
		);
		log('> NFT Contract address: ', this.contractAddress);

		this.botAddress = await this.owner.getAddress();
		log(`> Wallet address: ${this.botAddress}`);

		// Initialize minting parameters
		let pricePerToken = ethers.utils.parseEther(process.env.PRICE_PER_TOKEN);
		log(`> Price per NFT: ${pricePerToken / ONE_ETH} ETH`)
		let tokenAmount = parseInt(process.env.TOKEN_AMOUNT);
		log(`> Target amount of NFTs per tx: ${tokenAmount}`)
		this.totalPrice = pricePerToken.mul(tokenAmount);
		log(`> Total purchase price: ${this.totalPrice / ONE_ETH} ETH`)
		this.dataPayload = process.env.DATA_PAYLOAD;
		log(`> Public mint data payload: ${this.dataPayload}`)
    }

    /**
     * Fires minting tx transaction through a Flashbots bundle.
     */
    async fire(block, feeData) {
		// Populate tx
		let tx = {
			chainId: 1,               // Mainnet
			type: 2,                  // EIP-1559
			value: this.totalPrice,
			maxFeePerGas: feeData.max_fee_per_gas,
			maxPriorityFeePerGas: feeData.priority_fee_per_gas,
			to: this.contractAddress,
			from: this.botAddress,
			data: this.dataPayload,
			gasLimit: 2*MIN_CONTRACT_GAS_UNITS_CONSUMPTION
		}
		// Sign bundle
		const signedBundle = await this.fbp.signBundle([
            {
                signer: this.owner,
                transaction: tx
			}
		]);

        
		log('Simulating signed bundle...');
		this.fbp.simulate(
            signedBundle,
            block + 1,		// Simulate targetting block
			block			// Simulate based on current block
        ).then(async (simulation) => {
			let reverted = true;
			if ("error" in simulation) {
				log(`Simulation failed due to: ${simulation.error.message}`);
			} else {
				log('Simulation succeeded!');
				let bundleHash = simulation.bundleHash;
				log(`Bundle hash: ${bundleHash}`);
				let actualGasUsed = simulation.totalGasUsed;
				log(`Actual gas used: ${actualGasUsed}`);
				let reverted = simulation.results[0].error == "execution reverted";
				log(`Reverted? => ${reverted}`);
			}

			log(
			`Simulation data: ${block + 1} ${JSON.stringify(
				simulation,     // Data
				null,           // Replacer
				4               // Spaces for indenting
			)}`
			);
			if(reverted) {
				log(`Tx reverted upon simulation. Bundle not sent.`);
				log(`If you want to send the bundle anyways, comment out this block.`);
				return;
			}
			if(this.SEND_BUNDLE_FLAG) {
				log(`Sending bundle targetting block ${block+1}`);

				const bundleSubmitResponse = await this.fbp.sendBundle(
					signedBundle,
					block + 1
				);
				// Check if the submit failed
				if ('error' in bundleSubmitResponse) {
					log(bundleSubmitResponse.error.message);
					return;
				}
				log(await bundleSubmitResponse.simulate());
			} else {
				log('Skipping bundle submit because environment is set to development.');
				log('If you are sure you want to send the bundle, switch environment to production.');
			}
		}).catch((err) => {
			log('Simulation failed due to: ', err);
			log('Exiting...');
		});
    }

	getContract() {
		return this.contract;
	}

	getTotalPrice() {
		return this.totalPrice;
	}

}
module.exports = BundleLauncher;