require("@nomiclabs/hardhat-waffle");

const dotenv = require('dotenv');
dotenv.config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
    main: {
      url: `${process.env.MAINNET_URL}/${process.env.ALCHEMY_API_KEY}`,
    },
    hardhat: {
      forking: {
        url: `${process.env.MAINNET_URL}/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 13387500,
        mining: {
          auto: true,
          interval: [15000, 30000]
        }
      }
    }
  }
};
