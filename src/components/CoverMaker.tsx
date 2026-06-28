import { useState, useRef, useEffect } from "react";
import {
  Download,
  Image as ImageIcon,
  PaintBucket,
  Search,
  X,
  Settings,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const PRESET_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#1f2937",
  "#000000",
  "#ffffff",
];

const POPULAR_ICONS = [
  "lucide:book",
  "lucide:book-open",
  "lucide:notebook",
  "lucide:folder",
  "lucide:archive",
  "lucide:file-text",
  "lucide:hash",
  "lucide:bookmark",
  "lucide:calendar",
  "lucide:clock",
  "lucide:circle-check",
  "lucide:pen-tool",
  "lucide:image",
  "lucide:video",
  "lucide:camera",
  "lucide:home",
  "lucide:user",
  "lucide:heart",
  "lucide:star",
  "lucide:coffee",
  "lucide:shopping-cart",
  "lucide:gift",
  "lucide:briefcase",
  "lucide:graduation-cap",
  "lucide:banknote",
  "lucide:wallet",
  "lucide:credit-card",
  "lucide:target",
  "lucide:monitor",
  "lucide:laptop",
  "lucide:smartphone",
  "lucide:database",
  "lucide:terminal",
  "lucide:plane",
  "lucide:map-pin",
  "lucide:gamepad-2",
  "lucide:music",
  "lucide:headphones",
  "lucide:palette",
  "lucide:lightbulb",
  "lucide:brain",
  "lucide:leaf",
  "lucide:flame",
];

