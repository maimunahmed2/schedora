"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { type TimetableEntry } from "@/lib/types";
import { Header } from "@/components/header";
import { Timetable } from "@/components/timetable";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { BellRing, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function HomePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isNotificationAlertOpen, setIsNotificationAlertOpen] = useState(false);

  useEffect(() => {
    // Listen for timetable updates
    const q = query(collection(db, "timetable"), orderBy("dayOfWeek", "asc"), orderBy("time", "asc"));
    const unsubscribeTimetable = onSnapshot(q, (querySnapshot) => {
      const entries: TimetableEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as TimetableEntry);
      });
      setTimetable(entries);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching timetable:", error);
      setLoading(false);
    });

    // Listen for metadata updates (lastUpdated timestamp)
    const metaDocRef = doc(db, "metadata", "timetable");
    const unsubscribeMetadata = onSnapshot(metaDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastUpdated) {
          try {
            const date = data.lastUpdated.toDate();
            setLastUpdated(formatDistanceToNow(date, { addSuffix: true }));
          } catch (e) {
            // Handle cases where timestamp might not be a Firestore timestamp
            setLastUpdated("recently");
          }
        }
      }
    });

    return () => {
      unsubscribeTimetable();
      unsubscribeMetadata();
    };
  }, []);
  
  const isCR = !!user;

  return (
    <div className="flex flex-col min-h-screen">
      <Header lastUpdated={lastUpdated} />
      <main className="flex-1">
        <div className="container py-8">
          <Timetable data={timetable} loading={loading} isCR={isCR} />
        </div>
        {lastUpdated && (
             <p className="sm:hidden text-center text-sm text-muted-foreground pb-4">
              Last updated: {lastUpdated}
            </p>
        )}
      </main>
      <footer className="flex flex-col items-center gap-4 p-4 text-sm text-muted-foreground">
        <span>Made with ❤️ by <b>Maimun</b></span>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsNotificationAlertOpen(true)}>
                <BellRing className="mr-2 h-4 w-4" />
                Get update notifications
            </Button>
            <Button asChild variant="outline">
              <a href="https://wa.me/919957510814?text=I%20have%20a%20query%20about%20the%20timetable." target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Have a query, ask on WhatsApp
              </a>
            </Button>
        </div>
      </footer>

      <AlertDialog open={isNotificationAlertOpen} onOpenChange={setIsNotificationAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Join our Telegram Channel!</AlertDialogTitle>
            <AlertDialogDescription>
              Get instant notifications whenever the timetable is updated. Join our channel to stay in the loop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
                <a href="https://t.me/yourchannel" target="_blank" rel="noopener noreferrer">Join Channel</a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
