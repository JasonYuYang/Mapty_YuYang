class formView {
  #form = document.getElementById('form');
  #duration = document.querySelector('.form__input--duration');
  #selection = document
    .querySelector('.form__input--cadence')
    .closest('.form__row')
    .classList.contains('form__row--hidden')
    ? document.querySelector('.form__input--elevation')
    : document.querySelector('.form__input--cadence');

  addHandlerForm(handler) {
    window.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.formValidation()) {
          this.#form.classList.add('hidden');
          handler();
          this.#form.reset();
        }
      }
    });
  }

  formValidation = () => {
    if (
      this.checkRequired(this.#duration)
        ? this.checkRequired(this.#selection)
        : this.checkRequired(this.#selection) && false
    ) {
      return this.checkInput(this.#duration)
        ? this.checkInput(this.#selection)
        : this.checkInput(this.#selection) && false;
    }
  };
  // Show input error message
  showError = (input, message) => {
    let id =
      input.id == 'elevation' || input.id == 'cadence' ? 'cad_ele' : input.id;
    const errorEl = document.querySelector(`.error__message--${id}`);
    errorEl.classList.add('error');
    errorEl.innerText = message;
  };

  // Check required fields
  checkRequired = input => {
    let isRequired = false;
    if (input.value.trim() === '') {
      this.showError(input, `${this.getFieldName(input)}  is  required !!`);
    } else {
      isRequired = true;
    }
    return isRequired;
  };
  //Check valid number input
  checkInput(input) {
    const regex = `\\d`;
    const InputValid = new RegExp(regex, 'g');
    if (!InputValid.test(`${input.value}`)) {
      this.showError(
        input,
        `${this.getFieldName(input)} must  be  Positive  Number !!`
      );
      return false;
    } else {
      return true;
    }
  }
  // Get fieldname
  getFieldName = input => {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1);
  };
}
export default new formView();
