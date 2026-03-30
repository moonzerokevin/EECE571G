import { redirect } from "next/navigation";

/** Dispute UI is intentionally hidden from nav; keep route from 404 for old links. */
export default function DisputePage() {
  redirect("/");
}
