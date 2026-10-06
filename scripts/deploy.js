const fs = require("node:fs");
const path = require("node:path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("Set PRIVATE_KEY in .env before deploying.");

  const Factory = await hre.ethers.getContractFactory("FirstInFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  console.log(`FirstInFactory deployed on ${hre.network.name} (${chainId}): ${address}`);
  if (chainId === 10143) {
    const directory = path.join(__dirname, "..", "deployments");
    fs.mkdirSync(directory, { recursive: true });
    const deploymentFile = path.join(directory, `${hre.network.name}.json`);
    fs.writeFileSync(
      deploymentFile,
      `${JSON.stringify({ network: hre.network.name, chainId, address, deployer: deployer.address }, null, 2)}\n`,
    );

    const envPath = path.join(__dirname, "..", ".env.local");
    const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    const line = `NEXT_PUBLIC_FACTORY_ADDRESS=${address}`;
    const updated = /^NEXT_PUBLIC_FACTORY_ADDRESS=.*$/m.test(existing)
      ? existing.replace(/^NEXT_PUBLIC_FACTORY_ADDRESS=.*$/m, line)
      : `${existing.trimEnd()}${existing.trim() ? "\n" : ""}${line}\n`;
    fs.writeFileSync(envPath, updated);
    console.log(`Saved ${path.relative(process.cwd(), deploymentFile)}`);
    console.log("Restart the Next.js server to load the updated .env.local.");
  } else {
    console.log("Local deployment was not written to the testnet frontend configuration.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
