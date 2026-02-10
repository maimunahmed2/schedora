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
  const [isTemplateAlertOpen, setTemplateAlertOpen] = useState<false | 'day' | 'week'>(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = format(new Date(), 'EEE');
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
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      scheduleTemplate.forEach((templateEntry) => {
        const newDocRef = doc(collection(db, "timetable"));
        const data = {
          subject: templateEntry.subject,
          faculty: templateEntry.faculty,
          time: templateEntry.time,
          status: templateEntry.status,
          dayOfWeek: templateEntry.dayOfWeek,
          createdAt: serverTimestamp(),
          notes: templateEntry.notes || "",
        };
        batch.set(newDocRef, data);
      });

      await batch.commit();
      await setDoc(doc(db, "metadata", "timetable"), {
        lastUpdated: serverTimestamp(),
      });

      toast({
        title: "Schedule Loaded",
        description: "The template schedule for the week has been loaded.",
      });
    } catch (error: any) {
      console.error("Error loading schedule template:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Schedule",
        description:
          error.message || "Could not load the schedule. Please try again.",
      });
    } finally {
      setIsSeeding(false);
      setTemplateAlertOpen(false);
    }
  };

  const handleLoadDayTemplate = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      const timetableRef = collection(db, "timetable");
      const dayIndex = daysOfWeek.indexOf(selectedDay);

      if (dayIndex === -1) {
        throw new Error("Invalid day selected.");
      }

      // Delete existing entries for the selected day
      const q = query(timetableRef, where("dayOfWeek", "==", dayIndex));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add template entries for the selected day
      const dayTemplate = scheduleTemplate.filter(
        (entry) => entry.dayOfWeek === dayIndex
      );

      dayTemplate.forEach((templateEntry) => {
        const newDocRef = doc(collection(db, "timetable"));
        const data = {
          subject: templateEntry.subject,
          faculty: templateEntry.faculty,
          time: templateEntry.time,
          status: templateEntry.status,
          dayOfWeek: templateEntry.dayOfWeek,
          createdAt: serverTimestamp(),
          notes: templateEntry.notes || "",
        };
        batch.set(newDocRef, data);
      });
      
      await batch.commit();
      await setDoc(doc(db, "metadata", "timetable"), {
        lastUpdated: serverTimestamp(),
      });

      toast({
        title: "Day Schedule Loaded",
        description: `The schedule for ${selectedDay} has been loaded.`,
      });
    } catch (error: any) {
      console.error("Error loading day schedule:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Schedule",
        description:
          error.message || "Could not load the schedule. Please try again.",
      });
    } finally {
      setIsSeeding(false);
      setTemplateAlertOpen(false);
    }
  };
  
  const filteredData = data.filter(entry => daysOfWeek[entry.dayOfWeek] === selectedDay);

  const CrControls = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isSeeding}
            variant="outline"
            size={isMobile ? "sm" : "default"}
          >
            {isSeeding ? (
              <Loader2 className="animate-spin" />
            ) : (
              <BookCopy />
            )}
            {isSeeding ? "Loading..." : "Load Schedule"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setTemplateAlertOpen('day')}>
            Load for {selectedDay}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTemplateAlertOpen('week')}>
            Load for Week
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button onClick={handleAddNew} size={isMobile ? "sm" : "default"}>
        <PlusCircle />
        {isMobile ? "Add" : "Add Class"}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          {isCR && (
            <div className="flex items-center flex-row gap-2">{CrControls}</div>
          )}
        </div>

        <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
                {daysOfWeek.map((day) => (
                <TabsTrigger key={day} value={day}>
                    {day}
                </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}
        {!loading && data.length > 0 && filteredData.length === 0 && (
             <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                <BookOpen className="mx-auto h-12 w-12" />
                <p className="mt-4">No classes scheduled for {selectedDay}.</p>
            </div>
        )}
        {!loading && data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12" />
            <p className="mt-4">No classes scheduled yet.</p>
            {isCR && (
              <p className="mt-2 text-sm">
                Click "Load Schedule" to get started.
              </p>
            )}
          </div>
        )}
        <div className="space-y-3">
          {filteredData.map((entry) => (
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
        {isCR && (
          <>
            <EditClassDialog
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              entry={editingClass}
            />
            {deleteTarget && (
              <DeleteClassAlert
                isOpen={!!deleteTarget}
                setIsOpen={(open) => !open && setDeleteTarget(null)}
                entry={deleteTarget}
              />
            )}
          </>
        )}
        {isCR && (
          <AlertDialog
            open={!!isTemplateAlertOpen}
            onOpenChange={(open) => !open && setTemplateAlertOpen(false)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                 <AlertDialogTitle>
                  {isTemplateAlertOpen === 'week'
                    ? 'Load Week Schedule?'
                    : `Load Schedule for ${selectedDay}?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isTemplateAlertOpen === 'week'
                    ? 'This will replace all classes for the entire week with the pre-defined schedule template.'
                    : `This will replace all classes for ${selectedDay} with the pre-defined schedule template.`}{' '}
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSeeding}>Cancel</AlertDialogCancel>
                <Button
                  onClick={isTemplateAlertOpen === 'week' ? handleLoadWeekTemplate : handleLoadDayTemplate}
                  variant="destructive"
                  disabled={isSeeding}
                >
                  {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSeeding ? "Loading..." : "Confirm & Load"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Schedule</CardTitle>
        {isCR && (
          <div className="flex items-center gap-2">
            {CrControls}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
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
              <TableHead className="w-[30%]">Subject</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="p-2">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && data.length > 0 && filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No classes scheduled for {selectedDay}.
                </TableCell>
              </TableRow>
            )}
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No classes scheduled. Try loading the week's schedule.
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
                />
              ))}
          </TableBody>
        </Table>
      </CardContent>
      {isCR && (
        <>
          <EditClassDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            entry={editingClass}
          />
          {deleteTarget && (
            <DeleteClassAlert
              isOpen={!!deleteTarget}
              setIsOpen={(open) => !open && setDeleteTarget(null)}
              entry={deleteTarget}
            />
          )}
        </>
      )}
      {isCR && (
        <AlertDialog
          open={!!isTemplateAlertOpen}
          onOpenChange={(open) => !open && setTemplateAlertOpen(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isTemplateAlertOpen === 'week'
                  ? 'Load Week Schedule?'
                  : `Load Schedule for ${selectedDay}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isTemplateAlertOpen === 'week'
                  ? 'This will replace all classes for the entire week with the pre-defined schedule template.'
                  : `This will replace all classes for ${selectedDay} with the pre-defined schedule template.`}{' '}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSeeding}>Cancel</AlertDialogCancel>
              <Button
                onClick={isTemplateAlertOpen === 'week' ? handleLoadWeekTemplate : handleLoadDayTemplate}
                variant="destructive"
                disabled={isSeeding}
              >
                {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSeeding ? "Loading..." : "Confirm & Load"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
