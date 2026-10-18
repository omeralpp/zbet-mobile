import { Redirect } from "expo-router";
import { runtimeConfig } from "@/src/config/runtime";
import { designLabAvailable } from "@/src/design-lab/jinx-motion";
import DesignLabScreen from "@/src/design-lab/DesignLabScreen";

/** Preview-only route, protected again here as well as in the root navigator. */
export default function DesignLabRoute() {
  return designLabAvailable(runtimeConfig) ? <DesignLabScreen /> : <Redirect href="/" />;
}
