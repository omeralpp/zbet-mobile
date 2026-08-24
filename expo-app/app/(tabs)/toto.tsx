import { useQuery } from "@tanstack/react-query";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { totoProgramsQuery } from "@/src/api/queries";
import { Screen } from "@/src/components/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import { TotoProgramCard } from "@/src/components/TotoProgramCard";
import { colors } from "@/src/theme/theme";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";

export default function TotoScreen() {
  const query = useQuery(totoProgramsQuery);

  return (
    <Screen
      contentStyle={styles.screen}
      eyebrow="SPOR TOTO"
      scroll={false}
      title="Programlar"
    >
      {query.isLoading ? (
        <LoadingState label="Toto programları hazırlanıyor" />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Toto programları alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={query.data}
          keyExtractor={(item) => item.key}
          ListEmptyComponent={
            <EmptyState
              message="Henüz mobil görünümde bir Toto programı yok."
              title="Program yok"
            />
          }
          refreshControl={
            <RefreshControl
              colors={[colors.green]}
              onRefresh={() => query.refetch()}
              refreshing={query.isRefetching}
              tintColor={colors.green}
            />
          }
          renderItem={({ item, index }) =>
            index === 0 ? (
              <TutorialTarget id="toto-first-card">
                <TotoProgramCard program={item} />
              </TutorialTarget>
            ) : (
              <TotoProgramCard program={item} />
            )
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0
  },
  list: {
    paddingBottom: 112
  }
});
