import 'core-js/stable';
import 'regenerator-runtime/runtime';

export default class View {
  _textEl = document.querySelector('.error__text');
  _windowEl = document.querySelector('.error__window');
  _overlayEl = document.querySelector('.overlay');
  _errorBtn = document.querySelector('.error__btn');

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
}
