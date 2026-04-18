import { useLayout } from "@/context/LayoutContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const LayoutToggle = () => {
  const { layoutMode, setLayoutMode, colorMode, setColorMode } = useLayout();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="layout-mode" className="text-xs text-primary-foreground/60 cursor-pointer">
          {layoutMode === "current" ? "Default" : "Sympos"}
        </Label>
        <Switch
          id="layout-mode"
          checked={layoutMode === "sympos"}
          onCheckedChange={(checked) => setLayoutMode(checked ? "sympos" : "current")}
          className="data-[state=checked]:bg-accent"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="color-mode" className="text-xs text-primary-foreground/60 cursor-pointer">
          {colorMode === "original" ? "Original" : "B&W"}
        </Label>
        <Switch
          id="color-mode"
          checked={colorMode === "bw-purple"}
          onCheckedChange={(checked) => setColorMode(checked ? "bw-purple" : "original")}
          className="data-[state=checked]:bg-purple-500"
        />
      </div>
    </div>
  );
};

export default LayoutToggle;