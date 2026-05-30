/**
 * Global deterministic audit workflow scaffold.
 * Prefix global workflows with `sys-`.
 */

export async function run(context) {
  const findings = [];

  // Add deterministic orchestration here:
  // - inspect repository metadata
  // - spawn bounded subagents
  // - collect findings
  // - deduplicate by source-of-truth evidence

  return {
    status: "complete",
    findings,
    notes: [
      "This is a scaffold. Fill in workflow-specific orchestration logic before use."
    ]
  };
}
