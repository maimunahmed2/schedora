"use client";

import { useState } from "react";
import { type TimetableEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Trash2, Clock, XCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { DeleteClassAlert } from "./delete-class-alert";
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
  isMobile?: boolean;
};

const statusConfig = {
  Scheduled: { icon: CheckCircle },
  Postponed: { icon: AlertTriangle },
  Cancelled: { icon: XCircle },
};

export function TimetableRow({ entry, isCR, onEdit, isMobile = false }: TimetableRowProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
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
      <>
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
                          <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-destructive focus:text-destructive">
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
           </CardContent>
           <CardFooter className="p-4 pt-0">
              <Badge variant="outline" className={cn("w-full justify-center py-1.5 text-xs font-medium", badgeHighlightClass())}>
                  <StatusIcon className="mr-2 h-4 w-4"/> {entry.status}
              </Badge>
           </CardFooter>
        </Card>
        {isCR && <DeleteClassAlert isOpen={isAlertOpen} setIsOpen={setIsAlertOpen} entryId={entry.id} />}
      </>
    );
  }

  return (
    <>
      <TableRow className={cn("transition-colors", rowHighlightClass())}>
        <TableCell className="font-medium">{entry.subject}</TableCell>
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
                <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
      </TableRow>
      {isCR && <DeleteClassAlert isOpen={isAlertOpen} setIsOpen={setIsAlertOpen} entryId={entry.id} />}
    </>
  );
}
