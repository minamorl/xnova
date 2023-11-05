export type ElementType =
  | 'a'
  | 'abbr'
  | 'address'
  | 'area'
  | 'article'
  | 'aside'
  | 'audio'
  | 'b'
  | 'base'
  | 'bdi'
  | 'bdo'
  | 'blockquote'
  | 'body'
  | 'br'
  | 'button'
  | 'canvas'
  | 'caption'
  | 'cite'
  | 'code'
  | 'col'
  | 'colgroup'
  | 'data'
  | 'datalist'
  | 'dd'
  | 'del'
  | 'details'
  | 'dfn'
  | 'dialog'
  | 'div'
  | 'dl'
  | 'dt'
  | 'em'
  | 'embed'
  | 'fieldset'
  | 'figcaption'
  | 'figure'
  | 'footer'
  | 'form'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'head'
  | 'header'
  | 'hgroup'
  | 'hr'
  | 'html'
  | 'i'
  | 'iframe'
  | 'img'
  | 'input'
  | 'ins'
  | 'kbd'
  | 'label'
  | 'legend'
  | 'li'
  | 'link'
  | 'main'
  | 'map'
  | 'mark'
  | 'meta'
  | 'meter'
  | 'nav'
  | 'noscript'
  | 'object'
  | 'ol'
  | 'optgroup'
  | 'option'
  | 'output'
  | 'p'
  | 'param'
  | 'picture'
  | 'pre'
  | 'progress'
  | 'q'
  | 'rp'
  | 'rt'
  | 'ruby'
  | 's'
  | 'samp'
  | 'script'
  | 'section'
  | 'select'
  | 'small'
  | 'source'
  | 'span'
  | 'strong'
  | 'style'
  | 'sub'
  | 'summary'
  | 'sup'
  | 'svg'
  | 'table'
  | 'tbody'
  | 'td'
  | 'template'
  | 'textarea'
  | 'tfoot'
  | 'th'
  | 'thead'
  | 'time'
  | 'title'
  | 'tr'
  | 'track'
  | 'u'
  | 'ul'
  | 'var'
  | 'video'
  | 'wbr';

export class Chain<T, U> {
  private fn: (input: T) => Promise<U>;

  constructor(fn: (input: T) => U | Promise<U>) {
    // Ensure the function always returns a Promise for consistency
    this.fn = (input: T) => Promise.resolve(fn(input));
  }

  with<V>(nextFn: (input: U) => V | Promise<V>): Chain<T, V> {
    // The composed function should handle the promise returned by this.fn
    const composedFn = (input: T) => this.fn(input).then(nextFn);
    return new Chain<T, V>(composedFn);
  }

  // The execute function will trigger the chain of promises
  execute(input: T): Promise<U> {
    return this.fn(input);
  }
}

// Define the virtual DOM element type
export type VirtualDomElement = {
  type: ElementType | 'text';
  events?: { [event: string]: (event: Event) => void }; // Optional events object
  props: { [key: string]: any };
  children: VirtualDomElement[];
};

export function render(vNode: VirtualDomElement | null, container: HTMLElement) {
  let domElement: HTMLElement | Text;
  if (!vNode) {
    return;
  }

  if (vNode.type === 'text') {
    // Create a text node if it's a text element
    domElement = document.createTextNode(vNode.props.nodeValue as string);
    container.appendChild(domElement);
  } else {
    // Create the DOM element
    domElement = document.createElement(vNode.type);

    // Set properties and attributes
    Object.keys(vNode.props).forEach(propName => {
      const value = vNode.props[propName];
      if (propName !== 'children') {
        if (domElement instanceof HTMLElement) {
          // Use specific type assertion for HTMLElement
          if (propName in domElement) {
            (domElement as any)[propName] = value;
          } else {
            domElement.setAttribute(propName, value.toString());
          }
        }
      }
    });

    // Attach event handlers if they are defined
    if (vNode.events) {
      Object.keys(vNode.events).forEach(eventName => {
        const handler = vNode.events![eventName];
        domElement.addEventListener(eventName, handler);
      });
    }

    // Append the element to the container
    container.appendChild(domElement);

    // Recursively render children if they exist
    if (vNode.children) {
      vNode.children.forEach((child: VirtualDomElement) => {
        // Make sure to only call render on HTMLElements
        if (domElement instanceof HTMLElement) {
          render(child, domElement);
        }
      });
    }
  }
}

// Define a function that starts the chain with creating a basic virtual DOM element
export function create(type: ElementType | 'text') {
  return new Chain<{ props?: {}; events?: {}; children?: VirtualDomElement[] }, VirtualDomElement>(input => {
    return {
      type: type,
      props: input.props || {},
      events: input.events || {},
      children: input.children || []
    };
  });
}

export function root<T>(): Chain<T, T> {
  return new Chain<T, T>((id) => id);
}

export function text(nodeValue: string): VirtualDomElement {
  return {
    type: 'text',
    props: {
      nodeValue
    },
    children: []
  };
};

// Define a function to set props on the virtual DOM element
export function props(props: { [key: string]: any }) {
  return (element: VirtualDomElement) => {
    return { ...element, props };
  };
}

// Define a function to set events on the virtual DOM element
export function events(events: { [event: string]: (event: Event) => void }) {
  return (element: VirtualDomElement) => {
    return { ...element, events };
  };
}

// Define a function to add children to the virtual DOM element
export function children(...children: VirtualDomElement[]) {
  return (element: VirtualDomElement) => {
    return { ...element, children };
  };
}
