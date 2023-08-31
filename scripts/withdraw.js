// scripts/withdraw.js

const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.formatEther(balanceBigInt);
}

//contracts deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
//contract deployed Goerli: 0x2D6196Af022Dd9268de6fF9A1c1349e07BEf6A79

async function main() {
  // Get the contract that has been deployed to Goerli.
//   const contractAddress="0xDBa03676a2fBb6711CB652beF5B7416A53c1421D";
  const contractAddress="0x2D6196Af022Dd9268de6fF9A1c1349e07BEf6A79";
  const contractABI = abi.abi;

  // Get the node connection and wallet connection.
  const provider = new hre.ethers.AlchemyProvider("goerli", process.env.GOERLI_API_KEY);

  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error.
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Instantiate connected contract.
  const buyMeACoffee = new hre.ethers.Contract(contractAddress, contractABI, signer);

  // Check starting balances.
  console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
  const contractBalance = await getBalance(provider, buyMeACoffee.target);
  console.log("current balance of contract: ", await getBalance(provider, buyMeACoffee.target), "ETH");

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..")
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance.
  console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });