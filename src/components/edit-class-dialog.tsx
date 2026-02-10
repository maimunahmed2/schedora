"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, setDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { type TimetableEntry } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { notifyTelegram } from "@/ai/flows/notify-telegram-flow";
import { Switch } from "@/components/ui/switch";

type EditClassDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  entry: TimetableEntry | null;
};

const classSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  faculty: z.string().min(1, "Faculty is required"),
  dayOfWeek: z.string().refine(val => !isNaN(parseInt(val, 10)), {
    message: "Day of the week is required",
  }).transform(Number),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  status: z.enum(["Scheduled", "Postponed", "Cancelled"]),
  notes: z.string().optional(),
  sendNotification: z.boolean().default(true),
});

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function EditClassDialog({ isOpen, setIsOpen, entry }: EditClassDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      sendNotification: true,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (entry) {
        form.reset({
          subject: entry.subject,
          faculty: entry.faculty,
          dayOfWeek: String(entry.dayOfWeek),
          time: entry.time,
          status: entry.status,
          notes: entry.notes || "",
          sendNotification: true,
        });
      } else {
        form.reset({
          subject: "",
          faculty: "",
          dayOfWeek: "1", // Default to Monday
          time: "",
          status: "Scheduled",
          notes: "",
          sendNotification: true,
        });
      }
    }
  }, [entry, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    try {
      const data = { ...values };
      let notificationMessage = "";
      const day = daysOfWeek[data.dayOfWeek];

      if (entry) {
        // Update existing entry
        const docRef = doc(db, "timetable", entry.id);
        await updateDoc(docRef, data);
        toast({ title: "Class Updated", description: "The class details have been saved." });
        
        const changes = [];
        const oldDay = daysOfWeek[entry.dayOfWeek];

        if (entry.subject !== data.subject) {
          changes.push(`*Subject:* ${entry.subject} -> *${data.subject}*`);
        }
        if (entry.faculty !== data.faculty) {
          changes.push(`*Faculty:* ${entry.faculty} -> *${data.faculty}*`);
        }
        if (entry.dayOfWeek !== data.dayOfWeek) {
          changes.push(`*Day:* ${oldDay} -> *${day}*`);
        }
        if (entry.time !== data.time) {
          changes.push(`*Time:* ${entry.time} -> *${data.time}*`);
        }
        if (entry.status !== data.status) {
          changes.push(`*Status:* ${entry.status} -> *${data.status}*`);
        }
        
        const oldNotes = entry.notes || "";
        const newNotes = data.notes || "";
        if (oldNotes !== newNotes) {
          changes.push(`*Notes:* ${oldNotes || "_none_"} -> *${newNotes || "_none_"}`);
        }

        if (changes.length > 0) {
            notificationMessage = `*Class Details Updated*\n_For '${entry.subject}' on ${oldDay} at ${entry.time}_\n\n` + changes.join('\n');
        }

      } else {
        // Add new entry
        await addDoc(collection(db, "timetable"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Class Added", description: "The new class has been added to the timetable." });
        
        notificationMessage = `*New Class Added*\n\n*Subject:* ${data.subject}\n*Day:* ${day}\n*Time:* ${data.time}\n*Status:* ${data.status}`;
        if (data.notes) {
            notificationMessage += `\n*Notes:* ${data.notes}`;
        }
      }

      // Update the lastUpdated timestamp in a separate document
      await setDoc(doc(db, "metadata", "timetable"), { lastUpdated: serverTimestamp() });

      if (notificationMessage && values.sendNotification) {
        await notifyTelegram({ message: notificationMessage });
      }

      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error.message || "Could not save the class details. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Class" : "Add New Class"}</DialogTitle>
          <DialogDescription>
            {entry ? "Update the details for this class." : "Fill in the details for the new class."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="faculty" render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of the Week</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {daysOfWeek.map((day, index) => (
                            <SelectItem key={day} value={String(index)}>
                                {day}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Postponed">Postponed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Assignment due today" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            
            <FormField
              control={form.control}
              name="sendNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Send Telegram Notification</FormLabel>
                        <FormDescription>
                            Notify the channel about this change.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
