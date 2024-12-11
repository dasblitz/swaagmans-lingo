interface MainTitle {
  isPlaying?: boolean;
}

export function MainTitle({ isPlaying = false }: MainTitle) {
  return (
    <h1 className={isPlaying ? "in-game" : ""}>
      <span className="street">Swaagmans</span>
      <em>
        {"Lingo".split("").map((letter) => (
          <span className="lingo-letter" key={letter}>
            {letter}
          </span>
        ))}
      </em>
    </h1>
  );
}
