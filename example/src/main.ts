import './index.css'
import { render, create, text, props, children, events } from 'xnova';

// Helper functions to add classes and attributes to elements
const classed = (className: string) => props({ class: className });
const attr = (attributes: { [key: string]: string }) => props(attributes);

// Header
const createHeader = () =>
  create('header')
    .with(classed('bg-gray-900 text-white p-6 shadow-lg'))
    .with(children(
      create('div')
        .with(classed('container mx-auto flex justify-between items-center')),
        create('h1')
          .with(classed('text-3xl font-bold'))
          .with(children(text('Xnova'))),
        create('nav')
          .with(classed('flex space-x-6')),
          create('a').with(attr({ href: '#', class: 'hover:text-blue-300' })).with(children(text('Home'))),
          create('a').with(attr({ href: '#features', class: 'hover:text-blue-300' })).with(children(text('Features'))),
          create('a').with(attr({ href: '#about', class: 'hover:text-blue-300' })).with(children(text('About'))),
          create('a').with(attr({ href: '#contact', class: 'hover:text-blue-300' })).with(children(text('Contact')))
    ));

// Main Section
const createMainSection = () =>
  create('main')
    .with(classed('container mx-auto my-10 p-10'))
    .with(children(
      create('section')
        .with(classed('text-center my-10 p-10 bg-gradient-to-r from-blue-500 to-blue-700 shadow-xl rounded-lg'))
        .with(children(
          create('h2')
            .with(classed('text-5xl text-white font-bold mb-6'))
            .with(children(text('Innovative Solutions'))),
          create('p')
            .with(classed('text-xl text-blue-200 mb-6'))
            .with(children(text('Crafting digital experiences with the latest web technologies.'))),
          create('button')
            .with(classed('bg-slate-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full transition duration-300'))
            .with(events({ click: () => alert('Explore clicked!') }))
            .with(children(text('Explore Now')))
        ))
    ));

// Feature Section
const createFeaturesSection = () =>
  create('section')
    .with(classed('container mx-auto my-10'))
    .with(children(
      create('h3')
        .with(classed('text-3xl font-bold text-center my-6'))
        .with(children(text('Why Xnova?'))),
      create('div')
        .with(classed('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'))
        .with(children(
          createFeature('Fast and Reliable', 'Speedy performance with the latest web technologies.'),
          createFeature('Responsive Design', 'Looks great on any device, from mobile to desktop.'),
          createFeature('Modern', 'Utilizing the most recent advancements in web standards.')
        ))
    ));


// Helper function to create a feature
const createFeature = (title: string, description: string) =>
  create('div')
    .with(classed('bg-gray-100 p-6 rounded-lg shadow-md'))
    .with(children(
      create('h4')
        .with(classed('text-2xl font-bold mb-4'))
        .with(children(text(title))),
      create('p')
        .with(classed('text-gray-700'))
        .with(children(text(description)))
    ));

// Footer
const createFooter = () =>
  create('footer')
    .with(classed('bg-gray-800 text-white p-4'))
    .with(children(
      create('div')
        .with(classed('container mx-auto text-center')),
        create('p')
          .with(classed('text-sm'))
          .with(children(text('© 2023 Xnova - All Rights Reserved')))
    ));

// Assemble the Welcome Page
const WelcomePage = () =>
  create('div')
    .with(classed('flex flex-col min-h-screen'))
    .with(children(
      createHeader(),
      createMainSection(),
      createFeaturesSection(),
      createFooter()
    ))
    .run();

// Rendering the Welcome Page
document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const welcomePageElement = await WelcomePage();
    render(welcomePageElement as any, rootElement);
  }
});
