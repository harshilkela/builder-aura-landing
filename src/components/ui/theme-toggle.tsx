import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Sparkles } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="relative overflow-hidden group hover:bg-white/10 dark:hover:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:shadow-lg transition-all duration-300 rounded-2xl p-3"
    >
      <div className="relative flex items-center justify-center w-6 h-6">
        {/* Light mode icon */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transform transition-all duration-500 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />

        {/* Dark mode icon */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-blue-400 transform transition-all duration-500 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />

        {/* Sparkle effect on hover */}
        <Sparkles className="absolute inset-0 w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
      </div>

      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
          theme === "light" ? "bg-yellow-400" : "bg-blue-400"
        }`}
      />
    </Button>
  );
};
