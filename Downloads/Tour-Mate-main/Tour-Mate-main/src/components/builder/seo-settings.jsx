'use client';
import { useBuilder } from '@/hooks/use-builder';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function SeoSettings() {
  const { seoConfig, setSeoConfig } = useBuilder();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-headline text-lg font-medium">Page Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure settings for search engine optimization (SEO).
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo-title">Title</Label>
          <Input
            id="seo-title"
            value={seoConfig.title}
            onChange={e =>
              setSeoConfig(prev => ({ ...prev, title: e.target.value }))
            }
            placeholder="Your page title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-description">Description</Label>
          <Textarea
            id="seo-description"
            value={seoConfig.description}
            onChange={e =>
              setSeoConfig(prev => ({ ...prev, description: e.target.value }))
            }
            placeholder="A short description of your page"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
