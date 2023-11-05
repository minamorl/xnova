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

  with<V>(this: Chain<T, U>, nextFn: (input: U) => V | Promise<V>): Chain<T, V> {
    // The composed function should handle the promise returned by this.fn
    const composedFn = (input: T) => this.fn(input).then(nextFn);
    return new Chain<T, V>(composedFn);
  }

  run(input?: T): Promise<U> {
    return this.fn(input ?? null as T);
  }
}

// Define the virtual DOM element type
export type VirtualDomElement = {
  type: ElementType | 'text';
  events?: { [event: string]: (event: Event) => void }; // Optional events object
  props: { [key: string]: any };
  children: VirtualDomElement[];
};

export function render(vNode: VirtualDomElement | null, container: HTMLElement, oldVNode: VirtualDomElement | null = null) {
  if (vNode === oldVNode) {
    // If the vNode is the same as the oldVNode, we don't need to do anything
    return;
  }

  if (oldVNode == null) {
    // If there was no previous node, we just append the new node
    container.innerHTML = '';
    if (vNode) {
      const newDomElement = createDomElement(vNode);
      container.appendChild(newDomElement);
    }
  } else if (vNode == null) {
    // If the current vNode is null, remove the child
    container.innerHTML = '';
  } else if (vNode.type !== oldVNode.type || vNode.type === 'text' && vNode.props.nodeValue !== oldVNode.props.nodeValue) {
    // If the types are different, replace the child
    const newDomElement = createDomElement(vNode);
    container.replaceChild(newDomElement, container.firstChild!);
  } else {
    // If the types are the same, we update the existing DOM node
    const domElement = container.firstChild as HTMLElement;
    updateDomElement(domElement, vNode, oldVNode);
  }
}

function createDomElement(vNode: VirtualDomElement): HTMLElement | Text {
  let domElement: HTMLElement | Text;
  if (vNode.type === 'text') {
    // Create a text node if it's a text element
    domElement = document.createTextNode(vNode.props.nodeValue as string);
  } else {
    // Create the DOM element
    domElement = document.createElement(vNode.type);
    updateDomElement(domElement, vNode);
  }
  return domElement;
}

function updateDomElement(domElement: HTMLElement | Text, vNode: VirtualDomElement, oldVNode: VirtualDomElement | null = null) {
  if (vNode.type === 'text') {
    // Update text node value
    if (domElement.nodeValue !== vNode.props.nodeValue) {
      domElement.nodeValue = vNode.props.nodeValue as string;
    }
  } else {
    // Update properties and attributes
    updateProps(domElement as HTMLElement, vNode.props, oldVNode?.props || {});

    // Attach or update event handlers
    updateEvents(domElement as HTMLElement, vNode.events || {}, oldVNode?.events || {});

    // Update children recursively
    updateChildren(domElement as HTMLElement, vNode.children, oldVNode?.children || []);
  }
}

function updateProps(domElement: HTMLElement, newProps: { [key: string]: any }, oldProps: { [key: string]: any }) {
  // Remove old props
  for (const propName in oldProps) {
    if (!(propName in newProps)) {
      if (propName in domElement) {
        (domElement as any)[propName] = '';
      } else {
        domElement.removeAttribute(propName);
      }
    }
  }

  // Set new props
  for (const propName in newProps) {
    if (newProps[propName] !== oldProps[propName]) {
      if (propName in domElement) {
        (domElement as any)[propName] = newProps[propName];
      } else {
        domElement.setAttribute(propName, newProps[propName].toString());
      }
    }
  }
}

function updateEvents(domElement: HTMLElement, newEvents: { [event: string]: (event: Event) => void }, oldEvents: { [event: string]: (event: Event) => void }) {
  // Remove old events
  for (const eventName in oldEvents) {
    if (!(eventName in newEvents)) {
      domElement.removeEventListener(eventName, oldEvents[eventName]);
    }
  }

  // Add new events
  for (const eventName in newEvents) {
    if (oldEvents[eventName] !== newEvents[eventName]) {
      if (oldEvents[eventName]) {
        domElement.removeEventListener(eventName, oldEvents[eventName]);
      }
      domElement.addEventListener(eventName, newEvents[eventName]);
    }
  }
}

function updateChildren(domElement: HTMLElement, newChildren: VirtualDomElement[], oldChildren: VirtualDomElement[]) {
  // This is a naive implementation that always updates all children.
  // A more efficient approach would be to use keys and compare individual children.
  oldChildren.forEach((child, index) => {
    const newChild = newChildren[index];
    if (newChild) {
      render(newChild, domElement, child);
    } else if (child) {
      const childDom = domElement.childNodes[index] as HTMLElement;
      childDom && domElement.removeChild(childDom);
    }
  });

  // Add any new children that didn't exist before
  for (let i = oldChildren.length; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const newDomElement = createDomElement(newChild);
    domElement.appendChild(newDomElement);
  }
}

// Define a function that starts the chain with creating a basic virtual DOM element
export function create(type: ElementType | 'text') {
  return new Chain<VirtualDomElement | null, VirtualDomElement>(input => {
    return {
      type: type,
      props: input?.props || {},
      events: input?.events || {},
      children: input?.children || []
    };
  });
}


export function text(nodeValue: string): Chain<VirtualDomElement | null, VirtualDomElement> {
  return new Chain(() => ({
    type: 'text',
    props: {
      nodeValue
    },
    children: []
  }));
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
export function children(...childrenChains: Chain<VirtualDomElement | null, VirtualDomElement>[]) {
  return async (element: VirtualDomElement): Promise<VirtualDomElement> => {
    // Resolve all child chains to get the VirtualDomElements
    const resolvedChildren = await Promise.all(childrenChains.map(chain => chain.run(null)));
    // Filter out any nulls that may have been returned (if the chains allow for nulls)
    const nonNullChildren = resolvedChildren.filter(child => child !== null) as VirtualDomElement[];
    // Return the element with the children added
    return { ...element, children: nonNullChildren };
  };
}
