import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  className?: string;
}

export function SearchInput({ onSearch, loading = false, className }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative flex items-center gap-2 rounded-md",
        focused && "ring-2 ring-primary/20",
        className
      )}
    >
      <div className="relative flex-1 group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
          <ImagePlus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          placeholder="Search for images..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "pl-9 pr-4 w-full bg-transparent transition-all duration-200",
            "border-muted-foreground/20 focus:border-primary/50",
            "placeholder:text-muted-foreground/50",
            loading && "text-muted-foreground"
          )}
          disabled={loading}
          aria-label="Search images"
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="submit" 
            disabled={loading || !query.trim()}
            variant={focused ? "default" : "secondary"}
            size="sm"
            className={cn(
              "shrink-0 transition-all duration-200",
              loading && "bg-muted"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Search</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search for images</p>
        </TooltipContent>
      </Tooltip>
    </form>
  );
} 