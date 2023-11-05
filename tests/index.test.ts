import { Chain, VirtualDomElement, render, text, create, props, children, events } from '../src/index';

describe('Chain', () => {
  it('should create a Chain instance', () => {
    const fn = jest.fn(input => ({ type: 'div', props: {}, children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }] }));
    const chain = new Chain(fn);
    expect(chain).toBeInstanceOf(Chain);
  });

  it('should run a function correctly', async () => {
    const chain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(input => ({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
    }));
    const result = await chain.run({ props: { greeting: 'world' } });
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
    const result = await wrappedChain.run({ props: { greeting: 'world' } });
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

    const result = await wrappedChain.run({ props: { greeting: 'world' } });
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

    const result = await asyncChain.run({ props: { greeting: 'world' } });
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

    const result = await wrappedChain.run({ props: { greeting: 'world' } });
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

    await expect(errorChain.run({ props: { greeting: '' } }))
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

  it('should render a text element', async () => {
    const textElement = await text('Hello, world!').run()
    if (container) render(textElement, container);

    expect(container?.textContent).toBe('Hello, world!');
  });

  it('should render a simple div element', async () => {
    const divElement = await create('div').with(props({ className: 'test-class' })).run()
    if (container) render(divElement, container);

    const renderedDiv = container?.querySelector('.test-class');
    expect(renderedDiv).not.toBeNull();
    expect(renderedDiv?.tagName).toBe('DIV');
  });

it('should render nested elements', async () => {
    const nestedElement = await create('div').with(children(
      create('span').with(children(text('Nested content')))
    )).run();
    if (container) render(nestedElement, container);

    const renderedSpan = container?.querySelector('span');
    expect(renderedSpan).not.toBeNull();
    expect(renderedSpan?.textContent).toBe('Nested content');
});

  it('should render an element with various properties', async () => {
    const prop = { id: 'unique', className: 'my-class', 'data-custom': 'custom-data' };
    const element = await create('div').with(props(prop)).run()
    if (container) render(element, container);

    const renderedElement = container?.firstChild as HTMLElement;
    expect(renderedElement).not.toBeNull();
    expect(renderedElement.id).toBe('unique');
    expect(renderedElement.className).toBe('my-class');
    expect(renderedElement.getAttribute('data-custom')).toBe('custom-data');
  });

  it('should attach an event listener to an element', async () => {
    const mockClickHandler = jest.fn();

    // Create your virtual DOM element with events outside of props
    const buttonElement = await create('button').with(
      events({
        click: mockClickHandler
      })).with(
        children(
          text('Click me')
        )
      ).run()

    // Render your button element
    if(container) render(buttonElement, container);

    // Simulate the click event
    const button = container?.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    // Check if the mock function was called
    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should handle conditional rendering', async () => {
    const renderIfTrue = async (condition: boolean) =>
      condition ? await create('span').with(children(text('Rendered'))).run() : null;

    if (container) render(await renderIfTrue(true), container);
    expect(container?.textContent).toContain('Rendered');
  
    if (container) container.innerHTML = '';

    // Re-render with the condition being false
    if (container) render(await renderIfTrue(false), container);
    expect(container?.textContent).not.toContain('Rendered');
  });
})
