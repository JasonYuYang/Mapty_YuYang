import workoutsView from './workoutsView';
import * as model from '../model';
class sortView {
  #sortSC = document.querySelector('.speed');
  #sortDuration = document.querySelector('.duration');
  #sortDistance = document.querySelector('.distance');
  #sortReset = document.querySelector('.reset');

  addHandlerSort = handler => {
    this.#sortSC.addEventListener('click', e => {
      handler(e);
    });
    this.#sortDuration.addEventListener('click', e => {
      handler(e);
    });
    this.#sortDistance.addEventListener('click', e => {
      handler(e);
    });
    this.#sortReset.addEventListener('click', e => {
      handler(e);
    });
  };
  addHandlerhamburger = handler => {
    document
      .querySelector('.sort__hamburger--button')
      .addEventListener('click', () => {
        document.querySelectorAll('.sort__section--item').forEach(item => {
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

  soerOptions = e => {};
  generateSortSectionMarkup = workouts => {
    const markup = `<div class="sort__section">
        <div class="sort__section sort__section--state">
          <span>Workout type : ${model.state.sortType}</span>
        </div>
        <div class="sort__section sort__section--number">
          <span>Number of workouts : ${workouts.length}</span>
        </div>
        <div class="sort__section sort__section--options">
          <ul class="sort__options">
            <li>Sort options : </li>
            <li class='speed'><a href="javascript:;">⚡ S/C</a></li>
            <li class='duration'><a href="javascript:;">⏱ Duration</a></li>
            <li class='distance'><a href="javascript:;">🚵‍♀️ Distance</a></li>
          </ul>
          <div class="sort__hamburger">
            <input
              type="checkbox"
              class="sort__hamburger--checkbox"
              id="sort-toggle"
            />
            <label for="sort-toggle" class="sort__hamburger--button">
              <span class="sort__hamburger--icon">&nbsp;</span>
            </label>
            <div class="sort__hamburger--background">&nbsp;</div>
            <nav class="sort__hamburger--nav sort__hamburger--nav-active">
              <ul class="sort__hamburger--list">
                <li class="sort__section--item sort_all">
                  <a href="javascript:;" class="sort__hamburger--link ">All types</a>
                </li>
                <li class="sort__section--item sort_running">
                  <a href="javascript:;" class="sort__hamburger--link "> 🏃‍♂️ Running</a>
                </li>
                <li class="sort__section--item sort_cycling">
                  <a href="javascript:;" class="sort__hamburger--link "> 🚴‍♀ Cycling</a>
                </li>
                <li class="sort__section--item sort_favorites">
                  <a href="javascript:;" class="sort__hamburger--link "> ⭐Favorites</a>
                </li>
              </ul>
            </nav>
          </div>
          <div class="sort__section__reset--button">
            <a href="javascript:;" class="reset">reset</a>
          </div>
        </div>
      </div>`;
    return markup;
  };
}
export default new sortView();
