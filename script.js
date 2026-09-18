const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 18);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu?.classList.toggle('open', open);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('open');
  });
});

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' });
  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('visible'));
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Self-contained product tour. Its examples and interactions stay in this page.
const appDemo = document.querySelector('[data-app-demo]');
if (appDemo) {
  const tabs = [...appDemo.querySelectorAll('[data-app-tab]')];
  const descriptions = [...appDemo.querySelectorAll('[data-app-description]')];
  const screens = [...appDemo.querySelectorAll('.phone-screen')];
  const viewport = appDemo.querySelector('.phone-viewport');
  const detailControls = [...appDemo.querySelectorAll('[data-detail-toggle]')].map(toggle => ({
    toggle,
    detail: appDemo.querySelector(`#${toggle.getAttribute('aria-controls')}`)
  }));
  let currentScreen = 0;
  let openDetail = null;
  const showDetail = (entry = null, restoreFocus = false) => {
    screens[0].hidden = Boolean(entry);
    detailControls.forEach(({ toggle, detail }) => {
      detail.hidden = entry?.detail !== detail;
      toggle.setAttribute('aria-expanded', String(entry?.toggle === toggle));
    });
    viewport.scrollTop = 0;
    if (entry) entry.detail.focus({ preventScroll: true });
    else if (restoreFocus) openDetail?.toggle.focus({ preventScroll: true });
    openDetail = entry;
  };
  const selectScreen = (index, focusTab = false) => {
    showDetail();
    currentScreen = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const selected = i === currentScreen;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      screens[i].hidden = !selected;
      descriptions[i].hidden = !selected;
    });
    appDemo.querySelector('[data-tour-progress]').textContent = `${String(currentScreen + 1).padStart(2, '0')} / 04`;
    viewport.scrollTop = 0;
    if (focusTab) tabs[currentScreen].focus({ preventScroll: true });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectScreen(i));
    tab.addEventListener('keydown', (event) => {
      const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      selectScreen(moves[event.key], true);
    });
  });
  appDemo.querySelector('[data-tour-prev]').addEventListener('click', () => selectScreen(currentScreen - 1));
  appDemo.querySelector('[data-tour-next]').addEventListener('click', () => selectScreen(currentScreen + 1));

  detailControls.forEach(entry => {
    entry.toggle.addEventListener('click', () => showDetail(entry));
    entry.detail.querySelector('[data-detail-back]').addEventListener('click', () => showDetail(null, true));
  });

  const tasks = [...appDemo.querySelectorAll('[data-demo-task]')];
  const updateTasks = () => {
    const done = tasks.filter(task => task.checked).length;
    appDemo.querySelector('[data-task-count]').textContent = done === 0 ? '3 дела из разговоров' : done === tasks.length ? 'Все дела выполнены' : `Выполнено ${done} из 3`;
  };
  tasks.forEach(task => task.addEventListener('change', updateTasks));

  const answers = {
    promises: { question: 'Что я обещал Марине из «Севера»?', answer: 'После встречи вы обещали отправить Марине короткий итог. До пятницы, 18 сентября, — два варианта предложения с ценой, этапами и сроками. Марина пришлёт список задач и примеры до четверга, 17 сентября.', source: 'Встреча с Мариной · 15 сентября, 13:15' },
    meeting: { question: 'О чём договорились с Олегом из «Атласа»?', answer: 'Вы пришлёте Олегу обновлённую смету и график запуска до среды, 16 сентября. Он сверит их с командой и вернётся с ответом в пятницу, 18 сентября. До этого условия сделки не меняются.', source: 'Созвон с Олегом из «Атласа» · 15 сентября, 10:20' }
  };
  const chooseQuestion = (key) => {
    const item = answers[key];
    appDemo.querySelectorAll('[data-question]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.question === key)));
    const thread = appDemo.querySelector('.phone-chat-thread');
    thread.hidden = !item;
    appDemo.querySelector('#phone-chat').classList.toggle('has-answer', Boolean(item));
    if (!item) return;
    appDemo.querySelector('[data-chat-question]').textContent = item.question;
    appDemo.querySelector('[data-chat-answer]').textContent = item.answer;
    appDemo.querySelector('[data-chat-source]').textContent = item.source;
  };
  appDemo.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => chooseQuestion(button.dataset.question)));

  const stories = {
    '12': { label: '12 сентября · Суббота', title: 'У озера', text: [
      'Саша встретил вас у машины с бумажным пакетом горячих булочек. По дороге к озеру он трижды включал одну и ту же песню, и к последнему повороту все уже подпевали.',
      'На берегу долго выбирали место для пикника, а потом устроились прямо у старой сосны. Нина забыла кружки, поэтому чай пили по очереди из двух термосных крышек. Никто не расстроился — это стало главной шуткой дня.',
      'Перед отъездом договорились вернуться в октябре, пока не стало совсем холодно. На обратном пути Саша снова включил ту песню, и на этот раз никто не попросил переключить.'
    ], quote: '«В октябре кружки беру я».' },
    '15': { label: '15 сентября · Вторник', title: 'Шарлотка и старые фотографии', text: [
      'После работы вы заехали к сестре Лене всего на полчаса. На кухне пахло шарлоткой, а племянник упорно запускал самолёт из тетрадного листа — тот каждый раз падал под стол.',
      'Пока заваривался чай, Лена достала коробку старых фотографий. На одной вы оба стоите у моря в одинаковых красных кепках. Посмеялись и решили в субботу наконец выбраться к реке.',
      'Уже в метро Лена прислала фото и короткое сообщение: «В субботу без отговорок». Вы ответили: «Договорились» — и до самой станции разглядывали старый снимок.'
    ], quote: '«В субботу без отговорок».' }
  };
  const chooseStory = (date) => {
    const item = stories[date];
    if (!item) return;
    appDemo.querySelectorAll('[data-story-date]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.storyDate === date)));
    for (const [key, value] of Object.entries(item)) {
      const target = appDemo.querySelector(`[data-story-${key}]`);
      if (key === 'text') target.replaceChildren(...value.map(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        return p;
      }));
      else target.textContent = value;
    }
  };
  appDemo.querySelectorAll('[data-story-date]').forEach(button => button.addEventListener('click', () => chooseStory(button.dataset.storyDate)));
  appDemo.querySelector('[data-tour-reset]').addEventListener('click', () => {
    tasks.forEach(task => { task.checked = false; });
    updateTasks();
    setMeeting(false);
    chooseQuestion(null);
    chooseStory('15');
    selectScreen(0);
  });
}

