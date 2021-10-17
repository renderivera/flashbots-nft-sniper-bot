# NFT Sniper Bot (through Flashbots)

When run, it attempts to mint a predefined amount of NFTs on every single 
block until success (or until it's stopped).

## Install dependencies

```bash
npm install
```

## Copy .env file

```bash
cp .env.example .env
```

## Configure .env file for each drop

Make sure to populate all fields correctly.

- Get Alchemy free API key from: https://www.alchemy.com/
- Enter your wallet's private key (it's best if you use one with just enough money to cover this purchase, but not enough to cover two in a row unless you want that).
- Generate a random private key for Flashbots authentication (you can create a new empty account on metamask and use that private key)

For both private keys, make sure you remove the '0x' prefix when pasting them into the .env file variables.


- For testing purposes, set ENVIRONMENT to simulation (it will only simulate the bundle):

```.env
ENVIRONMENT=simulation
```

- After that, set ENVIRONMENT to dev (it will simulate and send the bundle):

```.env
ENVIRONMENT=simulation
```

- Finally, make sure you set the ENVIRONMENT value to production if you are ready for your bundles to start being sent:

```.env
ENVIRONMENT=production
```

## Configure public sale open contract function

Modify ```./scripts/index.js:59``` and substitute ```saleLive()``` for whatever
the corresponding function is called in the new NFT contract.

## Get ABI

- Go to https://etherscan.io/address/<contract_address>
- Click on Contract -> Code
- Scroll down until the ABI Contract section
- Copy all its contents into ```./data/abi.json``` overwriting the previous contents.

## Run

```bash
npx hardhat run scripts/index.js --network main
```

