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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, BookOpen, BookCopy, Loader2 } from "lucide-react";
import { type TimetableEntry } from "@/lib/types";
import { TimetableRow } from "./timetable-row";
import { EditClassDialog } from "./edit-class-dialog";
import { DeleteClassAlert } from "./delete-class-alert";
import { Skeleton } from "./ui/skeleton";
import {
  writeBatch,
  doc,
  collection,
  serverTimestamp,
  setDoc,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { scheduleTemplate } from "@/lib/schedule-template";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TimetableProps = {
  data: TimetableEntry[];
  loading: boolean;
  isCR: boolean;
};

export function Timetable({ data, loading, isCR }: TimetableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimetableEntry | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTemplateAlertOpen, setTemplateAlertOpen] =
    useState<false | "day" | "week">(false);

  const { toast } = useToast();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = format(new Date(), "EEE");
  const [selectedDay, setSelectedDay] = useState(today);

  const handleAddNew = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingClass(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = (entry: TimetableEntry) => {
    setDeleteTarget(entry);
  };

  const handleLoadWeekTemplate = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      const timetableRef = collection(db, "timetable");

      const snapshot = await getDocs(query(timetableRef));
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));

      scheduleTemplate.forEach((entry) => {
        batch.set(doc(collection(db, "timetable")), {
          ...entry,
          createdAt: serverTimestamp(),
          notes: entry.notes || "",
        });
      });

      await batch.commit();
      await setDoc(doc(db, "metadata", "timetable"), {
        lastUpdated: serverTimestamp(),
      });

      toast({
        title: "Schedule Loaded",
        description: "Week schedule has been loaded.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
      setTemplateAlertOpen(false);
    }
  };

  const handleLoadDayTemplate = async () => {
    setIsSeeding(true);
    try {
      const dayIndex = daysOfWeek.indexOf(selectedDay);
      const timetableRef = collection(db, "timetable");

      const snapshot = await getDocs(
        query(timetableRef, where("dayOfWeek", "==", dayIndex))
      );

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));

      scheduleTemplate
        .filter((e) => e.dayOfWeek === dayIndex)
        .forEach((entry) =>
          batch.set(doc(collection(db, "timetable")), {
            ...entry,
            createdAt: serverTimestamp(),
            notes: entry.notes || "",
          })
        );

      await batch.commit();
      await setDoc(doc(db, "metadata", "timetable"), {
        lastUpdated: serverTimestamp(),
      });

      toast({
        title: "Schedule Loaded",
        description: `Schedule for ${selectedDay} loaded.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
      setTemplateAlertOpen(false);
    }
  };

  const filteredData = data.filter(
    (e) => daysOfWeek[e.dayOfWeek] === selectedDay
  );

  const [isLoadMenuOpen, setIsLoadMenuOpen] = useState(false);
  const CrControls = (
    <>
      <DropdownMenu open={isLoadMenuOpen} onOpenChange={setIsLoadMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isSeeding}>
            {isSeeding ? <Loader2 className="animate-spin" /> : <BookCopy />}
            Load Schedule
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setIsLoadMenuOpen(false);
              setTemplateAlertOpen("day");
            }}
          >
            Load for {selectedDay}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setIsLoadMenuOpen(false);
              setTemplateAlertOpen("week");
            }}
          >
            Load for Week
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={handleAddNew}>
        <PlusCircle />
        Add Class
      </Button>
    </>
  );


  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Class Schedule</CardTitle>
        {isCR && <div className="flex gap-2">{CrControls}</div>}
      </CardHeader>

      <CardContent>
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="grid grid-cols-7 mb-4">
            {daysOfWeek.map((day) => (
              <TabsTrigger key={day} value={day}>
                {day}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {loading &&
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[230px] w-full rounded-lg" />
            ))}
          {!loading && filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Classes Today</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enjoy your day off!
              </p>
            </div>
          )}
          {!loading &&
            filteredData.map((entry) => (
              <TimetableRow
                key={entry.id}
                entry={entry}
                isCR={isCR}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isMobile={true}
              />
            ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading &&
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && filteredData.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">No Classes Today</h3>
                                <p className="text-sm text-muted-foreground">
                                    Enjoy your day off!
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
                {!loading &&
                  filteredData.map((entry) => (
                    <TimetableRow
                      key={entry.id}
                      entry={entry}
                      isCR={isCR}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isMobile={false}
                    />
                  ))}
              </TableBody>
            </Table>
        </div>
      </CardContent>

      {/* Dialogs mounted ONCE */}
      {isCR && (
        <>
          <EditClassDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            entry={editingClass}
          />

          {deleteTarget && (
            <DeleteClassAlert
              isOpen
              setIsOpen={() => setDeleteTarget(null)}
              entry={deleteTarget}
            />
          )}

          <AlertDialog
            open={!!isTemplateAlertOpen}
            onOpenChange={(open) => !open && setTemplateAlertOpen(false)}
          >
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isTemplateAlertOpen === "week"
                    ? "Load Week Schedule?"
                    : `Load Schedule for ${selectedDay}?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace existing classes. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSeeding}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={isSeeding}
                  onClick={
                    isTemplateAlertOpen === "week"
                      ? handleLoadWeekTemplate
                      : handleLoadDayTemplate
                  }
                >
                  {isSeeding && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Card>
  );
}
