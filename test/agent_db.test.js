import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDbSchemaDescription,
  executeDbQueryTool,
  databaseAgentTools,
} from "../server.js";

test("getDbSchemaDescription mengembalikan deskripsi skema 7 tabel relasional", () => {
  const schema = getDbSchemaDescription();
  assert.ok(schema.includes("schools"), "Harus menyebutkan tabel schools");
  assert.ok(schema.includes("school_profiles"), "Harus menyebutkan tabel school_profiles");
  assert.ok(schema.includes("school_majors"), "Harus menyebutkan tabel school_majors");
  assert.ok(schema.includes("school_facilities"), "Harus menyebutkan tabel school_facilities");
  assert.ok(schema.includes("school_address_contacts"), "Harus menyebutkan tabel school_address_contacts");
  assert.ok(schema.includes("school_ppdb"), "Harus menyebutkan tabel school_ppdb");
  assert.ok(schema.includes("school_activities"), "Harus menyebutkan tabel school_activities");
  assert.ok(schema.includes("school_id"), "Harus menjelaskan foreign key school_id");
});

test("databaseAgentTools memiliki skema function declaration Gemini yang valid", () => {
  assert.ok(Array.isArray(databaseAgentTools));
  const decl = databaseAgentTools[0]?.functionDeclarations?.[0];
  assert.equal(decl.name, "execute_sql_query");
  assert.equal(decl.parameters.type, "OBJECT");
  assert.ok(decl.parameters.properties.sql);
  assert.deepEqual(decl.parameters.required, ["sql"]);
});

test("executeDbQueryTool guardrail: menolak query non-SELECT", async () => {
  const res1 = await executeDbQueryTool("DELETE FROM schools WHERE id = 1");
  assert.ok(res1.error);
  assert.match(res1.error, /Hanya query SELECT/);

  const res2 = await executeDbQueryTool("INSERT INTO schools (name) VALUES ('Test')");
  assert.ok(res2.error);
  assert.match(res2.error, /Hanya query SELECT/);
});

test("executeDbQueryTool guardrail: menolak DDL / DML berbahaya meski diawali select", async () => {
  const res = await executeDbQueryTool("SELECT * FROM schools; DROP TABLE schools;");
  assert.ok(res.error);
  assert.match(res.error, /dilarang/);
});
