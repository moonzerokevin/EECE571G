import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">IdeaStamp — course prototype</h1>
      <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
        Minimal end-to-end flow from the Assignment 2 white paper: on-chain salted commitments, optional
        reveal, and public verification. Token staking, DAO, and extended dispute flows are out of scope for
        this UI prototype.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          { href: "/commit", t: "Commit", d: "Pay commit fee and submit commitmentHash" },
          { href: "/reveal", t: "Reveal", d: "Reveal contentHash and salt" },
          { href: "/verify", t: "Verify", d: "Derive or look up a commitment on-chain" },
          { href: "/records", t: "My Records", d: "Commitments for the connected wallet" },
        ].map(({ href, t, d }) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{t}</span>
              <p className="mt-1 text-sm text-zinc-500">{d}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-zinc-500">
        Local chain: run <code className="font-mono">npx hardhat node</code>, then{" "}
        <code className="font-mono">npm run deploy:local</code> (updates{" "}
        <code className="font-mono">frontend/.env.local</code>).
      </p>
    </div>
  );
}
