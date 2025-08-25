'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Desktop Template</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern desktop application template built with React, Tauri, TypeScript, and Tailwind CSS. 
          Perfect for building cross-platform desktop applications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🚀</span>
              Technology Stack
            </CardTitle>
            <CardDescription>
              Modern technologies for building fast, reliable desktop applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">React 19</Badge>
              <Badge variant="secondary">Tauri 2.7</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">Vite</Badge>
              <Badge variant="secondary">Radix UI</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✨</span>
              Features
            </CardTitle>
            <CardDescription>
              Everything you need to build a professional desktop app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li>• Cross-platform desktop app with native performance</li>
              <li>• Modern React 19 with TypeScript</li>
              <li>• Beautiful UI components with Radix UI</li>
              <li>• Dark/Light theme support</li>
              <li>• Rich text editor with Tiptap</li>
              <li>• Data visualization with Recharts</li>
              <li>• File system access with Tauri plugins</li>
              <li>• Hot reload development experience</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🛠️</span>
              Getting Started
            </CardTitle>
            <CardDescription>
              Quick setup and development workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <div># Install dependencies</div>
              <div>bun install</div>
              <br />
              <div># Start development</div>
              <div>bun run tauri:dev</div>
              <br />
              <div># Build for production</div>
              <div>bun run tauri:build</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📦</span>
              What's Included
            </CardTitle>
            <CardDescription>
              Ready-to-use components and patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li>• Navigation layout with routing</li>
              <li>• Theme provider and toggle</li>
              <li>• Rich text editor demo</li>
              <li>• Charts and data visualization</li>
              <li>• Settings page with preferences</li>
              <li>• Responsive design patterns</li>
              <li>• TypeScript configuration</li>
              <li>• ESLint and Prettier setup</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About This Template</CardTitle>
          <CardDescription>
            This template was created to provide a solid foundation for desktop application development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Built as a clean, minimal starting point for desktop applications that need modern web technologies 
            with native desktop capabilities. The template includes essential patterns and components while 
            remaining lightweight and customizable.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              View Source
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}