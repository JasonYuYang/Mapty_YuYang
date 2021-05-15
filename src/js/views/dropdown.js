class dropdown {
  #containerWorkouts = document.querySelector('.workouts');
  #parentElemet = document.querySelector('.sidebar');
  addHandlerShowDropdown = handler => {
    this.#containerWorkouts.addEventListener('click', e => {
      handler(e);
    });
  };
  addHandlerHideDropdown = handler => {
    this.#parentElemet.addEventListener('click', e => {
      handler(e);
    });
  };
  addHandlerControlDropdown = handler => {
    this.#parentElemet.addEventListener('click', e => {
      const dropdownItem = e.target.closest('.dropdown__items');
      handler(e, dropdownItem);
    });
  };
  showDropdown = e => {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    if (
      e.target.classList.contains('workout__icon--expand') ||
      e.target.parentNode.classList.contains('workout__icon--expand')
    ) {
      //Hide dropdown from previous workout card
      this.hideDropdown();
      const dropdown = workoutEl.querySelector('.dropdown');
      dropdown.classList.remove('hidden');
      const editItem = dropdown.querySelector('.edit');
      const deleteItem = dropdown.querySelector('.delete');
    }
  };
  hideDropdown = () => {
    const dropdownElements =
      this.#containerWorkouts.querySelectorAll('.dropdown');
    if (!dropdownElements) return;
    dropdownElements.forEach(d => {
      if (d.classList.contains('hidden')) return;
      d.classList.add('hidden');
    });
  };
  hideDropdownClickOutside = e => {
    const dropdown = Array.from(
      this.#parentElemet.querySelectorAll('.dropdown')
    );
    // prettier-ignore
    const isHidden = dropdown.every((d) => d.classList.contains('hidden'))
    if (
      e.target.classList.contains('workout__icon--expand') ||
      e.target.parentNode.classList.contains('workout__icon--expand') ||
      e.target.closest('.dropdown__items') !== null ||
      isHidden
    )
      return;
    this.hideDropdown();
  };
}
export default new dropdown();
