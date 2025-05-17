"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileAudio, UploadCloud, Languages } from 'lucide-react';

interface AudioInputFormProps {
  onSubmit: (audioFile: File, languageCode: string) => void;
  isLoading: boolean;
  currentLanguageCode: string;
  onLanguageChange: (languageCode: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Español (España)' },
  { code: 'fr-FR', name: 'Français (France)' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)' },
  { code: 'ja-JP', name: '日本語 (日本)' },
  { code: 'hi-IN', name: 'हिन्दी (भारत)' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'it-IT', name: 'Italiano (Italia)' },
  { code: 'ru-RU', name: 'Русский (Россия)' },
  // Add more languages as supported by the model and needed
];

export function AudioInputForm({ onSubmit, isLoading, currentLanguageCode, onLanguageChange }: AudioInputFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Language is now managed by parent (DashboardPage) via props

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onSubmit(selectedFile, currentLanguageCode);
    }
  };

  return (
    <Card className="shadow-md">
      {/* CardHeader can be removed if the TabsTrigger provides enough context */}
      {/* <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-6 w-6 text-accent" />
          <span>Upload Meeting Audio</span>
        </CardTitle>
        <CardDescription>
          Upload an audio file (e.g., .mp3, .wav, .m4a) and select its language.
        </CardDescription>
      </CardHeader> */}
      <CardContent className="pt-6"> {/* Added pt-6 if CardHeader is removed */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="audio-file-input" className="text-sm font-medium">
                Audio File
              </Label>
              <Input
                id="audio-file-input"
                type="file"
                accept="audio/*,.m4a,.opus" // Added .m4a, .opus
                onChange={handleFileChange}
                className="mt-1 focus:ring-accent focus:border-accent"
                disabled={isLoading}
              />
              {selectedFile && <p className="mt-2 text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
            </div>
            <div>
              <Label htmlFor="language-select-upload" className="text-sm font-medium flex items-center gap-1">
                <Languages className="h-4 w-4" /> Audio Language
              </Label>
              <Select
                value={currentLanguageCode}
                onValueChange={onLanguageChange}
                disabled={isLoading}
              >
                <SelectTrigger id="language-select-upload" className="mt-1 focus:ring-accent focus:border-accent">
                  <SelectValue placeholder="Select audio language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !selectedFile} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <UploadCloud className="mr-2 h-5 w-5" />
            {isLoading ? 'Processing...' : 'Upload & Analyze'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}