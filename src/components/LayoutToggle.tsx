import { useLayout } from "@/context/LayoutContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const LayoutToggle = ({ className }: { className?: string }) => {
  const { layoutMode, setLayoutMode, colorMode, setColorMode } = useLayout();

  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6", className)}>
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <Label htmlFor="layout-mode" className="text-base sm:text-sm cursor-pointer whitespace-nowrap">
          {layoutMode === "current" ? "Default" : "Sympos"}
        </Label>
        <Switch
          id="layout-mode"
          checked={layoutMode === "sympos"}
          onCheckedChange={(checked) => setLayoutMode(checked ? "sympos" : "current")}
          className="data-[state=checked]:bg-accent"
        />
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <Label htmlFor="color-mode" className="text-base sm:text-sm cursor-pointer whitespace-nowrap">
          {colorMode === "original" ? "Original" : "B&W"}
        </Label>
        <Switch
          id="color-mode"
          checked={colorMode === "bw-purple"}
          onCheckedChange={(checked) => setColorMode(checked ? "bw-purple" : "original")}
          className="data-[state=checked]:bg-accent"
        />
      </div>
    </div>
  );
};

export default LayoutToggle;