import { z, type ZodType } from "zod";
import { getAccessToken } from "@/src/auth/session-store";
import { runtimeConfig } from "@/src/config/runtime";
import { getApiAuthHeaders } from "./api-auth-headers";
import {
  dashboardSchema,
  matchDetailSchema,
  matchInsightListSchema,
  matchInsightSchema,
  matchListSchema,
  superLogDetailSchema,
  superLogListSchema,
  superKpisSchema,
  totoProgramListSchema,
  totoProgramSchema
} from "./schemas";
import { MobileApiError, type MobileApi } from "./mobile-api";

const requestTimeoutMs = 15_000;

export function createHttpMobileApi(baseUrl: string): MobileApi {
  async function request<T>(
    path: string,
    schema: ZodType<T>,
    init: RequestInit = {},
    outerSignal?: AbortSignal
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    const abort = () => controller.abort();
    outerSignal?.addEventListener("abort", abort, { once: true });

    try {
      const token = runtimeConfig.pilotAccessKey
        ? undefined
        : await getAccessToken();
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...getApiAuthHeaders(runtimeConfig.pilotAccessKey, token),
          ...init.headers
        },
        signal: controller.signal
      });

      if (!response.ok) {
        let message = `Mobil servis hatası (${response.status}).`;
        let code: string | undefined;
        try {
          const errorBody = (await response.json()) as {
            message?: string;
            code?: string;
          };
          message = errorBody.message || message;
          code = errorBody.code;
        } catch {
          // A non-JSON error body must not hide the HTTP status.
        }
        throw new MobileApiError(message, response.status, code);
      }

      const data: unknown = await response.json();
      return schema.parse(data);
    } catch (error) {
      if (error instanceof MobileApiError) {
        throw error;
      }
      if (controller.signal.aborted) {
        throw new MobileApiError(
          "Mobil servis zaman aşımına uğradı.",
          408,
          "REQUEST_TIMEOUT"
        );
      }
      throw new MobileApiError(
        error instanceof Error ? error.message : "Mobil servise ulaşılamadı."
      );
    } finally {
      clearTimeout(timeout);
      outerSignal?.removeEventListener("abort", abort);
    }
  }

  return {
    getDashboard: (signal) =>
      request("/v1/dashboard", dashboardSchema, {}, signal),
    getMatches: (signal) =>
      request("/v1/btb/matches", matchListSchema, {}, signal),
    getMatchInsights: (signal) =>
      request(
        "/v1/btb/match-insights",
        matchInsightListSchema,
        {},
        signal
      ),
    getMatchInsight: (key, signal) =>
      request(
        `/v1/btb/match-insights/${encodeURIComponent(key)}`,
        matchInsightSchema,
        {},
        signal
      ),
    getMatch: (key, signal) =>
      request(
        `/v1/btb/matches/${encodeURIComponent(key)}`,
        matchDetailSchema,
        {},
        signal
      ),
    getSuperLogs: (signal) =>
      request("/v1/super/logs", superLogListSchema, {}, signal),
    getSuperKpis: (signal) =>
      request("/v1/super/kpis", superKpisSchema, {}, signal),
    getSuperLog: (key, signal) =>
      request(
        `/v1/super/logs/${encodeURIComponent(key)}`,
        superLogDetailSchema,
        {},
        signal
      ),
    getTotoPrograms: (signal) =>
      request("/v1/toto/programs", totoProgramListSchema, {}, signal),
    getTotoProgram: (gcNo, version, signal) =>
      request(
        `/v1/toto/programs/${gcNo}/${version}`,
        totoProgramSchema,
        {},
        signal
      ),
    registerDevice: async (token, platform, signal) => {
      await request(
        "/v1/devices",
        // The endpoint deliberately returns a stable empty acknowledgement.
        z.strictObject({}),
        {
          method: "POST",
          body: JSON.stringify({ token, platform })
        },
        signal
      );
    }
  };
}
