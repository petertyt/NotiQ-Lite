
"use client";

import type { ActionItem } from '@/ai/flows/extract-action-items-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download } from 'lucide-react';

interface ExportControlsProps {
  meetingTitle?: string | null;
  transcript: string | null;
  summary: string | null;
  actionItems: ActionItem[] | null;
  keyTopics: string[] | null;
}

export function ExportControls({ meetingTitle, transcript, summary, actionItems, keyTopics }: ExportControlsProps) {
  const handleExport = () => {
    let content = `
      <html>
        <head>
          <title>NotiQ Lite Export - ${meetingTitle || 'Meeting Analysis'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.5; padding: 25px; color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #3F51B5; margin-bottom: 5px; }
            .date { font-size: 12px; color: #777; margin-bottom: 20px; }
            h2 { font-size: 20px; color: #3F51B5; border-bottom: 2px solid #E8EAF6; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
            p, ul, li { margin-bottom: 10px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .action-item { border-left: 3px solid #009688; padding-left: 10px; margin-bottom: 10px; background-color: #f7fdfc; padding: 10px; border-radius: 4px;}
            .action-item strong { color: #00796B; }
            .key-topic-badge { display: inline-block; background-color: #E0E0E0; color: #333; padding: 5px 10px; border-radius: 15px; margin-right: 5px; margin-bottom: 5px; font-size: 0.9em;}
            pre { background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 0.9em; border: 1px solid #eee; }
            .section { margin-bottom: 25px; }
            .no-content { color: #777; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NotiQ Lite</div>
              ${meetingTitle ? `<p style="font-size: 1.2em; margin-top: 5px;">${meetingTitle}</p>` : ''}
              <div class="date">Exported on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            </div>
    `;

    if (summary) {
      content += `
        <div class="section">
          <h2>Meeting Summary</h2>
          <p>${summary.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }

    if (actionItems && actionItems.length > 0) {
      content += `
        <div class="section">
          <h2>Action Items</h2>
          <ul>
            ${actionItems.map(item => `
              <li class="action-item">
                <p><strong>Description:</strong> ${item.description}</p>
                ${item.assignee ? `<p><strong>Assignee:</strong> ${item.assignee}</p>` : ''}
                ${item.dueDate ? `<p><strong>Due:</strong> ${item.dueDate}</p>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } else if (transcript) { // Only show "No action items" if there was a transcript to analyze
        content += `
        <div class="section">
          <h2>Action Items</h2>
          <p class="no-content">No action items identified.</p>
        </div>
      `;
    }


    if (keyTopics && keyTopics.length > 0) {
      content += `
        <div class="section">
          <h2>Key Topics</h2>
          <div>
            ${keyTopics.map(topic => `<span class="key-topic-badge">${topic}</span>`).join('')}
          </div>
        </div>
      `;
    } else if (transcript) { // Only show "No key topics" if there was a transcript to analyze
         content += `
        <div class="section">
          <h2>Key Topics</h2>
          <p class="no-content">No key topics identified.</p>
        </div>
      `;
    }

    if (transcript) {
      content += `
        <div class="section">
          <h2>Full Transcript</h2>
          <pre>${transcript}</pre>
        </div>
      `;
    }

    if (!summary && !(actionItems && actionItems.length > 0) && !(keyTopics && keyTopics.length > 0) && !transcript) {
      content += '<p class="no-content">No content available to export.</p>';
    }

    content += `
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus(); // Required for some browsers like Safari
      // Small delay before print to ensure content is rendered
      setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Optionally close window after print
      }, 250);
    } else {
      alert('Could not open print window. Please check your browser pop-up settings.');
    }
  };

  const canExport = !!(transcript || summary || (actionItems && actionItems.length > 0) || (keyTopics && keyTopics.length > 0));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-6 w-6 text-primary" />
          <span>Export</span>
        </CardTitle>
        <CardDescription>Download your meeting insights as a printable document.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleExport} 
          disabled={!canExport} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          aria-label="Export meeting insights to PDF"
        >
          Export Insights
        </Button>
        {!canExport && <p className="text-sm text-muted-foreground mt-2">No content available to export.</p>}
      </CardContent>
    </Card>
  );
}
