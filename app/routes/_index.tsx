import QRCode from "qrcode";
import type { LoaderFunctionArgs, MetaFunction } from "partymix";
import NewGameScreen from "~/components/new-game-screen";
import { useLoaderData } from "@remix-run/react";
import { Howl } from "howler";
import { gameAudioConfig } from "../sound/game-audio";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Welkom bij Warffum's Swaagmans Lingo" },
    {
      name: "description",
      content: "Speel Swaagmans Lingo tijdens de Warffum lichtjesweek",
    },
  ];
};

// With async/await
const generateQR = async (text: string) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error(err);
  }
};

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const gameRoom = searchParams.get("game-room");
  let qr: string = "";
  if (gameRoom) {
    qr = (await generateQR(
      `https://85d3-62-45-87-108.ngrok-free.app/player?game-room=${gameRoom}`
    )) as unknown as string;
  }

  return { qr };
}

export default function Index() {
  const { qr } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <NewGameScreen qr={qr} />
    </div>
  );
}
