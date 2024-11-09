import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books 


/**
 * BookList Web Component
 *
 * A custom element that populate the main page with books depending on the matches variable
 * Update show more button depending on number of books in /data.js file
 *
 * Usage:
 * To use this custom element , these tags should follow
 *
 * <book-list></book-list>
 *
 * @class BookList
 * @extends HTMLElement
 */

class BookList extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
    }


    /**
     * Render method to render books into custom element tag
     * @method render
     */
    render() {
      const template = document.createElement('template');
      template.innerHTML = /* html */ `
        <style>
          /* Custom styling for elements*/
        .book-list-container {
            display: grid;
            padding: 2rem 1rem;
            grid-template-columns: repeat(3,1fr);
            grid-column-gap: 0.5rem;
            grid-row-gap: 0.5rem;
            margin: 0 auto;
            width: 100%;
          }
  
       .preview {
            border-width: 0;
            width: 100%;
            font-family: Roboto, sans-serif;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            cursor: pointer;
            text-align: left;
            border-radius: 8px;
            border: 1px solid rgba(var(--color-dark), 0.15);
            background: rgba(var(--color-light), 1);
            }

        @media (min-width: 60rem) {
            .preview {
                padding: 1rem;
            }
            }

        .preview_hidden {
            display: none;
            }

        .preview:hover {
            background: rgba(var(--color-blue), 0.05);
            }

            .preview__image {
            width: 48px;
            height: 70px;
            object-fit: cover;
            background: grey;
            border-radius: 2px;
            box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
                0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
            }

        .preview__info {
            padding: 1rem;
            }

        .preview__title {
            margin: 0 0 0.5rem;
            font-weight: bold;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;  
            overflow: hidden;
            color: rgba(var(--color-dark), 0.8)
            }

        .preview__author {
            color: rgba(var(--color-dark), 0.4);
            }

        </style>
        <div class="book-list-container"></div>
      `;

  
      // Populate the book list as grid items
      this.shadowRoot.innerHTML = ''
      const bookListContainer = template.content.querySelector('.book-list-container');
      bookListContainer.innerHTML = '';
      
      for (const { author, id, image, title } of matches.slice(0, page * BOOKS_PER_PAGE)) {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', id);
  
        element.innerHTML = `
          <img class="preview__image" src="${image}" alt="Book cover of ${title}" />
          <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div> 
          </div>
        `;
        
        bookListContainer.appendChild(element);
      }
  
      this.shadowRoot.appendChild(template.content);
      this.updateShowMoreButton();
    }
  
    /**
     * Updates the show more buttton count depending on BOOKS_PER_PAGE and mathces variable
     * @method updateShowMoreButton
     */
    updateShowMoreButton() {
      const remaining = matches.length - (page * BOOKS_PER_PAGE);
      const showMoreButton = document.querySelector('[data-list-button]');
      if (showMoreButton) {
        showMoreButton.disabled = remaining < 1;
        showMoreButton.innerHTML = `
          <span>Show more</span>
          <span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>
        `;
      }
      toggleOverlay('search', false);
    }
  }
  
  /**
   * 
   * Definig the custom element to be used in the hmtl document
   * 
   */
  customElements.define('book-list', BookList);
  
// --- --- ---



/**
 * Creates a dropdown list for the user to select a specific type of category
 * @param {object} category - Object that has a ID as a key and a values are names of whatever category is specified
 * @param {string} selector - Selector is a string that determines what data-attribute should be retrieved by the DOM
 * @param {string} placeholder - String that is the placeholder, or default text that is show in the dropdown menu
 */

function populateDropdown(category, selector, placeholder) {
    const categoryHtml = document.createDocumentFragment()
    const firstElement = document.createElement('option')
    firstElement.value = 'any'
    firstElement.innerText = placeholder
    categoryHtml.appendChild(firstElement)

    for (const [id, name] of Object.entries(category)) {
        const element = document.createElement('option')
        element.value = id
        element.innerText = name
        categoryHtml.appendChild(element)
    }

    document.querySelector(`[data-search-${selector}]`).appendChild(categoryHtml)
}



// Calling the populateDropdown() function to populate genres and authors category

populateDropdown(genres,'genres','All Genres')
populateDropdown(authors, 'authors', 'All Authors')

// --- --- ---



// Renders authors from data.js into settings options

const authorsHtml = document.createDocumentFragment()
const firstAuthorElement = document.createElement('option')
firstAuthorElement.value = 'any'
firstAuthorElement.innerText = 'All Authors'
authorsHtml.appendChild(firstAuthorElement)

for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    authorsHtml.appendChild(element)
}

document.querySelector('[data-search-authors]').appendChild(authorsHtml)

// --- --- ---



// Day and Night settings using Chrome Settings

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}

// --- --- ---



// Show more books at bottom of the page (1)

document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

// --- --- ---



/**
 * @function - Function created to toggle visibility of a specified overlay
 * @param {string} overlay - The type of overlay that should be toggled
 * @param {boolean} show - Whether the overlay should be shown or not
 */

function toggleOverlay(overlay,show) {
    document.querySelector(`[data-${overlay}-overlay]`).open = show
}

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    toggleOverlay('search', false)
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    toggleOverlay('settings', false)
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    toggleOverlay('search', true)
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    toggleOverlay('settings', true)
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

// ---- --- --- 



// Day and Night using LOCAL user interaction

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector('[data-settings-overlay]').open = false
})

// --- --- ---




// Search book settings

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result // Updates from 'any' to that specific genre


    // If no books match filter the message will displays
    const dataListMessage = document.querySelector('[data-list-message]')
    dataListMessage.classList.toggle('list__message_show', matches < 1)

    const bookListElement = document.querySelector('book-list');
    if (bookListElement) {
        bookListElement.render(); // Calls render to refresh the list
    }
 
    // Add the result of books to the html
    window.scrollTo({top: 0, behavior: 'smooth'});
})

// --- --- ---



// Show more button that shows more books if clicked

document.querySelector('[data-list-button]').addEventListener('click', () => {
    page +=1

    const bookListElement = document.querySelector('book-list'); // This assumes the <book-list> element is present
    if (bookListElement) {
        bookListElement.render(); // Calls the render method of the BookList component
    }
    
})

// --- ---- ---




// Assigns acitve data-attribute to book element

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    // Overlay/Modal opens if a book element is clicked
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})

// --- --- ---