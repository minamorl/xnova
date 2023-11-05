import { Chain, ContainerElement, BaseElement } from '../src/index';

describe('Chain', () => {
  it('should create a Chain instance', () => {
    const fn = jest.fn(input => ({ type: 'div', content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }] }));
    const chain = new Chain(fn);
    expect(chain).toBeInstanceOf(Chain);
  });

  it('should execute a function correctly', async () => {
    const chain = new Chain<{ props: { greeting: string } }, ContainerElement>(input => ({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
    }));
    const result = await chain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, world' }]
    });
  });

  it('should compose functions using next', async () => {
    const chain = new Chain<{ props: { greeting: string } }, ContainerElement>(input => ({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
    }));
    const wrappedChain = await chain.next<BaseElement>((divElement: ContainerElement) => ({
      type: 'div',
      content: [divElement]
    }));
    const result = await wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{
        type: 'div',
        content: [{ type: 'text', content: 'Hello, world' }]
      }]
    });
  });
  it('should handle deeply nested structures', async () => {
    const chain = new Chain<{ props: { greeting: string } }, ContainerElement>(input => ({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
    }));

    // Wrap the div in two more divs
    const wrappedChain = chain
      .next<BaseElement>(divElement => ({
        type: 'div',
        content: [divElement]
      }))
      .next<BaseElement>(divElement => ({
        type: 'div',
        content: [divElement]
      }));

    const result = await wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{
        type: 'div',
        content: [{
          type: 'div',
          content: [{ type: 'text', content: 'Hello, world' }]
        }]
      }]
    });
  });
  it('should execute an async function correctly', async () => {
    const asyncChain = new Chain<{ props: { greeting: string } }, ContainerElement>(async input => {
      return {
        type: 'div',
        content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
      };
    });

    const result = await asyncChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, world' }]
    });
  });

  it('should compose async functions using next', async () => {
    const asyncChain = new Chain<{ props: { greeting: string } }, ContainerElement>(async input => {
      return {
        type: 'div',
        content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
      };
    });

    const wrappedChain = await asyncChain.next<BaseElement>(async divElement => {
      return {
        type: 'div',
        content: [divElement]
      };
    });

    const result = await wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{
        type: 'div',
        content: [{ type: 'text', content: 'Hello, world' }]
      }]
    });
  });

  it('should handle errors during execution', async () => {
    const errorChain = new Chain<{ props: { greeting: string } }, ContainerElement>(async input => {
      if (!input.props.greeting) {
        throw new Error('No greeting provided');
      }
      return {
        type: 'div',
        content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
      };
    });

    await expect(errorChain.execute({ props: { greeting: '' } }))
      .rejects
      .toThrow('No greeting provided');
  });
});
