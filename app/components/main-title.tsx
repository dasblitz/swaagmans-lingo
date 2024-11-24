export function MainTitle(props) {
  return (
    <h1 className={props.isPlaying ? "in-game" : ""}>
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
