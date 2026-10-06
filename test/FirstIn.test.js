const { expect } = require("chai");

describe("FirstIn", function () {
  async function deploy() {
    const [creator, alice, bob, carol] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FirstInFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    await factory.connect(creator).createProfile("ipfs://profile-metadata");
    const profileAddress = await factory.creatorToProfile(creator.address);
    const profile = await ethers.getContractAt("CreatorProfile", profileAddress);
    return { creator, alice, bob, carol, factory, profile };
  }

  it("creates one profile per creator and emits its address", async function () {
    const { creator, alice, factory } = await deploy();
    await expect(factory.connect(alice).createProfile("ipfs://alice"))
      .to.emit(factory, "ProfileCreated");
    expect(await factory.profileCount()).to.equal(2);
    await expect(factory.connect(creator).createProfile("ipfs://duplicate"))
      .to.be.revertedWith("Profile already exists");
  });

  it("mints one badge per address up to the cap", async function () {
    const { alice, profile } = await deploy();
    await profile.connect(alice).claimBadge();
    expect(await profile.balanceOf(alice.address, 1)).to.equal(1);
    await expect(profile.connect(alice).claimBadge()).to.be.revertedWith("Already claimed");

    for (let i = 0; i < 99; i++) {
      const [, , , , ...signers] = await ethers.getSigners();
      const signer = signers[i];
      await profile.connect(signer).claimBadge();
    }
    expect(await profile.badgesMinted()).to.equal(100);
    await expect(profile.connect((await ethers.getSigners())[109]).claimBadge())
      .to.be.revertedWith("Badge supply exhausted");
  });

  it("keeps revenue pending with no badge holders", async function () {
    const { creator, profile } = await deploy();
    await creator.sendTransaction({ to: await profile.getAddress(), value: 1000n });
    await expect(profile.distributeRevenue()).to.be.revertedWith("No badge holders");
    expect(await profile.pendingRevenue()).to.equal(1000n);
  });

  it("can distribute tips that stayed pending until the first badge claim", async function () {
    const { creator, alice, profile } = await deploy();
    await creator.sendTransaction({ to: await profile.getAddress(), value: 1000n });
    await expect(profile.distributeRevenue()).to.be.revertedWith("No badge holders");
    await profile.connect(alice).claimBadge();
    await profile.distributeRevenue();

    expect(await profile.pendingRevenue()).to.equal(0n);
    expect(await profile.withdrawableRevenue(creator.address)).to.equal(800n);
    expect(await profile.withdrawableRevenue(alice.address)).to.equal(200n);
  });

  it("allocates 80/20 to creator and badge holders, with rounding dust to creator", async function () {
    const { creator, alice, bob, profile } = await deploy();
    await profile.connect(alice).claimBadge();
    await profile.connect(bob).claimBadge();
    await creator.sendTransaction({ to: await profile.getAddress(), value: 1001n });
    await profile.distributeRevenue();

    // 800 creator share + 1 unit of supporter-pool division dust.
    expect(await profile.withdrawableRevenue(creator.address)).to.equal(801n);
    expect(await profile.withdrawableRevenue(alice.address)).to.equal(100n);
    expect(await profile.withdrawableRevenue(bob.address)).to.equal(100n);
    expect(await profile.pendingRevenue()).to.equal(0n);

    await expect(profile.connect(alice).withdrawRevenue()).to.changeEtherBalances(
      [alice, profile], [100n, -100n]
    );
  });

  it("does not allocate old credits again in later distributions", async function () {
    const { creator, alice, profile } = await deploy();
    await profile.connect(alice).claimBadge();
    await creator.sendTransaction({ to: await profile.getAddress(), value: 1000n });
    await profile.distributeRevenue();
    await creator.sendTransaction({ to: await profile.getAddress(), value: 1000n });
    await profile.distributeRevenue();
    expect(await profile.withdrawableRevenue(creator.address)).to.equal(1600n);
    expect(await profile.withdrawableRevenue(alice.address)).to.equal(400n);
  });

  it("lets distribution succeed even when a supporter later rejects ETH", async function () {
    const { creator, profile } = await deploy();
    const RejectingSupporter = await ethers.getContractFactory("RejectingSupporter");
    const rejectingSupporter = await RejectingSupporter.deploy();
    await rejectingSupporter.waitForDeployment();
    await rejectingSupporter.claim(await profile.getAddress());
    await creator.sendTransaction({ to: await profile.getAddress(), value: 1000n });

    await expect(profile.distributeRevenue()).to.not.be.reverted;
    expect(await profile.withdrawableRevenue(await rejectingSupporter.getAddress())).to.equal(200n);
    await expect(rejectingSupporter.withdraw(await profile.getAddress()))
      .to.be.revertedWith("Withdrawal failed");
    expect(await profile.withdrawableRevenue(await rejectingSupporter.getAddress())).to.equal(200n);
  });

  it("allows URI updates only by the creator", async function () {
    const { creator, alice, profile } = await deploy();
    await expect(profile.connect(alice).setURI("ipfs://new"))
      .to.be.revertedWithCustomError(profile, "OwnableUnauthorizedAccount");
    await profile.connect(creator).setURI("ipfs://new");
    expect(await profile.uri(1)).to.equal("ipfs://new");
  });
});
