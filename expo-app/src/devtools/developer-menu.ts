export async function openDeveloperMenu(): Promise<boolean> {
  if (!__DEV__) {
    return false;
  }

  const devMenu = await import("expo-dev-menu");
  devMenu.openMenu();
  return true;
}
