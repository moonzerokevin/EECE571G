import { disputeRegistryAddress, ideaRegistryAddress } from "@/lib/contracts";

export function ContractHint() {
  const idea = ideaRegistryAddress();
  const dispute = disputeRegistryAddress();
  if (idea && dispute) return null;
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      Set <code className="font-mono">NEXT_PUBLIC_IDEA_REGISTRY</code> and{" "}
      <code className="font-mono">NEXT_PUBLIC_DISPUTE_REGISTRY</code> in{" "}
      <code className="font-mono">frontend/.env.local</code> (addresses from your deploy).
    </p>
  );
}
