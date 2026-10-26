import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { RouteNotFound } from "@/src/components/RouteNotFound";
import { Screen } from "@/src/components/Screen";
import { RebuildDecisionView } from "@/src/screens/RebuildDecisionView";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

/** An RB1 published record's identity: 32 upper-case hex characters. */
const rebuildDecisionId = /^[A-F0-9]{32}$/;

/**
 * Super kararı. RB1 records open their decision page; any other key is an old
 * A3 Super link (a notification or bookmark), retired from the client by owner
 * decision on 2026-10-21, and lands on the board's "Ekran bulunamadı" state.
 */
export default function SuperDecisionScreen() {
  const params = useLocalSearchParams<{ key?: string | string[]; match?: string | string[] }>();
  const router = useRouter();
  const key = firstParam(params.key);
  const back = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/super");
    }
  };
  if (!rebuildDecisionId.test(key)) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={back}>
        <Stack.Screen options={{ title: "Super kararı" }} />
        <RouteNotFound />
      </Screen>
    );
  }
  return <RebuildDecisionView decisionId={key} matchKey={firstParam(params.match)} onEdgeSwipeBack={back} />;
}
