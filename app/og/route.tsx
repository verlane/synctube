import { ImageResponse } from "next/og";
import { isValidVideoId } from "@/lib/youtube";

const WIDTH = 1200;
const HEIGHT = 630;

function thumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const a = searchParams.get("a") ?? "";
  const b = searchParams.get("b") ?? "";

  const hasBoth = isValidVideoId(a) && isValidVideoId(b);

  if (!hasBoth) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#09090b",
            color: "#fff",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          SyncTube
        </div>
      ),
      { width: WIDTH, height: HEIGHT },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#09090b",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl(a)}
          alt=""
          width={WIDTH}
          height={HEIGHT / 2}
          style={{ objectFit: "cover" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl(b)}
          alt=""
          width={WIDTH}
          height={HEIGHT / 2}
          style={{ objectFit: "cover", borderTop: "4px solid #38bdf8" }}
        />
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
