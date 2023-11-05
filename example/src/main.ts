import { render, createElement, createTextElement, VirtualDomElement } from 'xnova';
import { textStore } from './store';
import { autorun } from 'mobx';

// Function to create the input element
const createInput = (): VirtualDomElement => {
  return createElement('input', {
    id: 'input',
    oninput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      textStore.setText(target.value);
    },
    value: textStore.text,
  }, {});
};

// Function to create the display element
const createDisplay = (): VirtualDomElement => {
  return createTextElement(textStore.text);
};

// Root component that renders the input and the live display
const App = (): VirtualDomElement => {
  return createElement('div', { id: 'app' }, {},
    createInput(),
    createElement('div', { id: 'display' }, {}, createDisplay())
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {

    autorun(() => {
      let activeElementId = document.activeElement?.id; // Get the active element before update
      // Clear previous content
      rootElement.innerHTML = '';
      // Render the new state of the app
      render(App(), rootElement);

      // If the active element before the DOM update was the input, refocus it
      if (activeElementId === 'input') {
        const inputElement = document.getElementById('input');
        inputElement?.focus();
      }
    });
  }
});
