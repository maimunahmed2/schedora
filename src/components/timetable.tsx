"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookOpen } from "lucide-react";
import { type TimetableEntry } from "@/lib/types";
import { TimetableRow } from "./timetable-row";
import { EditClassDialog } from "./edit-class-dialog";
import { Skeleton } from "./ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

type TimetableProps = {
  data: TimetableEntry[];
  loading: boolean;
  isCR: boolean;
};

export function Timetable({ data, loading, isCR }: TimetableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableEntry | null>(null);
  const isMobile = useIsMobile();

  const handleAddNew = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingClass(entry);
    setIsDialogOpen(true);
  };
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Timetable</h1>
          {isCR && (
            <Button onClick={handleAddNew} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
        </div>
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12" />
            <p className="mt-4">No classes scheduled yet.</p>
            {isCR && <p className="mt-2 text-sm">Click "Add" to create a new class entry.</p>}
          </div>
        )}
        <div className="space-y-3">
          {data.map((entry) => (
            <TimetableRow
              key={entry.id}
              entry={entry}
              isCR={isCR}
              onEdit={handleEdit}
              isMobile={true}
            />
          ))}
        </div>
        {isCR && (
          <EditClassDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            entry={editingClass}
          />
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Schedule</CardTitle>
        {isCR && (
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Subject</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              {isCR && <TableHead className="text-right w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isCR ? 6 : 5} className="p-2">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={isCR ? 6 : 5} className="h-24 text-center">
                  No classes scheduled yet.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.map((entry) => (
                <TimetableRow
                  key={entry.id}
                  entry={entry}
                  isCR={isCR}
                  onEdit={handleEdit}
                />
              ))}
          </TableBody>
        </Table>
      </CardContent>
      {isCR && (
        <EditClassDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          entry={editingClass}
        />
      )}
    </Card>
  );
}
