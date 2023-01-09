  const search = document.querySelector('.search');
  const resultsContainer = document.querySelector('.results');
  const repoContainer = document.querySelector('.repo');
  const found = document.querySelector('.found');
  const repoDeb = debounce(getRepo, 150);
  const eventListeners = new Map();

  search.addEventListener('input', async () => {
    removeCards();
    if (search.value)
      await repoDeb(search.value)
        .then((res) => {
          found.textContent = `${res.length != 0 ? res.length : 'Репозиторий не найден'}`;
          for (rep of res) {
            let card = createCard(rep.name);
            let { owner, name, stargazers_count: stars } = rep;
            let listener = function () {
              createRepo(name, owner.login, stars);
              search.value = '';
              removeCards();
              found.textContent = '';
            };
            card.addEventListener('click', listener);
            eventListeners.set(card, listener);
          }
        })
  });

  async function getRepo(name) {
    let repo = await fetch(`https://api.github.com/search/repositories?q=${name}&per_page=5`);
    let response = await repo.json();
    return response['items'];
  }

  //КАРТОЧКИ
  function createCard(text) {
    let card = document.createElement('div');
    card.textContent = text;
    card.classList.add('results__item');
    resultsContainer.appendChild(card);
    return card;
  }

  function removeCards() {
    let cards = document.querySelectorAll('.results__item');
    for (let card of cards) {
      card.remove();
      for (lstnr of eventListeners) {
        lstnr[0].removeEventListener('click', lstnr[1]);
      }
      eventListeners.clear();
    }
  }

  function createRepo(name, owner, stars) {
    let rep = document.createDocumentFragment();
    let repItem = document.createElement('div');
    let button = document.createElement('button');
    let data = document.createElement('div');
    data.textContent = `Name: ${name}
    Owner: ${owner}
    Stars: ${stars}`;

    repItem.classList.add('item');
    data.classList.add('data');
    button.classList.add('button');
    button.addEventListener('click', function () {
      button.removeEventListener('click', arguments.callee);
      repItem.remove();
    });
    repItem.append(data, button);
    rep.append(repItem);

    repoContainer.appendChild(rep);
  }

  function debounce(f, interval) {
    let timer = null;

    return (...args) => {
      clearTimeout(timer);
      return new Promise((resolve) => {
        timer = setTimeout(() => resolve(f(...args)), interval);
      });
    };
  }
