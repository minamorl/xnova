import { render, createElement, root, text } from '@xnova';

export const App = root<{}>()
  .with(() =>
    createElement('div', { id: 'app', className: 'app-container' },
      {},
      text('Hello World!'),
      createElement('button', { id: 'clickMe' }, { click: () => alert('Button clicked!') }, text('Click me'))
    )
  );
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    App.execute({}).then((virtualDom: any) => {
      render(virtualDom, rootElement);
    });
  }
});
