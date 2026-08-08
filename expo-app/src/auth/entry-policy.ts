export type EntryAuthMode = "preview" | "pilot" | "oauth";

export type ImmediateAuthStatus = "preview" | "unauthenticated" | null;

export type AuthEntryPresentation = {
  securityTitle: string;
  securityText: string;
  buttonText: string;
  footerText: string;
};

export function resolveImmediateAuthStatus(
  authMode: EntryAuthMode
): ImmediateAuthStatus {
  if (authMode === "preview") {
    return "preview";
  }
  if (authMode === "pilot") {
    return "unauthenticated";
  }
  return null;
}

export function resolveAuthEntryPresentation(
  authMode: EntryAuthMode
): AuthEntryPresentation {
  if (authMode === "pilot") {
    return {
      securityTitle: "Pilot erişimi",
      securityText:
        "Bu pilot sürüm kullanıcı adı veya parola istemez. Devam ettiğinizde yalnız salt okunur Mobile BFF erişimi kullanılır.",
      buttonText: "Pilot uygulamasına gir",
      footerText:
        "Bu ekran kullanıcı kimliği doğrulamaz. Kurumsal kullanıcı girişi, OAuth ortamı devreye alındığında etkinleşir."
    };
  }

  return {
    securityTitle: "Kurumsal oturum",
    securityText:
      "Parolanız uygulamada tutulmaz. Giriş, OAuth 2.0 Authorization Code ve PKCE akışıyla tamamlanır.",
    buttonText: "Güvenli giriş yap",
    footerText:
      "İlk sürüm salt okunur çalışır. Livescore ve program yenileme gibi değişiklik yapan işlemler doğrulanmış Fiori ekranında açılır."
  };
}
