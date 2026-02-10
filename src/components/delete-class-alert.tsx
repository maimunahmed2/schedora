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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getEndTime } from "@/lib/utils";

type DeleteClassAlertProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  entry: TimetableEntry;
};

export function DeleteClassAlert({ isOpen, setIsOpen, entry }: DeleteClassAlertProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "timetable", entry.id));
      await setDoc(doc(db, "metadata", "timetable"), { lastUpdated: serverTimestamp() });
      
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = daysOfWeek[entry.dayOfWeek];
      const endTime = getEndTime(entry.time, entry.duration);
      const timeDisplay = endTime ? `${entry.time} - ${endTime}` : entry.time;
      const notificationMessage = `*Class Removed*\n\nThe subject *${entry.subject}* on *${day}* at *${timeDisplay}* has been removed from the timetable.`;
      
      if (sendNotification) {
        await notifyTelegram({ message: notificationMessage });
      }

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
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
                <Label htmlFor="send-notification-delete" className="font-normal">Send Telegram Notification</Label>
                <p className="text-sm text-muted-foreground">
                    Notify the channel about this removal.
                </p>
            </div>
            <Switch id="send-notification-delete" checked={sendNotification} onCheckedChange={setSendNotification} />
        </div>
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
