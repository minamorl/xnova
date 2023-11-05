import './index.css';
import { render, create, text, props, children, VirtualDomElement } from 'xnova';

// Helper function to add classes to elements
const classed = (className: string) => props({ class: className });

// Create header element
const createHeader = () =>
   create('header')
    .with(classed('flex'))
    .with(children(
      create('div')
        .with(classed('flex-1 text-lg font-bold'))
        .with(children(text('Xnova'))),
      create('nav')
        .with(children(
          create('ul')
            .with(classed('flex space-x-4'))
            .with(children(
              create('li').with(children(text('Home'))),
            ))
        ))
    ))
    

// Create main section element
const createMainSection = () =>
  create('main')
    .with(classed('text-center p-10 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 h-full'))
    .with(children(
      create('h1')
        .with(classed('text-5xl font-bold text-white my-4'))
        .with(children(text('Welcome to Xnova'))),
      create('p')
        .with(classed('text-xl text-gray-300 my-4'))
        .with(children(text('Explore our new JS library'))),
      create('p')
      .with(classed('text-xl text-gray-200 mt-6'))
      .with(children(text('This text is generated by the xnova virtual DOM library, ' +
                          'which enables the creation of user interfaces in a declarative way using JavaScript functions. ' +
                          'Each UI component is a function that returns a virtual DOM element, ' +
                          'representing the structure and content of the component without relying on HTML markup. ' +
                          'The virtual DOM approach is efficient, as it only updates parts of the DOM that have changed.'))),
                          create('button')
        .with(classed('mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full'))
        .with(children(text('Explore Now')))
    ))


// Create footer element
const createFooter = () =>
  create('footer')
    .with(classed('flex justify-center items-center p-4 bg-gray-800 text-white'))
    .with(children(
      create('div')
        .with(classed('flex space-x-4'))
        .with(children(
          create('a').with(props({ href: 'https://github.com/minamorl/xnova' })).with(classed('hover:text-gray-300')).with(children(text('GitHub')))
        ))
    ))

// Root component that renders the welcome page
const WelcomePage = async () =>
  await create('div')
    .with(classed('flex flex-col h-screen'))
    .with(children(
      createHeader(),
      createMainSection(),
      createFooter()
    ))
    .run();

// Rendering the Welcome Page
document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const welcomePageElement = await WelcomePage();
    render(welcomePageElement, rootElement);
  }
});
