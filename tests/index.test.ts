import { Chain, VirtualDomElement, render, createTextElement, createElement, root, text } from '../src/index';

describe('Chain', () => {
  it('should create a Chain instance', () => {
    const fn = jest.fn(input => ({ type: 'div', props: {}, children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }] }));
    const chain = new Chain(fn);
    expect(chain).toBeInstanceOf(Chain);
  });

  it('should execute a function correctly', async () => {
    const chain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(input => ({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
    }));
    const result = await chain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, world' }, children: [] }]
    });
  });

  it('should compose functions using with', async () => {
    const chain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(input => ({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
    }));
    const wrappedChain = chain.with<VirtualDomElement>(divElement => ({
      type: 'div',
      props: {},
      children: [divElement]
    }));
    const result = await wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      props: {},
      children: [{
        type: 'div',
        props: {},
        children: [{ type: 'text', props: { nodeValue: 'Hello, world' }, children: [] }]
      }]
    });
  });

  it('should handle deeply nested structures', async () => {
    const chain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(input => ({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
    }));

    // Wrap the div in two more divs
    const wrappedChain = chain
      .with<VirtualDomElement>(divElement => ({
        type: 'div',
        props: {},
        children: [divElement]
      }))
      .with<VirtualDomElement>(divElement => ({
        type: 'div',
        props: {},
        children: [divElement]
      }));

    const result = await wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      props: {},
      children: [{
        type: 'div',
        props: {},
        children: [{
          type: 'div',
          props: {},
          children: [{ type: 'text', props: { nodeValue: 'Hello, world' }, children: [] }]
        }]
      }]
    });
  });

  it('should execute an async function correctly', async () => {
    const asyncChain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(async input => {
      return {
        type: 'div',
        props: {},
        children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
      };
    });

    const result = await asyncChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, world' }, children: [] }]
    });
  });

  it('should compose async functions using with', async () => {
    const asyncChain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(async input => {
      return {
        type: 'div',
        props: {},
        children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
      };
    });

    const wrappedChain = asyncChain.with<VirtualDomElement>(async divElement => {
      return {
        type: 'div',
        props: {},
        children: [divElement]
      };
    });

    const result = await wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      props: {},
      children: [{
        type: 'div',
        props: {},
        children: [{ type: 'text', props: { nodeValue: 'Hello, world' }, children: [] }]
      }]
    });
  });

  it('should handle errors during execution', async () => {
    const errorChain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(async input => {
      if (!input.props.greeting) {
        throw new Error('No greeting provided');
      }
      return {
        type: 'div',
        props: {},
        children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
      };
    });

    await expect(errorChain.execute({ props: { greeting: '' } }))
      .rejects
      .toThrow('No greeting provided');
  });
});


describe('render', () => {
  let container: HTMLElement | null;

  beforeEach(() => {
    // Set up a DOM element as a render target
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  });
  afterEach(() => {
    // Clean up after each test
    if (container) {
      document.body.removeChild(container);
    }
  });

  it('should render a text element', () => {
    const textElement = createTextElement('Hello, world!');
    if (container) render(textElement, container);

    expect(container?.textContent).toBe('Hello, world!');
  });

  it('should render a simple div element', () => {
    const divElement = createElement('div', { className: 'test-class' }, {});
    if (container) render(divElement, container);

    const renderedDiv = container?.querySelector('.test-class');
    expect(renderedDiv).not.toBeNull();
    expect(renderedDiv?.tagName).toBe('DIV');
  });

  it('should render nested elements', () => {
    const nestedElement = createElement('div', {}, {}, createElement('span', {}, {}, createTextElement('Nested content')));

    if (container) render(nestedElement, container);

    const renderedSpan = container?.querySelector('span');
    expect(renderedSpan).not.toBeNull();
    expect(renderedSpan?.textContent).toBe('Nested content');
  });

  it('should render an element with various properties', () => {
    const props = { id: 'unique', className: 'my-class', 'data-custom': 'custom-data' };
    const element = createElement('div', props, {});
    if (container) render(element, container);

    const renderedElement = container?.firstChild as HTMLElement;
    expect(renderedElement).not.toBeNull();
    expect(renderedElement.id).toBe('unique');
    expect(renderedElement.className).toBe('my-class');
    expect(renderedElement.getAttribute('data-custom')).toBe('custom-data');
  });

  it('should attach an event listener to an element', () => {
    const mockClickHandler = jest.fn();

    // Create your virtual DOM element with events outside of props
    const buttonElement = createElement('button', { /* props here */ }, {
      click: mockClickHandler
    }, createTextElement('Click me'));

    // Render your button element
    if(container) render(buttonElement, container);

    // Simulate the click event
    const button = container?.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    // Check if the mock function was called
    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should handle conditional rendering', () => {
    const renderIfTrue = (condition: boolean) =>
      condition ? createElement('span', {}, {}, createTextElement('Rendered')) : null;

    if (container) render(renderIfTrue(true), container);
    expect(container?.textContent).toContain('Rendered');
  
    if (container) container.innerHTML = '';

    // Re-render with the condition being false
    if (container) render(renderIfTrue(false), container);
    expect(container?.textContent).not.toContain('Rendered');
  });
})
describe('root function', () => {
  it('should execute the chain with state and create a virtual DOM text node', async () => {
    // Define the state type
    type State = {
      text: string;
    };

    // Create a state object
    const state: State = {
      text: 'hello'
    };

    // Create a chain and execute
    const virtualDomChain = root<State>().with(s => text(s.text));
    const virtualDomElement = await virtualDomChain.execute(state);

    // Assertions
    expect(virtualDomElement).toEqual({
      type: 'text',
      props: { nodeValue: 'hello' },
    });
  });
});
