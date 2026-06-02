import { describe, it, expect } from "vitest";
import { encodeShareState, parseShareState, type ShareState } from "./share-state";

const base: ShareState = {
  a: "0w_viJPsbOk",
  b: "8W-nCivQswg",
  offset: 12.5,
  startA: 3.2,
  muted: "b",
  layout: "row",
};

describe("encodeShareState / parseShareState", () => {
  it("round-trips a full state", () => {
    const query = encodeShareState(base);
    const parsed = parseShareState(new URLSearchParams(query));
    expect(parsed).not.toBeNull();
    expect(parsed!.a).toBe(base.a);
    expect(parsed!.b).toBe(base.b);
    expect(parsed!.offset).toBeCloseTo(base.offset, 2);
    expect(parsed!.startA).toBeCloseTo(base.startA, 2);
    expect(parsed!.muted).toBe(base.muted);
    expect(parsed!.layout).toBe(base.layout);
  });

  it("encodes the expected param keys", () => {
    const params = new URLSearchParams(encodeShareState(base));
    expect(params.get("a")).toBe("0w_viJPsbOk");
    expect(params.get("b")).toBe("8W-nCivQswg");
    expect(params.has("o")).toBe(true);
    expect(params.has("s")).toBe(true);
    expect(params.get("m")).toBe("b");
  });

  it("handles a negative offset", () => {
    const parsed = parseShareState(
      new URLSearchParams(encodeShareState({ ...base, offset: -7.25 })),
    );
    expect(parsed!.offset).toBeCloseTo(-7.25, 2);
  });

  it("returns null when video ids are missing", () => {
    expect(parseShareState(new URLSearchParams("o=5&m=a"))).toBeNull();
    expect(parseShareState(new URLSearchParams("a=0w_viJPsbOk"))).toBeNull();
  });

  it("returns null when a video id is malformed", () => {
    expect(
      parseShareState(new URLSearchParams("a=not-an-id&b=8W-nCivQswg")),
    ).toBeNull();
    expect(
      parseShareState(
        new URLSearchParams("a=0w_viJPsbOk&b=<script>alert(1)</script>"),
      ),
    ).toBeNull();
  });

  it("defaults offset and startA to 0 when absent", () => {
    const parsed = parseShareState(
      new URLSearchParams("a=0w_viJPsbOk&b=8W-nCivQswg"),
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.offset).toBe(0);
    expect(parsed!.startA).toBe(0);
  });

  it("defaults muted side to 'a' when absent or invalid", () => {
    const parsed = parseShareState(
      new URLSearchParams("a=0w_viJPsbOk&b=8W-nCivQswg&m=x"),
    );
    expect(parsed!.muted).toBe("a");
  });

  it("defaults layout to 'col' when absent or invalid", () => {
    const parsed = parseShareState(
      new URLSearchParams("a=0w_viJPsbOk&b=8W-nCivQswg"),
    );
    expect(parsed!.layout).toBe("col");
  });
});
