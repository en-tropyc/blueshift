import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlueshiftAnchorVault } from "../target/types/blueshift_anchor_vault";
import { expect } from "chai";

describe("blueshift_anchor_vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BlueshiftAnchorVault as Program<BlueshiftAnchorVault>;
  const provider = anchor.getProvider();

  it("Can deposit SOL into vault", async () => {
    const user = anchor.web3.Keypair.generate();
    
    // Fund the user account
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive the vault PDA
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );

    const depositAmount = anchor.web3.LAMPORTS_PER_SOL; // 1 SOL

    // Get initial balances
    const userInitialBalance = await provider.connection.getBalance(user.publicKey);
    console.log(`User initial balance: ${userInitialBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    // Deposit transaction
    const tx = await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Deposit transaction signature:", tx);

    // Check balances after deposit
    const userFinalBalance = await provider.connection.getBalance(user.publicKey);
    const vaultBalance = await provider.connection.getBalance(vaultPda);

    console.log(`User final balance: ${userFinalBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Vault balance: ${vaultBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    // Verify the deposit worked
    expect(vaultBalance).to.equal(depositAmount);
    expect(userFinalBalance).to.be.lessThanOrEqual(userInitialBalance - depositAmount); // Less than or equal due to minimal tx fees in test env
  });

  it("Can withdraw all SOL from vault", async () => {
    const user = anchor.web3.Keypair.generate();
    
    // Fund the user account
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive the vault PDA
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );

    const depositAmount = anchor.web3.LAMPORTS_PER_SOL;

    // First deposit
    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Get balance before withdrawal
    const userBalanceBeforeWithdraw = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceBeforeWithdraw = await provider.connection.getBalance(vaultPda);

    console.log(`User balance before withdraw: ${userBalanceBeforeWithdraw / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Vault balance before withdraw: ${vaultBalanceBeforeWithdraw / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    // Withdraw transaction
    const withdrawTx = await program.methods
      .withdraw()
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Withdraw transaction signature:", withdrawTx);

    // Check balances after withdrawal
    const userFinalBalance = await provider.connection.getBalance(user.publicKey);
    const vaultFinalBalance = await provider.connection.getBalance(vaultPda);

    console.log(`User final balance: ${userFinalBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Vault final balance: ${vaultFinalBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    // Verify the withdrawal worked
    expect(vaultFinalBalance).to.equal(0);
    expect(userFinalBalance).to.be.greaterThan(userBalanceBeforeWithdraw);
  });

  it("Fails to deposit to existing vault", async () => {
    const user = anchor.web3.Keypair.generate();
    
    // Fund the user account
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive the vault PDA
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );

    const depositAmount = anchor.web3.LAMPORTS_PER_SOL;

    // First deposit (should succeed)
    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        signer: user.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Second deposit (should fail)
    try {
      await program.methods
        .deposit(new anchor.BN(depositAmount))
        .accounts({
          signer: user.publicKey,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Expected transaction to fail");
    } catch (error) {
      expect(error.toString()).to.include("VaultAlreadyExists");
    }
  });
});
