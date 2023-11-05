import { Chain, ContainerElement, BaseElement } from '../src/index';

describe('Chain', () => {
  it('should create a Chain instance', () => {
    const fn = jest.fn(input => ({ type: 'div', content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }] }));
    const chain = new Chain(fn);
    expect(chain).toBeInstanceOf(Chain);
  });

  it('should execute a function correctly', () => {
    const chain = new Chain<{ props: { greeting: string } }, ContainerElement>(input => ({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
    }));
    const result = chain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, world' }]
    });
  });

  it('should compose functions using next', () => {
    const chain = new Chain<{ props: { greeting: string } }, ContainerElement>(input => ({
      type: 'div',
      content: [{ type: 'text', content: 'Hello, ' + input.props.greeting }]
    }));
    const wrappedChain = chain.next<BaseElement>((divElement: ContainerElement) => ({
      type: 'div',
      content: [divElement]
    }));
    const result = wrappedChain.execute({ props: { greeting: 'world' } });
    expect(result).toEqual({
      type: 'div',
      content: [{
        type: 'div',
        content: [{ type: 'text', content: 'Hello, world' }]
      }]
    });
  });
});
