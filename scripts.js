import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books 


/**
 * Renders a list of books in the main UI based on current matches
 * A button is created for each book element that is rendered so an overlay can be opened once it is clicked
 * 'Show More' button is rendered at the bottom of the list of books as well as a number on the remaining books.
 * @function
 * @returns {void} Function does not return a specific value
 */

function renderBooks() {
    const dataList = document.querySelector('[data-list-items]')
    dataList.innerHTML = ''

    const items = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(0, page * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div> 
            </div>
        `
    
        items.appendChild(element)
    }

    dataList.appendChild(items)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`
    toggleOverlay('search', false)
}


// Calling the renderBooks function to display all books in beginning

renderBooks()

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
 
    // Add the result of books to the html
    renderBooks()
    window.scrollTo({top: 0, behavior: 'smooth'});
})

// --- --- ---



// Show more button that shows more books if clicked

document.querySelector('[data-list-button]').addEventListener('click', () => {
    page +=1
    renderBooks()
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