const configurator = document.querySelector('[data-configurator]');
if (configurator) {
  const asset = (name) => `assets/configurator/${name}.webp`;
  const covers = {
    dark: { name: 'Тёмное', fullName: 'тёмное дерево', image: asset('cover-dark') },
    medium: { name: 'Тёплое', fullName: 'тёплое дерево', image: asset('cover-medium') },
    light: { name: 'Светлое', fullName: 'светлое дерево', image: asset('cover-light') },
    aqua: { name: 'Голубой', fullName: 'голубой пластик', image: asset('base-aqua') },
    lilac: { name: 'Сиреневый', fullName: 'сиреневый пластик', image: asset('cover-lilac') },
    mint: { name: 'Мятный', fullName: 'мятный пластик', image: asset('cover-mint') },
    peach: { name: 'Персиковый', fullName: 'персиковый пластик', image: asset('cover-peach') },
    rose: { name: 'Розовый', fullName: 'розовый пластик', image: asset('cover-rose') }
  };
  const cords = {
    black: { name: 'Чёрный текстиль', image: asset('cord-black') },
    graphite: { name: 'Графитовый текстиль', image: asset('cord-graphite') },
    cognac: { name: 'Рыжая кожа', image: asset('cord-cognac') },
    braided: { name: 'Плетёная чёрная кожа', image: asset('cord-braided') },
    chocolate: { name: 'Плоская шоколадная кожа', image: asset('cord-chocolate') },
    aqua: { name: 'Голубой шнурок', image: asset('base-aqua') },
    lilac: { name: 'Сиреневый шнурок', image: asset('cord-lilac') },
    mint: { name: 'Мятный шнурок', image: asset('cord-mint') },
    peach: { name: 'Персиковый шнурок', image: asset('cord-peach') },
    rose: { name: 'Розовый шнурок', image: asset('cord-rose') }
  };
  const cordPhoto = configurator.querySelector('[data-config-cord]');
  const coverPhoto = configurator.querySelector('[data-config-cover]');
  const photo = configurator.querySelector('[data-config-photo]');
  let selectedCover = 'aqua';
  let selectedCord = 'black';
  const showSelection = () => {
    configurator.querySelector('[data-config-cover-name]').textContent = covers[selectedCover].name;
    configurator.querySelector('[data-config-cord-name]').textContent = cords[selectedCord].name;
    photo.setAttribute('aria-label', `Примерка кулона: ${covers[selectedCover].fullName} и ${cords[selectedCord].name.toLowerCase()}`);
  };
  const loadPhoto = (url, apply) => {
    const next = new Image();
    next.onload = () => apply();
    next.src = url;
    if (next.complete && next.naturalWidth) apply();
  };
  const selectCover = (id) => {
    if (!covers[id]) return;
    selectedCover = id;
    configurator.querySelectorAll('[data-config-cover-option]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.configCoverOption === id)));
    loadPhoto(covers[id].image, () => { if (selectedCover === id) coverPhoto.setAttribute('href', covers[id].image); });
    showSelection();
  };
  configurator.querySelectorAll('[data-config-cover-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.configCoverOption;
      if (!covers[id] || id === selectedCover) return;
      selectCover(id);
    });
  });
  configurator.querySelectorAll('[data-config-cord-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.configCordOption;
      if (!cords[id] || id === selectedCord) return;
      selectedCord = id;
      configurator.querySelectorAll('[data-config-cord-option]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      loadPhoto(cords[id].image, () => { if (selectedCord === id) cordPhoto.src = cords[id].image; });
      showSelection();
    });
  });
  const preload = () => {
    new Set([...Object.values(covers), ...Object.values(cords)].map((choice) => choice.image)).forEach((url) => { const image = new Image(); image.src = url; });
  };
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      preload();
      loader.disconnect();
    }, { rootMargin: '400px' });
    loader.observe(configurator);
  } else {
    preload();
  }
}
