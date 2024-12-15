import { FormEvent, useState } from "react";

interface GuessFormElements extends HTMLFormControlsCollection {
  guess: HTMLInputElement;
}

interface GuessFormElement extends HTMLFormElement {
  readonly elements: GuessFormElements;
}

interface SubmitGuessFormProps {
  onSubmit: (guess: string) => void;
}

export function SubmitGuessForm({ onSubmit }: SubmitGuessFormProps) {
  const [formDisabled, setFormDisabled] = useState(false);
  const [value, setValue] = useState("");

  const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setValue(value);
  };

  const handleSubmitGuess = (event: FormEvent<GuessFormElement>) => {
    try {
      const guess = event.currentTarget.elements.guess.value;
      setFormDisabled(true);
      setTimeout(() => {
        setFormDisabled(false);
      }, 3000);

      setValue("");
      onSubmit(guess.toLowerCase());
      window.scrollTo({ top: 0 });
    } catch (error) {
      console.error(error);
    }

    event.preventDefault();
    return false;
  };

  return (
    <form onSubmit={handleSubmitGuess}>
      <input
        type="text"
        name="guess"
        maxLength={5}
        value={value}
        onChange={handleInputChange}
      />
      <button disabled={formDisabled || value.length !== 5}>Verstuur</button>
    </form>
  );
}
