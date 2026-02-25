import { cn } from '@/lib/utils';

export function TextBlock({ text, as = 'p', className }) {
  const Tag = as;
  const styles = {
    h1: 'font-headline text-5xl font-bold tracking-tighter',
    h2: 'font-headline text-4xl font-semibold tracking-tight',
    h3: 'font-headline text-2xl font-semibold',
    p: 'text-base leading-relaxed',
  };

  return (
    <div className="p-4 md:p-6">
      <Tag className={cn(styles[as], className)}>{text}</Tag>
    </div>
  );
}
