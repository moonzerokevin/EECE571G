"use client";

import { contractErrorSummary } from "@/lib/formatTxError";

type Props = {
  error: Error | null | undefined;
};

/**
 * Short message for humans; full viem stack in a collapsed <details>.
 */
export function TxErrorAlert({ error }: Props) {
  if (!error) return null;
  const { user, technical } = contractErrorSummary(error);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
      <p className="font-medium leading-snug">{user}</p>
      <details className="mt-2 text-xs text-red-800/90 dark:text-red-200/90">
        <summary className="cursor-pointer select-none font-medium hover:underline">
          Technical details
        </summary>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono opacity-90">
          {technical}
        </pre>
      </details>
    </div>
  );
}
