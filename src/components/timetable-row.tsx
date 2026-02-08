"use client";

import { type TimetableEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, Clock, XCircle, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TimetableRowProps = {
  entry: TimetableEntry;
  isCR: boolean;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (entryId: string) => void;
  isMobile?: boolean;
};

const statusConfig = {
  Scheduled: { icon: CheckCircle },
  Postponed: { icon: AlertTriangle },
  Cancelled: { icon: XCircle },
};

export function TimetableRow({ entry, isCR, onEdit, onDelete, isMobile = false }: TimetableRowProps) {
  const StatusIcon = statusConfig[entry.status].icon;
  
  const rowHighlightClass = () => {
    switch (entry.status) {
      case "Postponed": return "bg-accent/10";
      case "Cancelled": return "bg-destructive/5 text-muted-foreground opacity-80";
      default: return "";
    }
  };
  
  const badgeHighlightClass = () => {
    switch(entry.status) {
      case "Scheduled":
        return "bg-primary/10 text-primary-foreground border-primary/20";
      case "Postponed":
        return "bg-accent/20 text-accent-foreground border-accent/40";
      case "Cancelled":
        return "bg-destructive/10 text-destructive-foreground border-destructive/20";
      default:
        return "";
    }
  }

  if (isMobile) {
    return (
      <Card className={cn("overflow-hidden border", rowHighlightClass())}>
         <CardHeader className="flex flex-row items-start justify-between p-4">
            <div>
              <CardTitle className="text-base">{entry.subject}</CardTitle>
              <p className="text-sm text-muted-foreground">{entry.faculty}</p>
            </div>
            {isCR && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -my-2 -mr-2 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(entry)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
         </CardHeader>
         <CardContent className="p-4 pt-0 space-y-2 text-sm">
             <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{entry.time}</span>
             </div>
              {entry.notes && (
                <div className="flex items-start gap-2 pt-1">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-foreground">{entry.notes}</p>
                </div>
             )}
         </CardContent>
         <CardFooter className="p-4 pt-0">
            <Badge variant="outline" className={cn("w-full justify-center py-1.5 text-xs font-medium", badgeHighlightClass())}>
                <StatusIcon className="mr-2 h-4 w-4"/> {entry.status}
            </Badge>
         </CardFooter>
      </Card>
    );
  }

  return (
    <TableRow className={cn("transition-colors", rowHighlightClass())}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
            <span>{entry.subject}</span>
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
        <Badge variant="outline" className={cn("font-medium", badgeHighlightClass())}>
          <StatusIcon className="mr-2 h-4 w-4"/>
          {entry.status}
        </Badge>
      </TableCell>
      {isCR && (
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </TableRow>
  );
}
