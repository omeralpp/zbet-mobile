import { useLocalSearchParams } from "expo-router";
import { MatchDetailView } from "@/src/screens/MatchDetailView";

function firstParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** The full-screen match detail route; the view itself lives in src/screens. */
export default function MatchDetailScreen() {
  const params = useLocalSearchParams<{ key?: string | string[] }>();
  return <MatchDetailView matchKey={firstParam(params.key)} />;
}
