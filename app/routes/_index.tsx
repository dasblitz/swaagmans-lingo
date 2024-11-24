import QRCode from 'qrcode'
import type { LoaderFunctionArgs, MetaFunction } from "partymix";
import NewGameScreen from "~/components/new-game-screen";
import { json, useLoaderData, useRouteLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: "Welkom bij Warffum's Swaagmans Lingo" },
    { name: "description", content: "Speel Swaagmans Lingo tijdens de Warffum lichtjesweek" },
  ];
};

// With async/await
const generateQR = async (text:string) => {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error(err)
  }
}

export async function loader({request}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams
  const gameRoom = searchParams.get('game-room')
  let qr: string = '';
  if (gameRoom) {

    qr = (await generateQR(`http://192.168.1.77:1999/player?game-room=${gameRoom}`)) as unknown as string
  }

  return json({qr})
}

export default function Index() {
  const {qr} = useLoaderData<typeof loader>()
  console.log({qr})
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <NewGameScreen qr={qr}/>
    </div>
  );
}
