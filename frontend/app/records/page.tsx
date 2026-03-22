import { RecordsClient } from "@/components/RecordsClient";

export default function RecordsPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">My Records</h1>
      <RecordsClient />
    </div>
  );
}
