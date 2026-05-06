import { describe, expect, test } from "vitest";

import { buildSafeGeneratedStorageKeyFromSegments } from "@/lib/storage";

describe("generated file route storage keys", () => {
  test("accepts generated asset keys", () => {
    expect(
      buildSafeGeneratedStorageKeyFromSegments([
        "generated",
        "project_123",
        "board_final.pdf",
      ]),
    ).toBe("generated/project_123/board_final.pdf");
  });

  test("rejects traversal and non-generated file keys", () => {
    expect(buildSafeGeneratedStorageKeyFromSegments(["..", ".env"])).toBeNull();
    expect(
      buildSafeGeneratedStorageKeyFromSegments(["generated", "..", ".env"]),
    ).toBeNull();
    expect(
      buildSafeGeneratedStorageKeyFromSegments(["generated%2F..", ".env"]),
    ).toBeNull();
    expect(
      buildSafeGeneratedStorageKeyFromSegments(["private", "secret.txt"]),
    ).toBeNull();
  });
});
