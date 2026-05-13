/**
 * Deployment script for Apna Coding smart contracts
 * Deploy ProductLaunch and ProductStaking contracts
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString(), "wei\n");

  // Deploy ProductLaunch contract
  console.log("📦 Deploying ProductLaunch contract...");
  const ProductLaunch = await hre.ethers.getContractFactory("ProductLaunch");
  const productLaunch = await ProductLaunch.deploy();
  await productLaunch.deployed();
  console.log("✅ ProductLaunch deployed to:", productLaunch.address);

  // Deploy ProductStaking contract
  console.log("\n📦 Deploying ProductStaking contract...");
  const ProductStaking = await hre.ethers.getContractFactory("ProductStaking");
  const productStaking = await ProductStaking.deploy();
  await productStaking.deployed();
  console.log("✅ ProductStaking deployed to:", productStaking.address);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await productLaunch.deployTransaction.wait(5);
  await productStaking.deployTransaction.wait(5);

  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("Deployer Address:", deployer.address);
  console.log("ProductLaunch Contract:", productLaunch.address);
  console.log("ProductStaking Contract:", productStaking.address);
  console.log("Network:", hre.network.name);
  console.log("=======================\n");

  // Verify contracts on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("🔍 Verifying contracts on Etherscan...");

    try {
      await hre.run("verify:verify", {
        address: productLaunch.address,
        constructorArguments: [],
      });
      console.log("✅ ProductLaunch verified");
    } catch (error) {
      console.log("❌ ProductLaunch verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: productStaking.address,
        constructorArguments: [],
      });
      console.log("✅ ProductStaking verified");
    } catch (error) {
      console.log("❌ ProductStaking verification failed:", error.message);
    }
  }

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ProductLaunch: productLaunch.address,
      ProductStaking: productStaking.address
    }
  };

  const deploymentPath = `./deployments/${hre.network.name}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  console.log("\n✨ Deployment completed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
