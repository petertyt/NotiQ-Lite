
"use client";

import type * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, User, Send, MessageCircle, Loader2 } from 'lucide-react'; // Changed HelpCircle to MessageCircle, added Loader2
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AskNotiQChatProps {
  messages: Message[];
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  transcriptProvided: boolean;
}

export function AskNotiQChat({ messages, onSendMessage, isLoading, transcriptProvided }: AskNotiQChatProps) {
  const [question, setQuestion] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && transcriptProvided && !isLoading) {
      onSendMessage(question.trim());
      setQuestion('');
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (transcriptProvided && !isLoading) {
      inputRef.current?.focus();
    }
  }, [transcriptProvided, isLoading]);


  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>Chat with NotiQ</span>
        </CardTitle>
        <CardDescription>
          {transcriptProvided 
            ? "Ask questions or get insights from your meeting transcript."
            : "Upload an audio file to activate the chat."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow h-[400px] overflow-hidden"> {/* Added h-[400px] or similar fixed height for scroll */}
        <ScrollArea className="flex-grow mb-4 pr-2" ref={scrollAreaRef}> {/* Added pr-2 for scrollbar visibility */}
          {!transcriptProvided && (
             <div className="text-center text-muted-foreground p-4 flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Transcript Needed</p>
              <p className="text-sm">Upload an audio file first to start chatting with NotiQ.</p>
            </div>
          )}
          {transcriptProvided && messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground p-4 flex flex-col items-center justify-center h-full">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-70" />
              <p className="font-medium">Ready for your questions!</p>
              <p className="text-sm">Ask anything about the transcript above.</p>
            </div>
          )}
          
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg shadow-sm max-w-[85%] text-sm', // Enhanced styling
                  msg.sender === 'user' 
                    ? 'ml-auto bg-primary text-primary-foreground' 
                    : 'mr-auto bg-card text-card-foreground border' // AI messages more distinct
                )}
              >
                {msg.sender === 'ai' ? 
                  <AvatarForAI /> : 
                  <AvatarForUser />
                }
                <p className="whitespace-pre-wrap break-words leading-relaxed pt-1">{msg.text}</p>
              </div>
            ))}
            {isLoading && ( 
              <div className="flex items-start gap-3 p-3 rounded-lg shadow-sm mr-auto bg-card text-card-foreground border max-w-[85%]">
                <AvatarForAI />
                <div className="flex items-center space-x-1.5 pt-2">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-0"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center pt-2 border-t">
          <Input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={transcriptProvided ? "Ask about the meeting..." : "Upload transcript to chat"}
            className="flex-grow focus:ring-accent focus:border-accent disabled:bg-muted/50"
            disabled={isLoading || !transcriptProvided}
            aria-label="Ask NotiQ a question"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim() || !transcriptProvided} 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const AvatarForAI = () => (
  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
    <Bot className="h-5 w-5 text-primary" />
  </div>
);

const AvatarForUser = () => (
 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-foreground flex items-center justify-center border border-primary/30">
    <User className="h-5 w-5 text-primary" />
  </div>
);

    