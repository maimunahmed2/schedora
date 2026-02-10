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
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

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
              setIsLoadMenuOpen(false);     // ✅ CLOSE DROPDOWN
              setTemplateAlertOpen("day"); // ✅ THEN OPEN DIALOG
            }}
          >
            Load for {selectedDay}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setIsLoadMenuOpen(false);      // ✅ CLOSE DROPDOWN
              setTemplateAlertOpen("week");  // ✅ THEN OPEN DIALOG
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

            {!loading &&
              filteredData.map((entry) => (
                <TimetableRow
                  key={entry.id}
                  entry={entry}
                  isCR={isCR}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
          </TableBody>
        </Table>
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
