import { TextBlock } from '@/components/canvas-elements/text-block';
import { ImageBlock } from '@/components/canvas-elements/image-block';
import { ButtonBlock } from '@/components/canvas-elements/button-block';
import { HeaderBlock } from '@/components/canvas-elements/header-block';
import { ContainerBlock } from '@/components/canvas-elements/container-block';
import { PlaceholderBlock } from '@/components/canvas-elements/placeholder-block';

export function ElementRenderer({ element }) {
  switch (element.type) {
    case 'header':
      return <HeaderBlock {...element.props} />;
    case 'hero': // AI hero is often a header with specific styling
      return <HeaderBlock {...element.props} isHero={true} />;
    case 'text-block':
    case 'text':
      return <TextBlock {...element.props} />;
    case 'image':
      return <ImageBlock {...element.props} />;
    case 'button':
      return <ButtonBlock {...element.props} />;
    case 'container':
      return <ContainerBlock {...element.props} element={element} />;
    case 'footer':
      return <footer className="p-8 text-center text-sm text-muted-foreground bg-muted/50">{element.props.text}</footer>
    default:
      return <PlaceholderBlock type={element.type} {...element.props} />;
  }
}
