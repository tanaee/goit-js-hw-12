import 'izitoast/dist/css/iziToast.min.css';
import iziToast from 'izitoast';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const input = form.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalPages = 0;

form.addEventListener('submit', async event => {
  event.preventDefault();
  query = input.value.trim();
  page = 1;
  clearGallery();
  hideLoadMoreButton();

  if (!query) {
    iziToast.warning({ message: 'Please enter a search term.' });
    return;
  }

  await fetchImages();
});

loadMoreBtn.addEventListener('click', async () => {
  page++;
  await fetchImages();
});

async function fetchImages() {
  showLoader();
  try {
    const data = await getImagesByQuery(query, page);
    const { hits, totalHits } = data;

    if (hits.length === 0 && page === 1) {
      iziToast.error({
        message: 'No images found. Please try another search.',
      });
      return;
    }

    createGallery(hits);

    totalPages = Math.ceil(totalHits / 15);

    if (page < totalPages) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }

    if (page > 1) {
      smoothScroll();
    }
  } catch (error) {
    iziToast.error({ message: 'Something went wrong. Try again later.' });
    console.error(error);
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const cardHeight = document
    .querySelector('.gallery-item')
    .getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
