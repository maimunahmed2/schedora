import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
};

export function AppLogo({ className }: AppLogoProps) {
  return <CalendarCheck className={cn("text-primary", className)} />;
}
