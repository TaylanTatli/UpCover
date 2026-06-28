import { useEffect, useState } from "react";
import CoverMaker from "./components/CoverMaker";
import { Moon, Sun } from "lucide-react";
import TextLogo from "./components/TextLogo";
function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Apply dark mode by default on mount
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 transition-colors duration-300">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="UpCover Icon"
              className="w-8 h-8 drop-shadow-sm transition-transform hover:scale-105"
            />
            <div className="text-foreground translate-y-[2px]">
              <TextLogo className="h-[22px] w-auto" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground hidden sm:block">
              Cover Maker for UpNote
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-full text-center mb-12 space-y-3">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
            Design Perfect <span className="text-primary">Covers</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create beautiful, custom 110×135 covers for your UpNote folders.
            Choose colors, pick icons, or search for photos.
          </p>
        </div>

        <CoverMaker />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t mt-auto">
        <div className="container text-center text-sm text-muted-foreground mx-auto">
          Built with React, Vite & Tailwind CSS. Not officially affiliated with
          UpNote.
        </div>
      </footer>
    </div>
  );
}

export default App;
