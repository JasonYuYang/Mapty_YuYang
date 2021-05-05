class formView {
  #form = document.querySelector('.form');

  addHandlerForm(handler) {
    this.#form.addEventListener('submit', function (e) {
      e.preventDefault();
      this.#form.classList.add('hidden');
      handler();
    });
  }
}
export default new formView();
