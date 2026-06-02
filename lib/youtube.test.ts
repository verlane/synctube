import { describe, it, expect } from "vitest";
import { extractVideoId } from "./youtube";

describe("extractVideoId", () => {
  it("parses a standard watch URL", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=0w_viJPsbOk")).toBe(
      "0w_viJPsbOk",
    );
  });

  it("parses a watch URL with extra params", () => {
    expect(
      extractVideoId("https://www.youtube.com/watch?v=8W-nCivQswg&t=42s"),
    ).toBe("8W-nCivQswg");
  });

  it("parses a short youtu.be URL", () => {
    expect(extractVideoId("https://youtu.be/0w_viJPsbOk")).toBe("0w_viJPsbOk");
  });

  it("parses a short youtu.be URL with params", () => {
    expect(extractVideoId("https://youtu.be/8W-nCivQswg?t=10")).toBe(
      "8W-nCivQswg",
    );
  });

  it("parses an embed URL", () => {
    expect(
      extractVideoId("https://www.youtube.com/embed/0w_viJPsbOk"),
    ).toBe("0w_viJPsbOk");
  });

  it("parses a mobile URL", () => {
    expect(extractVideoId("https://m.youtube.com/watch?v=8W-nCivQswg")).toBe(
      "8W-nCivQswg",
    );
  });

  it("accepts a bare 11-char video id", () => {
    expect(extractVideoId("0w_viJPsbOk")).toBe("0w_viJPsbOk");
  });

  it("trims surrounding whitespace", () => {
    expect(extractVideoId("  https://youtu.be/0w_viJPsbOk  ")).toBe(
      "0w_viJPsbOk",
    );
  });

  it("returns null for an empty string", () => {
    expect(extractVideoId("")).toBeNull();
  });

  it("returns null for a non-youtube URL", () => {
    expect(extractVideoId("https://example.com/watch?v=abc")).toBeNull();
  });
});
