import { timeout } from '../helper';
import mapView from './mapView';
import * as model from '../model';

class formView {
  _form = document.getElementById('form');
  _duration = document.querySelector('.form__input--duration');
  _inputElevation = document.querySelector('.form__input--elevation');
  _inputCadence = document.querySelector('.form__input--cadence');
  _inputType = document.querySelector('.form__input--type');
  _selection = document.querySelector('.form__input--cadence');

  addHandlerForm = (handler1, handler2) => {
    this._inputType.addEventListener('change', () => {
      this.toggleElevationField();
      this.formValidation();
    });
    this._form.addEventListener('submit', async e => {
      try {
        let handler = model.state.edit ? handler2 : handler1;
        e.preventDefault();
        if (this.formValidation()) {
          this._form.classList.add('hidden');
          await Promise.race([handler(), timeout(10)]);
          this._form.reset();
          this._inputElevation
            .closest('.form__row')
            .classList.add('form__row--hidden');
          this._inputCadence
            .closest('.form__row')
            .classList.remove('form__row--hidden');
          model.state.edit = false;
        }
      } catch (err) {
        mapView.renderError(err);
      }
    });
  };

  formValidation = () => {
    let checkDuration;
    let checkSelection;
    this._selection =
      this._inputType.value == 'running'
        ? this._inputCadence
        : this._inputElevation;
    if (this.checkRequired(this._duration)) {
      checkDuration = this.checkInput(this._duration);
    }

    if (this.checkRequired(this._selection)) {
      checkSelection = this.checkInput(this._selection);
    }
    return checkDuration && checkSelection;
  };
  // Show input error message
  showError = (input, message) => {
    let id =
      input.id == 'elevation' || input.id == 'cadence' ? 'cad_ele' : input.id;
    const errorEl = document.querySelector(`.error__message--${id}`);
    errorEl.classList.add('error');
    errorEl.innerText = message;
  };
  removeError = input => {
    let id =
      input.id == 'elevation' || input.id == 'cadence' ? 'cad_ele' : input.id;
    const errorEl = document.querySelector(`.error__message--${id}`);
    errorEl.classList.remove('error');
  };
  // Check required fields
  checkRequired = input => {
    let isRequired = false;
    if (input.value.trim() === '') {
      this.showError(input, `${this.getFieldName(input)}  is  required !!`);
    } else {
      this.removeError(input);
      isRequired = true;
    }
    return isRequired;
  };
  //Check valid number input
  checkInput(input) {
    const regex = '^[1-9][0-9]*$';
    const InputValid = new RegExp(regex, 'g');
    if (!InputValid.test(`${input.value}`)) {
      this.showError(
        input,
        `${this.getFieldName(
          input
        )} must be Positive Number and not start with 0  !!`
      );
      return false;
    } else {
      this.removeError(input);
      return true;
    }
  }
  // Get fieldname
  getFieldName = input => {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1);
  };
  toggleElevationField = () => {
    this._inputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    this._inputCadence
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
  };
  getInputvalue = () => {
    const inputValue = {};
    inputValue[this._selection.id] = this._selection.value;
    inputValue[this._duration.id] = this._duration.value;
    inputValue.type = this._inputType.value;
    return inputValue;
  };
}
export default new formView();
