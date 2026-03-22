# White Paper Feature Mapping

## White Paper Core Claim
IdeaStamp provides a privacy-preserving, timestamped, blockchain-based registry for proving prior possession of research ideas and preprints.

## Prototype Mapping
### Feature 1: Timestamped Commitments
**White paper promise:** authors can create an immutable commitment without revealing the idea.

**Prototype implementation:**
- `IdeaRegistry.commit(bytes32 commitmentHash, bytes32 metadataHash, string cid)`
- Stores author, timestamp, block number, and commitment hash.
- Prevents duplicate commitment hashes.

### Feature 2: Reveal and Verification
**White paper promise:** authors can later reveal the content and prove prior possession.

**Prototype implementation:**
- `IdeaRegistry.reveal(bytes32 contentHash, bytes32 salt, bytes32 metadataHash, string cid)`
- `IdeaRegistry.computeCommitment(...)`
- `IdeaRegistry.getCommitment(...)`

### Feature 3: Public Verifiability
**White paper promise:** third parties can verify priority claims.

**Prototype implementation:**
- publicly readable commitment records
- deterministic commitment formula
- author dashboard and verification pages represented in the wireframe

### Feature 4: Dispute Handling
**White paper promise:** a dispute process exists when claims conflict.

**Prototype implementation:**
- `DisputeRegistryLite.openDispute(...)`
- `DisputeRegistryLite.resolveDispute(...)`

This is deliberately limited to dispute registration plus admin resolution for course scope.

## Deferred White Paper Features
The following features are acknowledged but not implemented in Assignment 3:
- ERC20 token incentives and staking
- decentralized arbitrator selection
- DAO treasury governance
- organization subscriptions and premium accounts
- advanced prior-art similarity search
