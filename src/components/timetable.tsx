"use client";

import { useState, useEffect } from "react";
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
import { format, getDay, getHours, getMinutes } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getEndTime } from "@/lib/utils";

type TimetableProps = {
  data: TimetableEntry[];
  loading: boolean;
  isCR: boolean;
  isTelegramPromptOpen?: boolean;
};

export function Timetable({
  data,
  loading,
  isCR,
  isTelegramPromptOpen,
}: TimetableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimetableEntry | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTemplateAlertOpen, setTemplateAlertOpen] =
    useState<false | "day" | "week">(false);

  const { toast } = useToast();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update the current time every minute to keep the 'grayed out' state fresh
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // every minute
    return () => clearInterval(timer);
  }, []);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = format(now, "EEE");
  const [selectedDay, setSelectedDay] = useState(today);

  useEffect(() => {
    if (isTelegramPromptOpen) {
      setIsDialogOpen(false);
      setDeleteTarget(null);
    }
  }, [isTelegramPromptOpen]);

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

  const currentDayIndex = getDay(now);
  const currentTimeInMinutes = getHours(now) * 60 + getMinutes(now);

  const isDayCompleted = (dayIndex: number) => {
    if (dayIndex < currentDayIndex) {
      return true;
    }
    if (dayIndex > currentDayIndex) {
      return false;
    }

    // It's today, check if all classes are over
    const todaysClasses = data.filter((e) => e.dayOfWeek === dayIndex);
    if (todaysClasses.length === 0) {
      return false; // No classes, so the day isn't 'over' in this context
    }

    const lastClassEndTime = todaysClasses.reduce((latestTime, entry) => {
      const endTime = getEndTime(entry.time, entry.duration);
      if (!endTime) return latestTime;
      const [h, m] = endTime.split(":").map(Number);
      const timeInMinutes = h * 60 + m;
      return Math.max(latestTime, timeInMinutes);
    }, 0);

    return currentTimeInMinutes > lastClassEndTime;
  };

  const filteredData = data.filter(
    (e) => daysOfWeek[e.dayOfWeek] === selectedDay
  );

  const [isLoadMenuOpen, setIsLoadMenuOpen] = useState(false);
  const CrControls = (
    <>
      <DropdownMenu open={isLoadMenuOpen} onOpenChange={setIsLoadMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isSeeding} size="sm" className="w-40">
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

      <Button onClick={handleAddNew} size="sm" className="w-32">
        <PlusCircle />
        Add Class
      </Button>
    </>
  );

  const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
  const isPastDay = selectedDayIndex < currentDayIndex;
  const isToday = selectedDayIndex === currentDayIndex;

  let cardTitleText = "Class Schedule";
  let emptyStateTitle = "No Classes Scheduled";
  let emptyStateDescription = "Enjoy the day!";
  
  if (!loading) {
    if (isPastDay) {
      const dayName = fullDaysOfWeek[selectedDayIndex];
      cardTitleText = `Next ${dayName}'s Schedule`;
      emptyStateTitle = `No Classes on Next ${dayName}`;
      emptyStateDescription = `The schedule for next week's ${dayName} is clear.`;
    } else if (isToday) {
      cardTitleText = "Today's Schedule";
      emptyStateTitle = "No Classes Today";
      emptyStateDescription = "Enjoy your day off!";
    } else {
      const dayName = fullDaysOfWeek[selectedDayIndex];
      cardTitleText = `${dayName}'s Schedule`;
      emptyStateTitle = `No Classes on ${dayName}`;
      emptyStateDescription = "The schedule for this day is clear.";
    }
  }


  return (
    <Card>
      <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle>{cardTitleText}</CardTitle>
        {isCR && <div className="flex gap-2 self-end sm:self-auto">{CrControls}</div>}
      </CardHeader>

      <CardContent>
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="grid grid-cols-7 mb-4">
            {daysOfWeek.map((day, index) => {
               const isCompleted = isDayCompleted(index);
              return (
              <TabsTrigger 
                key={day} 
                value={day}
                className={cn(
                    isCompleted &&
                      "text-muted-foreground/60 data-[state=active]:bg-muted/50 data-[state=active]:text-muted-foreground"
                  )}
                >
                {day}
              </TabsTrigger>
            )})}
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
              <h3 className="mt-4 text-lg font-semibold">{emptyStateTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {emptyStateDescription}
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
                                <h3 className="text-lg font-semibold">{emptyStateTitle}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {emptyStateDescription}
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
