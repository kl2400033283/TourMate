import Image from 'next/image';

export function ImageBlock({ src, alt }) {
  return (
    <div className="p-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image 
            src={src} 
            alt={alt} 
            fill 
            className="object-cover" 
            data-ai-hint="abstract background"
        />
      </div>
    </div>
  );
}
