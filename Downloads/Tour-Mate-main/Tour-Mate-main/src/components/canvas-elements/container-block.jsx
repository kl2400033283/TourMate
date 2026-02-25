import { ElementRenderer } from '../builder/element-renderer';

export function ContainerBlock({ element }) {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        {element.children && element.children.length > 0 ? (
          element.children.map(child => (
            <ElementRenderer key={child.id} element={child} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            This is an empty container. Drag elements here.
          </p>
        )}
      </div>
    </div>
  );
}
