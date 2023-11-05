import { Chain, VirtualDomElement, render, createTextElement, createElement } from '../src/index';

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

  it('should compose functions using next', async () => {
    const chain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(input => ({
      type: 'div',
      props: {},
      children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
    }));
    const wrappedChain = chain.next<VirtualDomElement>(divElement => ({
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
      .next<VirtualDomElement>(divElement => ({
        type: 'div',
        props: {},
        children: [divElement]
      }))
      .next<VirtualDomElement>(divElement => ({
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

  it('should compose async functions using next', async () => {
    const asyncChain = new Chain<{ props: { greeting: string } }, VirtualDomElement>(async input => {
      return {
        type: 'div',
        props: {},
        children: [{ type: 'text', props: { nodeValue: 'Hello, ' + input.props.greeting }, children: [] }]
      };
    });

    const wrappedChain = asyncChain.next<VirtualDomElement>(async divElement => {
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
    const divElement = createElement('div', { className: 'test-class' });
    if (container) render(divElement, container);

    const renderedDiv = container?.querySelector('.test-class');
    expect(renderedDiv).not.toBeNull();
    expect(renderedDiv?.tagName).toBe('DIV');
  });

  it('should render nested elements', () => {
    const nestedElement = createElement('div', {}, createElement('span', {}, createTextElement('Nested content')));

    if (container) render(nestedElement, container);

    const renderedSpan = container?.querySelector('span');
    expect(renderedSpan).not.toBeNull();
    expect(renderedSpan?.textContent).toBe('Nested content');
  });

});
