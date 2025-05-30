
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Zap, MessageSquareText, UploadCloud, FileText as FileTextIcon, Download as DownloadIcon, Rocket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context'; // Keep for conditional CTA text
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
      <section className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
          Unlock Your Meeting Superpowers with NotiQ Lite
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Stop drowning in meeting notes. Upload your audio, get instant transcriptions, AI-powered summaries, and chat with your meeting content.
        </p>
        <Button size="lg" onClick={handleGetStarted} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
          {loading ? "Loading..." : (user ? "Go to Dashboard" : "Get Started")}
          {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
        {!user && !loading && (
           <p className="mt-4 text-sm text-muted-foreground">
            Already have an account? <Link href="/auth/signin" className="font-medium text-accent hover:underline">Sign In</Link>
          </p>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-6 md:gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-7 w-7 text-accent" />
              Effortless Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Simply upload your meeting audio files (MP3, WAV, M4A) and let NotiQ Lite handle the rest.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-accent" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get accurate transcriptions and concise summaries generated by advanced AI models.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-7 w-7 text-accent" />
              Interactive Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ask questions directly about your meeting content and get instant answers from NotiQ.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="py-12 md:py-16 bg-card rounded-lg shadow-md">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">Focus on the Conversation, Not on Note-Taking</h2>
              <p className="text-muted-foreground mb-6">
                NotiQ Lite frees you to fully engage in meetings, knowing that a comprehensive record and actionable insights are just an upload away.
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-center"><Zap className="h-5 w-5 mr-2 text-accent" /> Automatic Transcription</li>
                <li className="flex items-center"><FileTextIcon className="h-5 w-5 mr-2 text-accent" /> Intelligent Summaries</li>
                <li className="flex items-center"><MessageSquareText className="h-5 w-5 mr-2 text-accent" /> Q&A with your Transcript</li>
                <li className="flex items-center"><DownloadIcon className="h-5 w-5 mr-2 text-accent" /> Easy Export Options</li>
              </ul>
              <Button onClick={handleGetStarted} size="lg" className="bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Loading..." : (user ? "Access Your Dashboard" : "Sign Up & Explore")}
              </Button>
            </div>
            <div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Meeting collaboration"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                data-ai-hint="collaboration meeting"
              />
            </div>
          </div>
        </div>
      </section>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-auto">
        <p>&copy; {new Date().getFullYear()} NotiQ Lite. Powered by Firebase Studio.</p>
      </footer>
    </div>
  );
}
