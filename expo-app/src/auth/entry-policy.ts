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
        "Bu pilot sürüm kullanıcı adı veya parola istemez. Devam ettiğinizde yalnız görüntüleme amaçlı güvenli BTB erişimi kullanılır.",
      buttonText: "Pilot uygulamasına gir",
      footerText:
        "Bu pilot erişim kişisel bir kullanıcı hesabı oluşturmaz."
    };
  }

  return {
    securityTitle: "Kurumsal oturum",
    securityText:
      "Parolanız uygulamada tutulmaz. Giriş, güvenli kurumsal doğrulama üzerinden tamamlanır.",
    buttonText: "Güvenli giriş yap",
    footerText:
      "Mobil görünüm salt okunur çalışır. Maç veya program güncellemesi gerektiren işlemler BTB Web ekranında açılır."
  };
}
