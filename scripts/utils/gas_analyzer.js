// Dependencies
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle');
const log = require('./logger');
const ONE_ETH = ethers.utils.parseEther('1.0');
const ONE_GWEI = ethers.utils.parseUnits('1.0', 'gwei');
// Constants
const MIN_CONTRACT_GAS_UNITS_CONSUMPTION = parseInt(process.env.GAS_USAGE_ESTIMATION) * parseInt(process.env.TOKEN_AMOUNT);

/**
 * Retrieves next block's max base fee from Flashbots provider
 * @param {int} currentBlockNum        Current block height
 */
async function getBaseGasPrice(provider, currentBlockNum) {
    log('Calculating next base fee...');
    let currentBlock = await provider.getBlock(currentBlockNum);
    log(`Current block fee: ${currentBlock.baseFeePerGas / ONE_GWEI}`);
    let nextMaxBaseFeeIn = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
        currentBlock.baseFeePerGas,
        1 // How many blocks in the future to look into (only interested on next one)
    );
    log('Next block base fee: ' + nextMaxBaseFeeIn / ONE_GWEI);
    let priorityFee = ethers.utils.parseUnits(process.env.PRIORITY_FEE, 'gwei');
    log(`Selected priority fee: ${priorityFee  / ONE_GWEI} gwei`);
    let maxFee = nextMaxBaseFeeIn.add(priorityFee);
    log(`Max fee per gas: ${maxFee / ONE_GWEI} gwei`)
    let totalMinGasFee = maxFee.mul(MIN_CONTRACT_GAS_UNITS_CONSUMPTION);
    log(`Expected total gas fee cost = ${totalMinGasFee / ONE_ETH} ETH`);
    return {
        next_max_base_fee_per_gas: nextMaxBaseFeeIn,
        priority_fee_per_gas: priorityFee,
        max_fee_per_gas: maxFee,
        total_min_gas_fee: totalMinGasFee,
    };
}


module.exports = getBaseGasPrice;