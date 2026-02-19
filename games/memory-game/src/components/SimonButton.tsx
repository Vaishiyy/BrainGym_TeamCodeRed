import { SimonColor } from "@/hooks/useSimonGame";
import { cn } from "@/lib/utils";

interface SimonButtonProps {
  color: SimonColor;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const COLOR_STYLES: Record<SimonColor, { base: string; active: string; shadow: string }> = {
  green: {
    base: "bg-simon-green",
    active: "bg-simon-green-glow shadow-[0_0_30px_8px_hsl(0_0%_100%/0.4)]",
    shadow: "shadow-[inset_-3px_-3px_0_hsl(0_0%_65%),inset_3px_3px_0_hsl(0_0%_85%)]",
  },
  red: {
    base: "bg-simon-red",
    active: "bg-simon-red-glow shadow-[0_0_30px_8px_hsl(0_0%_60%/0.4)]",
    shadow: "shadow-[inset_-3px_-3px_0_hsl(0_0%_30%),inset_3px_3px_0_hsl(0_0%_50%)]",
  },
  yellow: {
    base: "bg-simon-yellow",
    active: "bg-simon-yellow-glow shadow-[0_0_30px_8px_hsl(0_0%_80%/0.4)]",
    shadow: "shadow-[inset_-3px_-3px_0_hsl(0_0%_50%),inset_3px_3px_0_hsl(0_0%_70%)]",
  },
  blue: {
    base: "bg-simon-blue",
    active: "bg-simon-blue-glow shadow-[0_0_30px_8px_hsl(0_0%_45%/0.4)]",
    shadow: "shadow-[inset_-3px_-3px_0_hsl(0_0%_15%),inset_3px_3px_0_hsl(0_0%_35%)]",
  },
};

const POSITION_STYLES: Record<string, string> = {
  "top-left": "rounded-tl-[40%] rounded-tr-sm rounded-bl-sm rounded-br-sm",
  "top-right": "rounded-tr-[40%] rounded-tl-sm rounded-bl-sm rounded-br-sm",
  "bottom-left": "rounded-bl-[40%] rounded-tl-sm rounded-tr-sm rounded-br-sm",
  "bottom-right": "rounded-br-[40%] rounded-tl-sm rounded-tr-sm rounded-bl-sm",
};

export function SimonButton({ color, isActive, disabled, onClick, position }: SimonButtonProps) {
  const styles = COLOR_STYLES[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px]",
        "transition-all duration-100",
        "border-[3px] border-foreground/20",
        "focus:outline-none",
        POSITION_STYLES[position],
        styles.base,
        styles.shadow,
        isActive && styles.active,
        isActive && "scale-105 brightness-150",
        !disabled && !isActive && "hover:brightness-125 active:scale-95 active:brightness-150",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label={`${color} button`}
    />
  );
}
