import Image from 'next/image';
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
};

export function AppLogo({ className }: AppLogoProps) {
  // This component expects a logo.png file in the /public directory.
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/logo.png"
        alt="Schedora Logo"
        fill
        style={{ objectFit: 'contain' }}
        sizes="32px"
        priority
      />
    </div>
  );
}
