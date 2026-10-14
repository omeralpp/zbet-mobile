import { writeFileSync } from "node:fs";
import { z } from "zod";
import { decisionContextSchema } from "../src/api/schemas";

// OpenAPI 3.1 references this JSON Schema; semantic refinements remain enforced
// by the source Zod validator, native record adapter and sealed runtime policy.
const schema = { ...z.toJSONSchema(decisionContextSchema),
  title: "Opt-in BTB decision context V2/V3",
  description: "V3 adds immutable model identity and descriptive pressure direction for tied leading scores. Estimated activity is not provider-proven coherence or a goal probability.",
  "x-validation-source": "../src/api/schemas.ts" };
writeFileSync(new URL("../contracts/decision-context.schema.json", import.meta.url), `${JSON.stringify(schema, null, 2)}\n`);
