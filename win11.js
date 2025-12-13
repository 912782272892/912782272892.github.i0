/* Windows 11 Emulator JS */

// NOTE: Replace with your own free API key from https://newsapi.org/
const NEWS_API_KEY = 'YOUR_API_KEY';

const windowsContainer = document.getElementById('windows-container');
const startMenu = document.getElementById('start-menu');
const taskbarCenter = document.getElementById('taskbar-center');
const clockEl = document.getElementById('clock');

let topZ = 10; // Track z-index for windows

function toggleStartMenu() {
  startMenu.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const withinStart = e.target.closest('#start-menu') || e.target.closest('#start-button');
  if (!withinStart) {
    startMenu.classList.add('hidden');
  }
});

function openApp(name) {
  // If already open, focus existing
  const existing = document.querySelector(`.window[data-app="${name}"]`);
  if (existing) {
    bringToFront(existing);
    return;
  }

  let windowEl = document.createElement('div');
  windowEl.className = 'window';
  windowEl.dataset.app = name;
  windowEl.style.left = '100px';
  windowEl.style.top = '60px';
  windowEl.style.zIndex = ++topZ;

  // Header
  let header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `<span class="title">${capitalize(name)}</span>`;
  let closeBtn = document.createElement('div');
  closeBtn.className = 'close-btn';
  header.appendChild(closeBtn);
  windowEl.appendChild(header);

  // Content
  let content = document.createElement('div');
  content.className = 'window-content';
  content.innerHTML = generateAppContent(name);
  windowEl.appendChild(content);

  windowsContainer.appendChild(windowEl);

  // Add to taskbar
  let thumb = document.createElement('div');
  thumb.className = 'taskbar-thumb';
  thumb.dataset.app = name;
  thumb.innerHTML = `<img src="https://img.icons8.com/fluency/24/000000/${getIconForCategory(name)}.png"/>`;
  thumb.onclick = () => {
    if (windowEl.style.display === 'none') {
      windowEl.style.display = 'flex';
    }
    bringToFront(windowEl);
  };
  taskbarCenter.appendChild(thumb);

  // Close logic
  closeBtn.onclick = () => {
    windowsContainer.removeChild(windowEl);
    taskbarCenter.removeChild(thumb);
  };

  // Dragging
  makeDraggable(windowEl, header);
}

async function fetchNews(category) {
  if (NEWS_API_KEY === 'YOUR_API_KEY') {
    console.log("Using mock news data. Please provide a valid API key for real news.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockNewsData[category]);
      }, 500);
    });
  }
  const API_URL = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error("Could not fetch news: ", error);
    return null;
  }
}

function generateAppContent(name) {
  fetchNews(name).then(articles => {
    const contentEl = document.querySelector(`.window[data-app="${name}"] .window-content`);
    if (articles) {
      let html = '<ul class="news-list">';
      articles.forEach(article => {
        html += `
          <li class="news-item">
            <a href="${article.url}" target="_blank" class="news-link">
              <h4 class="news-title">${article.title}</h4>
              <p class="news-description">${article.description || ''}</p>
            </a>
          </li>`;
      });
      html += '</ul>';
      contentEl.innerHTML = html;
    } else {
      contentEl.innerHTML = '<p>Could not load news. Please check your API key.</p>';
    }
  });
  return 'Loading news...';
}

function getIconForCategory(category) {
  switch (category) {
    case 'general': return 'news';
    case 'business': return 'business';
    case 'technology': return 'electronics';
    case 'entertainment': return 'movie-projector';
    default: return 'news';
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function bringToFront(win) {
  win.style.zIndex = ++topZ;
}

function makeDraggable(win, handle) {
  let offsetX = 0,
    offsetY = 0,
    isDown = false;
  handle.addEventListener('mousedown', (e) => {
    isDown = true;
    bringToFront(win);
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });
  document.addEventListener('mouseup', () => {
    isDown = false;
    document.body.style.userSelect = 'auto';
  });
}

/* Clock */
function updateClock() {
  const now = new Date();
  const hrs = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  clockEl.textContent = `${hrs}:${mins}`;
}
setInterval(updateClock, 1000);
updateClock();