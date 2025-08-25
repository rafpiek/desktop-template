'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/editor/v2/tiptap-editor";
import { type TiptapValue } from "@/components/editor/v2/tiptap-types";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  List, 
  ListOrdered, 
  Quote,
  Minus,
  Code,
  Undo,
  Redo
} from "lucide-react";

const initialContent: TiptapValue = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to the Rich Text Editor" }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This editor is built with " },
        { type: "text", marks: [{ type: "bold" }], text: "Tiptap" },
        { type: "text", text: " and supports many formatting options:" }
      ]
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "bold" }], text: "Bold" },
                { type: "text", text: ", " },
                { type: "text", marks: [{ type: "italic" }], text: "italic" },
                { type: "text", text: ", and " },
                { type: "text", marks: [{ type: "underline" }], text: "underlined" },
                { type: "text", text: " text" }
              ]
            }
          ]
        },
        {
          type: "listItem", 
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Multiple heading levels" }]
            }
          ]
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph", 
              content: [{ type: "text", text: "Bulleted and numbered lists" }]
            }
          ]
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Blockquotes and horizontal rules" }]
            }
          ]
        }
      ]
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "This is a blockquote. Perfect for highlighting important information or quotes." }]
        }
      ]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Try editing this content to see the editor in action!" }]
    }
  ]
};

export default function EditorPage() {
  const [content, setContent] = useState<TiptapValue>(initialContent);
  const [wordCount, setWordCount] = useState(0);

  const handleContentUpdate = (newContent: TiptapValue) => {
    setContent(newContent);
    
    // Simple word count calculation
    const text = JSON.stringify(newContent).replace(/[^\w\s]/gi, ' ');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const features = [
    { icon: Bold, name: "Bold", desc: "Make text bold" },
    { icon: Italic, name: "Italic", desc: "Italicize text" },
    { icon: Underline, name: "Underline", desc: "Underline text" },
    { icon: Strikethrough, name: "Strike", desc: "Strikethrough text" },
    { icon: Heading1, name: "Headings", desc: "H1-H6 support" },
    { icon: List, name: "Lists", desc: "Bullet lists" },
    { icon: ListOrdered, name: "Numbered", desc: "Ordered lists" },
    { icon: Quote, name: "Quotes", desc: "Blockquotes" },
    { icon: Minus, name: "Rules", desc: "Horizontal rules" },
    { icon: Code, name: "Code", desc: "Inline code" },
    { icon: Undo, name: "Undo", desc: "Undo changes" },
    { icon: Redo, name: "Redo", desc: "Redo changes" }
  ];

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Rich Text Editor Demo</h1>
        <p className="text-muted-foreground">
          Showcasing Tiptap editor capabilities in a desktop application
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Editor</CardTitle>
                  <CardDescription>
                    Try editing the content below to see the editor in action
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {wordCount} words
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg min-h-[400px] bg-card">
                <TiptapEditor
                  initialContent={content}
                  onUpdate={handleContentUpdate}
                  placeholder="Start writing..."
                  className="min-h-[400px] p-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Editor Output</CardTitle>
              <CardDescription>
                Live JSON output from the editor (useful for debugging)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-40">
                {JSON.stringify(content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Available formatting options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Tiptap</CardTitle>
              <CardDescription>
                Modern rich text editor framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tiptap is a headless, framework-agnostic rich text editor that's built 
                on top of ProseMirror. It provides a clean, extensible foundation for 
                building custom editors.
              </p>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Why Tiptap?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Highly customizable and extensible</li>
                  <li>• TypeScript support out of the box</li>
                  <li>• Works with React, Vue, and vanilla JS</li>
                  <li>• Rich plugin ecosystem</li>
                  <li>• Excellent performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Usage</CardTitle>
              <CardDescription>
                How to use this editor in your app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <div>import {'{ TiptapEditor }'}</div>
                <div>from '@/components/editor/v2/tiptap-editor'</div>
              </div>
              <p className="text-xs text-muted-foreground">
                The editor component is fully self-contained and can be easily 
                integrated into any part of your application.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}