import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedSapWebUrl,
  parseSapWebAllowedHosts
} from "./sap-web-boundary";

test("allows only configured SAP HTTPS destinations", () => {
  const hosts = parseSapWebAllowedHosts(
    "*.hana.ondemand.com, *.accounts.ondemand.com, *.trial-accounts.ondemand.com, invalid"
  );
  assert.equal(
    isAllowedSapWebUrl(
      "https://tenant.launchpad.cfapps.us10.hana.ondemand.com/site",
      hosts
    ),
    true
  );
  assert.equal(
    isAllowedSapWebUrl("https://login.accounts.ondemand.com/", hosts),
    true
  );
  assert.equal(
    isAllowedSapWebUrl(
      "https://apouezlwd.trial-accounts.ondemand.com/oauth2/authorize",
      hosts
    ),
    true
  );
  assert.equal(isAllowedSapWebUrl("https://hana.ondemand.com/", hosts), false);
  assert.equal(isAllowedSapWebUrl("https://example.com/", hosts), false);
  assert.equal(isAllowedSapWebUrl("http://tenant.hana.ondemand.com/", hosts), false);
});

test("rejects credentialed and overly broad host patterns", () => {
  const hosts = parseSapWebAllowedHosts("*.com,*.hana.ondemand.com");
  assert.deepEqual(hosts, ["*.hana.ondemand.com"]);
  assert.equal(
    isAllowedSapWebUrl(
      "https://user:password@tenant.hana.ondemand.com/",
      hosts
    ),
    false
  );
});
