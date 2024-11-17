import type { MetaFunction } from "partymix";
import NewGameScreen from "~/components/new-game-screen";

export const meta: MetaFunction = () => {
  return [
    { title: "Welkom bij Warffum's Swaagmans Lingo" },
    { name: "description", content: "Speel Swaagmans Lingo tijdens de Warffum lichtjesweek" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <NewGameScreen />
    </div>
  );
}