export default function CoverMaker() {
  const [bgColor, setBgColor] = useState("#1f2937");
  const [showIcon, setShowIcon] = useState(true);
  const [iconName, setIconName] = useState("lucide:book");
  const [iconColor, setIconColor] = useState("#ffffff");
  const [iconSize, setIconSize] = useState([48]);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isApplyingImage, setIsApplyingImage] = useState(false);

  // Icon Search
  const [iconSearch, setIconSearch] = useState("");
  const [filteredIcons, setFilteredIcons] = useState<string[]>(POPULAR_ICONS);
  const [isSearchingIcon, setIsSearchingIcon] = useState(false);

  // Photo Search
  const [searchQuery, setSearchQuery] = useState("");
  const [photoSource, setPhotoSource] = useState("unsplash");
  const [photos, setPhotos] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // API Key State
  const [unsplashKey, setUnsplashKey] = useState("");
  const [pexelsKey, setPexelsKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUnsplash = localStorage.getItem("unsplash_api_key");
    const savedPexels = localStorage.getItem("pexels_api_key");
    if (savedUnsplash) setUnsplashKey(savedUnsplash);
    if (savedPexels) setPexelsKey(savedPexels);
  }, []);

  // Iconify Search Effect
  useEffect(() => {
    if (!iconSearch.trim()) {
      setFilteredIcons(POPULAR_ICONS);
      setIsSearchingIcon(false);
      return;
    }

    setIsSearchingIcon(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(iconSearch)}&limit=72`,
        );
        if (!res.ok) throw new Error("Icon search failed");
        const data = await res.json();
        setFilteredIcons(data.icons || []);
      } catch (err) {
        console.error("Icon search error:", err);
      } finally {
        setIsSearchingIcon(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [iconSearch]);

  const handleDownload = async () => {
    if (!coverRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(coverRef.current, {
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `upcover-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate cover image", err);
      alert(
        "Failed to generate image. There might be an issue with external resources."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const searchPhotos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (photoSource === "unsplash") {
        const apiKey = unsplashKey || import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
        if (!apiKey) {
          setIsSettingsOpen(true);
          setIsSearching(false);
          return;
        }
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=portrait`,
          {
            headers: { Authorization: `Client-ID ${apiKey}` },
          },
        );
        if (!res.ok)
          throw new Error("Unsplash API request failed. Key might be invalid.");
        const data = await res.json();
        if (data.results) {
          setPhotos(
            data.results.map((img: any) => ({
              id: img.id,
              thumb: img.urls.small,
              full: img.urls.regular,
              alt: img.alt_description,
            })),
          );
        }
      } else if (photoSource === "pexels") {
        const apiKey = pexelsKey || import.meta.env.VITE_PEXELS_API_KEY;
        if (!apiKey) {
          setIsSettingsOpen(true);
          setIsSearching(false);
          return;
        }
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=portrait`,
          {
            headers: { Authorization: apiKey },
          },
        );
        if (!res.ok)
          throw new Error("Pexels API request failed. Key might be invalid.");
        const data = await res.json();
        if (data.photos) {
          setPhotos(
            data.photos.map((img: any) => ({
              id: img.id,
              thumb: img.src.medium,
              full: img.src.large,
              alt: img.alt,
            })),
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to fetch images.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectImage = async (url: string) => {
    setIsApplyingImage(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
        setIsApplyingImage(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load image via fetch", err);
      setBgImage(url); // Fallback
      setIsApplyingImage(false);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8 max-w-5xl mx-auto w-full">
      {/* Controls Panel */}
      <div className="flex-1 space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="style" className="flex gap-2 items-center">
              <PaintBucket className="w-4 h-4" /> Style & Icons
            </TabsTrigger>
            <TabsTrigger value="image" className="flex gap-2 items-center">
              <ImageIcon className="w-4 h-4" /> Photo Search
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="style"
            className="space-y-6 animate-in fade-in-50"
          >
            {/* Background Color */}
            <div className="space-y-3">
              <Label>Background Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${bgColor === color ? "border-primary scale-110 shadow-md" : "border-transparent shadow-sm"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setBgColor(color);
                      setBgImage(null);
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Label className="text-muted-foreground text-sm font-normal">
                  Custom:
                </Label>
                <div
                  className="relative w-8 h-8 rounded-md overflow-hidden border shadow-sm cursor-pointer"
                  title="Custom Background Color"
                >
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      setBgImage(null);
                    }}
                    className="absolute inset-0 w-12 h-12 -top-2 -left-2 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-mono uppercase text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  {bgColor}
                </span>
              </div>
            </div>

            {/* Icon Color & Size */}
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <Label>Icon Color (Overrides default brand colors)</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${iconColor === color ? "border-primary scale-110 shadow-md" : "border-transparent shadow-sm"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setIconColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Label className="text-muted-foreground text-sm font-normal">
                    Custom:
                  </Label>
                  <div
                    className="relative w-8 h-8 rounded-md overflow-hidden border shadow-sm cursor-pointer"
                    title="Custom Icon Color"
                  >
                    <input
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="absolute inset-0 w-12 h-12 -top-2 -left-2 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-mono uppercase text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    {iconColor}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <Label>Icon Size</Label>
                  <span className="text-xs text-muted-foreground">
                    {iconSize[0]}px
                  </span>
                </div>
                <Slider
                  value={iconSize}
                  onValueChange={setIconSize}
                  max={100}
                  min={16}
                  step={2}
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label>Search 200,000+ Icons</Label>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-icon"
                    className="text-xs text-muted-foreground font-normal"
                  >
                    Show Icon
                  </Label>
                  <Switch
                    id="show-icon"
                    checked={showIcon}
                    onCheckedChange={setShowIcon}
                  />
                </div>
              </div>
              <Input
                placeholder="Search icons (e.g. book, folder, star)..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                disabled={!showIcon}
              />
              <div
                className={`grid grid-cols-6 gap-2 max-h-[220px] overflow-y-auto p-1 custom-scrollbar transition-opacity ${!showIcon ? "opacity-50 pointer-events-none" : ""}`}
              >
                {isSearchingIcon && (
                  <div className="col-span-6 text-center py-4 text-sm text-muted-foreground animate-pulse">
                    Searching...
                  </div>
                )}
                {!isSearchingIcon &&
                  filteredIcons.map((name) => (
                    <button
                      key={name}
                      onClick={() => setIconName(name)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:bg-accent hover:text-accent-foreground ${iconName === name ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground"}`}
                      title={name}
                    >
                      <Icon icon={name} width={28} height={28} />
                    </button>
                  ))}
                {!isSearchingIcon && filteredIcons.length === 0 && (
                  <div className="col-span-6 text-center py-4 text-sm text-muted-foreground">
                    No icons found.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="image"
            className="space-y-6 animate-in fade-in-50"
          >
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-lg text-sm mb-4">
              Search requires an API key. Click the settings gear to add your
              Unsplash or Pexels key.
            </div>

            <div className="flex gap-2 w-full">
              <Select value={photoSource} onValueChange={setPhotoSource}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsplash">Unsplash</SelectItem>
                  <SelectItem value="pexels">Pexels</SelectItem>
                </SelectContent>
              </Select>

              <form onSubmit={searchPhotos} className="flex flex-1 gap-2">
                <Input
                  placeholder={`Search ${photoSource}...`}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                />
                <Button
                  type="submit"
                  disabled={isSearching}
                  size="icon"
                  className="shrink-0"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                title="API Settings"
                className="shrink-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {bgImage && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border">
                <span className="text-sm">Custom photo applied</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBgImage(null)}
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-[350px] overflow-y-auto p-1">
                {photos.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img.full)}
                    disabled={isApplyingImage}
                    className="relative aspect-[110/135] rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group disabled:opacity-50"
                  >
                    <img
                      src={img.thumb}
                      alt={img.alt || "Photo"}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        Use
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {photos.length === 0 && !isSearching && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                Search for an image to set as the cover background.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-muted/20 p-8 rounded-2xl border border-dashed">
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-lg">Live Preview</h3>
          <p className="text-sm text-muted-foreground font-mono">
            110 × 135 px
          </p>
        </div>

        {/* The Cover Canvas */}
        <div
          className="relative rounded-sm overflow-hidden shadow-2xl ring-1 ring-black/10 transition-all duration-300 flex items-center justify-center"
          style={{
            width: 110,
            height: 135,
            backgroundColor: bgImage ? "transparent" : bgColor,
          }}
        >
          {/* We wrap the content in a div for html2canvas to reliably capture it */}
          <div
            ref={coverRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden bg-background"
            style={{
              width: 110,
              height: 135,
              backgroundColor: bgImage ? "transparent" : bgColor,
            }}
          >
            {bgImage && (
              <img
                src={bgImage}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}

            {showIcon && (
              <div className="relative z-10 drop-shadow-md transition-all duration-300">
                {/* Note: if color is set on Icon, it might override native svg colors depending on the icon's implementation. 
                    Most single-color icons will adopt it, but multi-color logos might get overridden if we enforce it. 
                    We apply color conditionally. For logos (logos:*), we usually want their native colors unless a user really wants to tint it.
                    Since we offer an Icon Color picker, we apply it. */}
                <Icon
                  icon={iconName}
                  width={iconSize[0]}
                  height={iconSize[0]}
                  color={iconColor}
                />
              </div>
            )}

            {/* Optional subtle gradient overlay when using image for better icon visibility */}
            {bgImage && (
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            )}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full max-w-[220px] gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isDownloading ? "Generating..." : "Download Cover"}
        </Button>
      </div>

      {/* API Key Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Photo API Settings</DialogTitle>
            <DialogDescription>
              To search for images directly, please provide your own free API
              Access Key for Unsplash and/or Pexels. These keys are stored
              safely in your browser.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Unsplash Access Key</Label>
              <Input
                type="password"
                placeholder="Enter Unsplash Access Key"
                value={unsplashKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUnsplashKey(e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://unsplash.com/developers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Get Unsplash Key
                </a>
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Pexels API Key</Label>
              <Input
                type="password"
                placeholder="Enter Pexels API Key"
                value={pexelsKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPexelsKey(e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://www.pexels.com/api/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Get Pexels Key
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem("unsplash_api_key", unsplashKey);
                localStorage.setItem("pexels_api_key", pexelsKey);
                setIsSettingsOpen(false);
              }}
            >
              Save Keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
