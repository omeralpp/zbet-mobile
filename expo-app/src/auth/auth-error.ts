type AuthErrorLike = {
  code?: unknown;
  message?: unknown;
};

export function toFriendlyAuthError(
  error: unknown,
  fallback = "Güvenli giriş tamamlanamadı. Lütfen yeniden deneyin."
): string {
  const candidate =
    error && typeof error === "object" ? (error as AuthErrorLike) : {};
  const code =
    typeof candidate.code === "string" ? candidate.code.toLowerCase() : "";
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof candidate.message === "string"
        ? candidate.message.toLowerCase()
        : "";
  const diagnostic = `${code} ${message}`;

  if (
    diagnostic.includes("invalid_grant") ||
    diagnostic.includes("invalid code format") ||
    diagnostic.includes("expired") ||
    diagnostic.includes("revoked")
  ) {
    return "Giriş bağlantısının süresi doldu. Lütfen yeniden giriş yapın.";
  }
  if (
    diagnostic.includes("state_mismatch") ||
    diagnostic.includes("cross-site request verification")
  ) {
    return "Güvenli giriş doğrulanamadı. Lütfen giriş işlemini yeniden başlatın.";
  }
  if (
    diagnostic.includes("network") ||
    diagnostic.includes("fetch") ||
    diagnostic.includes("internet")
  ) {
    return "Kimlik sunucusuna ulaşılamadı. İnternet bağlantınızı kontrol edin.";
  }
  if (
    diagnostic.includes("invalid_client") ||
    diagnostic.includes("redirect_uri")
  ) {
    return "Mobil giriş yapılandırması doğrulanamadı. Lütfen yöneticinize bildirin.";
  }
  return fallback;
}
