import 'core-js/stable';
import 'regenerator-runtime/runtime';
import img from 'url:../../img/icon.png';
import icons from 'url:../../img/sprite.svg';

export default class View {
  _textEl = document.querySelector('.error__text');
  _windowEl = document.querySelector('.error__window');
  _overlayEl = document.querySelector('.overlay');
  _errorBtn = document.querySelector('.error__btn');
  _containerWorkouts = document.querySelector('.workouts');

  updateWorkout(markup) {
    const newDOM = document.createRange().createContextualFragment(markup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(
      this._containerWorkouts.querySelectorAll('*')
    ).slice(29);
    // console.log(this._containerWorkouts.querySelectorAll('*'));
    newElements.forEach((newEl, i) => {
      let curEl = curElements[i];
      console.log(curEl, newEl.isEqualNode(curEl));
      if (!newEl.isEqualNode(curEl)) {
        curEl.outerHTML = newEl.outerHTML;
      }
    });
  }
  updateSortSection = markup => {
    const sortSection = document.querySelector('.sort__section');
    const newDOM = document.createRange().createContextualFragment(markup);
    const newElements = Array.from(newDOM.querySelectorAll('*')).slice(1);
    const curElements = Array.from(sortSection.querySelectorAll('*'));
    // console.log(newElements);
    // console.log(curElements);

    newElements.forEach((newEl, i) => {
      let curEl = curElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl));
      // Updates changed TEXt
      if (!newEl.isEqualNode(curEl)) {
        // console.log(curEl.outerHTML);
        // console.log(newEl.outerHTML);
        curEl.outerHTML = newEl.outerHTML;
      }
    });
  };
  renderLoadingSpinner(parentElement) {
    const markup = `
      <div class='spinner'>
        <img class="spinner__Icon" src=${img}>
        <p class="spinner__text">Map your workout
      </p>
      </div>
    `;
    this._clear(parentElement);
    parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  renderSpinner(parentElement) {
    const markup = `
      <svg class="icon-spinner8">
        <use xlink:href="${icons}#icon-spinner8"></use>
      </svg>`;
    parentElement.insertAdjacentHTML('afterend', markup);
  }
  renderError(errMsg) {
    this._textEl.innerHTML = errMsg;
    this._addHandlerHideWindow();
    this._toggleWindow();
  }

  _toggleWindow() {
    this._windowEl.classList.toggle('hidden');
    this._overlayEl.classList.toggle('hidden');
  }

  _addHandlerHideWindow() {
    this._errorBtn.addEventListener('click', this._toggleWindow.bind(this));
    this._overlayEl.addEventListener('click', this._toggleWindow.bind(this));
  }
  _clear(parentElement) {
    parentElement.innerHTML = '';
  }
  removeSpinner() {
    const spinnerLoading = document.querySelector('.spinner');
    const spinner = document.querySelector('.icon-spinner8');
    if (spinnerLoading) {
      spinnerLoading.remove();
    }
    if (spinner) {
      spinner.remove();
    }
  }
}
