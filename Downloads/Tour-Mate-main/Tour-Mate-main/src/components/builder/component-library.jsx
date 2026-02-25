'use client';
import { useBuilder } from '@/hooks/use-builder';
import { Button } from '@/components/ui/button';
import {
  Type,
  Image as ImageIcon,
  CheckSquare,
  Heading1,
  GalleryVerticalEnd,
  RectangleHorizontal,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const components = [
  {
    name: 'Header',
    type: 'header',
    icon: Heading1,
    defaultProps: { text: 'Impressive Headline' },
  },
  {
    name: 'Text',
    type: 'text-block',
    icon: Type,
    defaultProps: {
      text: 'This is a paragraph. You can edit this text to say whatever you want. Double-click to start typing.',
    },
  },
  {
    name: 'Image',
    type: 'image',
    icon: ImageIcon,
    defaultProps: {
      src: PlaceHolderImages.find(p => p.id === 'feature-image-1')?.imageUrl || 'https://picsum.photos/seed/2/600/400',
      alt: 'Placeholder Image',
    },
  },
  {
    name: 'Button',
    type: 'button',
    icon: CheckSquare,
    defaultProps: { text: 'Click Me' },
  },
  {
    name: 'Container',
    type: 'container',
    icon: RectangleHorizontal,
    defaultProps: {},
  },
  {
    name: 'Footer',
    type: 'footer',
    icon: GalleryVerticalEnd,
    defaultProps: { text: `© ${new Date().getFullYear()} My Company` },
  },
];

export function ComponentLibrary() {
  const { addElement, elements } = useBuilder();

  return (
    <div className="space-y-4">
      <h3 className="font-headline text-lg font-medium">Building Blocks</h3>
      <div className="grid grid-cols-2 gap-4">
        {components.map(comp => (
          <Button
            key={comp.name}
            variant="outline"
            className="h-24 flex-col gap-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            onClick={() =>
              addElement(elements.length, {
                type: comp.type,
                props: comp.defaultProps,
              })
            }
          >
            <comp.icon className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">{comp.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
