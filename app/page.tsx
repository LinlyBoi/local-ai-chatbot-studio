import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Terminal, Cpu, MessageSquare, ChevronRight, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      
      {/* GitHub Link */}
      <div className="absolute top-4 right-4 z-10">
        <Link 
          href="https://github.com/markelaugust74" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
            <Github className="w-5 h-5" />
            <span className="sr-only">GitHub</span>
          </Button>
        </Link>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Version Badge */}
            <div className="flex justify-center animate-fade-in">
              <Badge variant="outline" className="mb-4 text-sm py-1 px-4">
                v1.0.0 Beta
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className={cn(
              "text-6xl sm:text-7xl font-bold tracking-tighter bg-clip-text text-transparent animate-fade-in-up",
              "bg-gradient-to-r from-foreground to-foreground/70"
            )}>
              Local Live2D 
              <br />
              AI Chatbot
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
              Chat with your favorite anime characters powered by AI. Experience natural conversations with Live2D animations and emotional responses.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 mt-12 flex-col sm:flex-row animate-fade-in-up [animation-delay:400ms]">
              <Link href="/characters">
                <Button 
                  size="lg" 
                  className="text-lg px-8 h-12 transition-transform hover:scale-105 group"
                >
                  Browse Characters
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link 
                href="https://github.com/markelaugust74/Live2D-AI-Chatbot" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 h-12 transition-transform hover:scale-105"
                >
                  View on GitHub
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 animate-fade-in-up [animation-delay:600ms]">
              <div className="p-6 rounded-2xl bg-card border group hover:border-primary transition-colors">
                <Terminal className="w-10 h-10 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">Local First</h3>
                <p className="text-muted-foreground">Run AI models locally on your machine for privacy and control</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border group hover:border-primary transition-colors">
                <Cpu className="w-10 h-10 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">Live2D Animation</h3>
                <p className="text-muted-foreground">Expressive character animations that respond to the conversation</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border group hover:border-primary transition-colors">
                <MessageSquare className="w-10 h-10 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">Character AI</h3>
                <p className="text-muted-foreground">Advanced AI models that maintain character consistency</p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mt-32 animate-fade-in-up [animation-delay:800ms]">
              <h2 className="text-3xl font-bold mb-8">Powered By</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <Badge variant="secondary" className="text-lg py-2 px-6">Next.js 15.1.2</Badge>
                <Badge variant="secondary" className="text-lg py-2 px-6">Live2D</Badge>
                <Badge variant="secondary" className="text-lg py-2 px-6">Ollama</Badge>
                <Badge variant="secondary" className="text-lg py-2 px-6">Tailwind CSS</Badge>
                <Badge variant="secondary" className="text-lg py-2 px-6">TypeScript</Badge>
              </div>
            </div>

            {/* Getting Started */}
            <div className="mt-32 text-left animate-fade-in-up [animation-delay:1000ms]">
              <h2 className="text-3xl font-bold mb-8 text-center">Getting Started</h2>
              <div className="bg-card border rounded-2xl p-8">
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-lg">Clone the repository</li>
                  <li className="text-lg">Install dependencies using <code className="bg-muted px-2 py-1 rounded">npm install</code></li>
                  <li className="text-lg">Install Ollama and download required models</li>
                  <li className="text-lg">Start the development server with <code className="bg-muted px-2 py-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm mt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 Live2D AI Chatbot. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/markelaugust74" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                href="https://buymeacoffee.com/markelaugust" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Heart className="w-3 h-3" /> Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}