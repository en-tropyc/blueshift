# Blueshift

A collection of Solana blockchain projects and tools.

## Projects

### 🏦 Blueshift Anchor Vault (`blueshift_anchor_vault/`)

A Solana program built with Anchor framework that implements a simple SOL vault system where users can deposit and withdraw SOL to their personal Program Derived Address (PDA) vaults.

#### Features

- **User-specific vaults**: Each user gets their own vault derived from their public key
- **Deposit functionality**: Deposit SOL into your personal vault
- **Withdraw functionality**: Withdraw all SOL from your vault
- **Error handling**: Prevents double deposits and invalid amounts
- **Security**: Uses PDAs for secure, deterministic vault addresses

#### Quick Start

```bash
cd blueshift_anchor_vault

# Install dependencies
yarn install

# Build the program
anchor build

# Start local validator (in separate terminal)
solana-test-validator

# Deploy and test
anchor test --skip-local-validator
```

#### Program Instructions

- `deposit(amount: u64)` - Deposit SOL into your vault
- `withdraw()` - Withdraw all SOL from your vault

#### Architecture

- **Program ID**: Auto-generated during deployment
- **Vault PDA**: Derived from `["vault", user_pubkey]`
- **Accounts**: Uses System Program for SOL transfers

## Development

### Prerequisites

- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

### Local Development

1. Start a local Solana validator:
   ```bash
   solana-test-validator
   ```

2. Configure Solana to use localhost:
   ```bash
   solana config set --url localhost
   ```

3. Navigate to a project and follow its specific instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 
