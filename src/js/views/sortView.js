import * as model from '../model';
class sortView {
  addHandlerSort = handler => {
    const sortSC = document.querySelector('.SC');
    const sortDuration = document.querySelector('.duration');
    const sortDistance = document.querySelector('.distance');
    const sortReset = document.querySelector('.reset');

    sortSC.addEventListener('click', e => {
      handler(e);
    });
    sortDuration.addEventListener('click', e => {
      handler(e);
    });
    sortDistance.addEventListener('click', e => {
      handler(e);
    });
    sortReset.addEventListener('click', e => {
      handler(e);
    });
  };
  addHandlerhamburger = handler => {
    const sortHamburger = document.querySelector('.sort__hamburger--button');
    const sortList = document.querySelectorAll('.sort__section--item');
    sortHamburger.addEventListener('click', () => {
      sortList.forEach(item => {
        item.addEventListener('click', e => {
          handler(e);
        });
      });
    });
  };

  sortState = e => {
    const typeAll = e.target.closest('.sort_all');
    const typeRunning = e.target.closest('.sort_running');
    const typeCycling = e.target.closest('.sort_cycling');
    const typeFavorites = e.target.closest('.sort_favorites');
    e.preventDefault();
    if (typeAll) model.state.sortType = ' All';
    if (typeRunning) model.state.sortType = '🏃‍♂️ Running';
    if (typeCycling) model.state.sortType = '🚴‍♀️ Cycling';
    if (typeFavorites) model.state.sortType = '⭐ Favorites';

    document.querySelector('#sort-toggle').checked = false;
  };
  removeSelected = () => {
    const sortOptions = document.querySelector('.sort__options');
    let aTags = Array.from(sortOptions.getElementsByTagName('a'));
    aTags.forEach(a => {
      a.classList.remove('selected');
    });
  };
  generateSortSectionMarkup = workouts => {
    const markup = `<div class="sort__section">
        <div class="sort__section sort__section--state">
          <span>Workout type : ${model.state.sortType}</span>
        </div>
        <div class="sort__section sort__section--number">
          <span>Number of workouts : <span class='workout__number'>${workouts.length}</span></span>
        </div>
        
      </div>`;
    return markup;
  };
}
export default new sortView();
