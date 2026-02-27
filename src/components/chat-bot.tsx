"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { timetableChat } from "@/ai/flows/timetable-chat-flow";
import { cn } from "@/lib/utils";
import { format, getDay } from "date-fns";

type Message = {
  role: "user" | "model" | "error";
  content: string;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const now = new Date();
      const context = {
        currentTime: format(now, "HH:mm"),
        currentDay: format(now, "EEEE"),
        dayOfWeek: getDay(now),
      };

      const { response, error } = await timetableChat({
        message: userMessage,
        history: messages.filter(m => m.role !== 'error') as any,
        context,
      });

      if (error) {
        setMessages((prev) => [...prev, { role: "error", content: `Debug Info: ${error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", content: response }]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "error", content: `Failed to connect to assistant: ${error.message || 'Unknown error'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="mb-4 w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-xl border-primary/20 animate-in slide-in-from-bottom-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">Schedora Assistant</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Hi! I'm Schedora. Ask me about classes, assignments, or faculty!
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3 text-sm",
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-full h-8 w-8 flex items-center justify-center shrink-0",
                      m.role === "user" ? "bg-primary text-primary-foreground" : 
                      m.role === "error" ? "bg-destructive/10 text-destructive" : "bg-muted"
                    )}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : 
                       m.role === "error" ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "rounded-lg p-3 max-w-[80%] whitespace-pre-wrap",
                      m.role === "user" ? "bg-primary text-primary-foreground" : 
                      m.role === "error" ? "bg-destructive/5 text-destructive border border-destructive/20 text-xs font-mono" : "bg-muted"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 text-sm">
                    <div className="p-1 rounded-full h-8 w-8 flex items-center justify-center bg-muted shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
