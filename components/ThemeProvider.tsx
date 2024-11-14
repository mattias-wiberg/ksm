// components/ThemeProvider.tsx
"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";

type Theme = "light" | "dark";

interface ThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
    theme: "dark",
    setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        // Save theme to cookie
        Cookies.set("theme", newTheme, { expires: 365 });
        // Save theme to localStorage
        localStorage.setItem("theme", newTheme);
    };

    useEffect(() => {
        // Try to get theme from cookie
        const storedTheme = Cookies.get("theme") as Theme | undefined;

        if (storedTheme) {
            setThemeState(storedTheme);
        } else {
            // If no theme in cookie, check localStorage
            const localTheme = localStorage.getItem("theme") as Theme | null;
            if (localTheme) {
                setThemeState(localTheme);
            } else {
                // If no theme in localStorage, use system preference
                const systemTheme =
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "dark"
                        : "light";
                setThemeState(systemTheme);
            }
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
