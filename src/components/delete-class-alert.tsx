"use client";

import { useState } from "react";
import { deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { type TimetableEntry } from "@/lib/types";
import { notifyTelegram } from "@/ai/flows/notify-telegram-flow";

type DeleteClassAlertProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  entry: TimetableEntry;
};

export function DeleteClassAlert({ isOpen, setIsOpen, entry }: DeleteClassAlertProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "timetable", entry.id));
      await setDoc(doc(db, "metadata", "timetable"), { lastUpdated: serverTimestamp() });
      
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = daysOfWeek[entry.dayOfWeek];
      const notificationMessage = `*Class Removed*\n\nThe subject *${entry.subject}* on *${day}* at *${entry.time}* has been removed from the timetable.`;
      await notifyTelegram({ message: notificationMessage });

      toast({
        title: "Class Deleted",
        description: "The class has been removed from the timetable.",
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting Class",
        description: error.message || "Could not delete class. Please try again.",
      });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the class entry from the timetable.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
