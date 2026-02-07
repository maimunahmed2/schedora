"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { type TimetableEntry } from "@/lib/types";
import { Header } from "@/components/header";
import { Timetable } from "@/components/timetable";
import { formatDistanceToNow } from "date-fns";

export default function HomePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Listen for timetable updates
    const q = query(collection(db, "timetable"), orderBy("dateTime", "desc"));
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
    </div>
  );
}
