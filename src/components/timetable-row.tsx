"use client";

import { useState } from "react";
import { type TimetableEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TimetableRowProps = {
  entry: TimetableEntry;
  isCR: boolean;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (entry: TimetableEntry) => void;
  isMobile?: boolean;
};

const statusConfig = {
  Scheduled: { icon: CheckCircle },
  Postponed: { icon: AlertTriangle },
  Cancelled: { icon: XCircle },
};

export function TimetableRow({
  entry,
  isCR,
  onEdit,
  onDelete,
  isMobile = false,
}: TimetableRowProps) {
  const StatusIcon = statusConfig[entry.status].icon;

  const [menuOpen, setMenuOpen] = useState(false);

  const handleReport = () => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = daysOfWeek[entry.dayOfWeek];
    const message = `I'd like to report potential misinformation for the following class:\n\n*Subject:* ${entry.subject}\n*Faculty:* ${entry.faculty}\n*Day:* ${day}\n*Time:* ${entry.time}\n\nPlease specify the issue:`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/919957510814?text=${encodedMessage}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const closeThen = (fn: () => void) => {
    setMenuOpen(false);
    setTimeout(fn, 0); // allow Radix to unmount cleanly
  };

  const rowHighlightClass = () => {
    switch (entry.status) {
      case "Postponed":
        return "bg-accent/10";
      case "Cancelled":
        return "bg-destructive/5 text-muted-foreground opacity-80";
      default:
        return "";
    }
  };

  const badgeHighlightClass = () => {
    switch (entry.status) {
      case "Scheduled":
        return "bg-primary/10 text-primary-foreground border-primary/20";
      case "Postponed":
        return "bg-accent/20 text-accent-foreground border-accent/40";
      case "Cancelled":
        return "bg-destructive/10 text-destructive-foreground border-destructive/20";
      default:
        return "";
    }
  };

  const Menu = (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
          {isCR ? (
            <MoreHorizontal className="h-4 w-4" />
          ) : (
            <Flag className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {isCR ? (
          <>
            <DropdownMenuItem onSelect={() => closeThen(() => onEdit(entry))}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => closeThen(() => onDelete(entry))}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onSelect={() => closeThen(handleReport)}>
            <Flag className="mr-2 h-4 w-4" />
            Report Misinformation
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isMobile) {
    return (
      <Card className={cn("overflow-hidden border", rowHighlightClass())}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
          <div className="overflow-hidden">
            <CardTitle className="text-base truncate font-semibold">{entry.subject}</CardTitle>
            <p className="text-sm text-muted-foreground truncate">{entry.faculty}</p>
          </div>
          {Menu}
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{entry.time}</span>
          </div>

          {entry.notes && (
            <div className="flex items-start gap-2 pt-1">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <p className="break-words">{entry.notes}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Badge
            variant="outline"
            className={cn(
              "w-full justify-center py-1.5 text-xs",
              badgeHighlightClass()
            )}
          >
            <StatusIcon className="mr-2 h-4 w-4" />
            {entry.status}
          </Badge>
        </CardFooter>
      </Card>
    );
  }

  return (
    <TableRow className={cn("transition-colors", rowHighlightClass())}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-semibold">{entry.subject}</span>
          {entry.notes && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <FileText className="h-3 w-3" />
              <span className="line-clamp-1">{entry.notes}</span>
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>{entry.faculty}</TableCell>
      <TableCell>{entry.time}</TableCell>

      <TableCell>
        <Badge variant="outline" className={badgeHighlightClass()}>
          <StatusIcon className="mr-2 h-4 w-4" />
          {entry.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">{Menu}</TableCell>
    </TableRow>
  );
}
