const highRiskSurfaces = [
  "deployment and upgrade scripts",
  "signer and admin-role selection",
  "ABI or generated artifact drift",
  "chain configuration and address changes",
  "GitHub workflow and release automation edits",
  "unlimited approvals and permit flows",
  "mainnet-targeted writes and broadcasts",
  "privileged proxy, owner, timelock, or governance paths",
];

const blockedCommandPatterns = [
  "git push --force",
  "git reset --hard",
  "rm -rf",
  "terraform destroy",
  "kubectl delete",
  "cast wallet",
  "solana-keygen recover",
  "cast send",
  "--broadcast",
  "forge script",
  "hardhat ignition deploy",
  "npm run deploy",
  "pnpm deploy",
];

const sensitiveFilePatterns = [
  ".env",
  ".env.*",
  "abi/**",
  "config/**",
  "deploy/**",
  "script/**",
  "scripts/**",
  ".github/workflows/**",
  "app/admin/**",
  "src/admin/**",
];

module.exports = {
  highRiskSurfaces,
  blockedCommandPatterns,
  sensitiveFilePatterns,
};
