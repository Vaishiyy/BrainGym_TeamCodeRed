interface KeypadProps {
  choices: number[];
  onSelect: (value: number) => void;
  disabled: boolean;
  feedback: 'correct' | 'wrong' | null;
  correctAnswer: number;
}

/**
 * Answer selection keypad - works with both touch and keyboard.
 * Displays 4 answer choices as big arcade-style buttons.
 */
const Keypad = ({ choices, onSelect, disabled, feedback, correctAnswer }: KeypadProps) => {
  const getButtonStyle = (choice: number) => {
    if (!feedback) {
      return 'border-border hover:border-primary hover:box-glow-green bg-card text-foreground active:scale-95';
    }
    if (choice === correctAnswer) {
      return 'border-neon-green box-glow-green bg-neon-green/20 text-neon-green';
    }
    if (feedback === 'wrong') {
      return 'border-muted bg-card text-muted-foreground';
    }
    return 'border-muted bg-card text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto px-4">
      {choices.map((choice, i) => (
        <button
          key={`${choice}-${i}`}
          onClick={() => !disabled && onSelect(choice)}
          disabled={disabled}
          className={`
            border-2 rounded p-4 sm:p-6
            font-arcade text-lg sm:text-xl
            transition-all duration-150
            focus:outline-none
            ${getButtonStyle(choice)}
            ${disabled ? 'cursor-default' : 'cursor-pointer'}
          `}
        >
          <span className="text-[8px] sm:text-[10px] text-muted-foreground block mb-1">
            {i + 1}
          </span>
          {choice}
        </button>
      ))}
    </div>
  );
};

export default Keypad;
