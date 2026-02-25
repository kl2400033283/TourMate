import { Button } from '@/components/ui/button';

export function ButtonBlock({ text }) {
  return (
    <div className="p-4 text-center">
      <Button size="lg">{text}</Button>
    </div>
  );
}
