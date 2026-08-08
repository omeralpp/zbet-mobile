import { z, type ZodType } from "zod";
import { clearSession } from "@/src/auth/session-store";
import { getValidAccessToken } from "@/src/auth/token-manager";
import { runtimeConfig } from "@/src/config/runtime";
import { getApiAuthHeaders } from "./api-auth-headers";
import { buildDeviceRegistrationPayload } from "./device-registration";
import {
  dashboardSchema,
  matchDetailSchema,
  matchInsightListSchema,
  matchInsightSchema,
  matchLeagueContextSchema,
  matchListSchema,
  periodScoreContextSchema,
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
      const token =
        runtimeConfig.authMode === "oauth"
          ? await getValidAccessToken()
          : undefined;
      if (runtimeConfig.authMode === "oauth" && !token) {
        throw new MobileApiError(
          "Güvenli oturum gerekli.",
          401,
          "UNAUTHENTICATED"
        );
      }
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
        if (response.status === 401 && runtimeConfig.authMode === "oauth") {
          await clearSession();
        }
        throw new MobileApiError(message, response.status, code);
      }

      const data: unknown =
        response.status === 204 ? undefined : await response.json();
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
    getMatchLeagueContext: (key, signal) =>
      request(
        `/v1/btb/matches/${encodeURIComponent(key)}/league-context`,
        matchLeagueContextSchema,
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
    getMatchPeriodScore: (key, signal) =>
      request(
        `/v1/btb/matches/${encodeURIComponent(key)}/period-score`,
        periodScoreContextSchema,
        {},
        signal
      ),
    getMatchSuperLogs: (key, signal) =>
      request(
        `/v1/btb/matches/${encodeURIComponent(key)}/super-logs`,
        superLogListSchema,
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
    getSuperLogPeriodScore: (key, signal) =>
      request(
        `/v1/super/logs/${encodeURIComponent(key)}/period-score`,
        periodScoreContextSchema,
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
    registerDevice: async (token, platform, installationId, signal) => {
      await request(
        "/v1/devices",
        // The endpoint deliberately returns a stable empty acknowledgement.
        z.strictObject({}),
        {
          method: "POST",
          body: JSON.stringify(
            buildDeviceRegistrationPayload(token, platform, installationId)
          )
        },
        signal
      );
    },
    unregisterDevice: async (installationId, signal) => {
      await request(
        `/v1/devices/${encodeURIComponent(installationId)}`,
        z.undefined(),
        { method: "DELETE" },
        signal
      );
    }
  };
}
