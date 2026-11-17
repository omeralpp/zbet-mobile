import { Redirect } from "expo-router";

/**
 * Günlük Kuponlar no longer has a screen of its own (owner direction
 * 2026-11-17): today's coupons are an Özet module and their results are in
 * Karar günlüğü. An old link or bookmark lands on those results.
 */
export default function DailyCouponsRedirect() {
  return <Redirect href={{ pathname: "/super", params: { view: "COUPONS" } } as never} />;
}
