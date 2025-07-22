/* Windows 11 Emulator JS */

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
  thumb.innerHTML = `<img src="https://img.icons8.com/fluency/24/000000/notepad.png"/>`;
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

function generateAppContent(name) {
  switch (name) {
    case 'notepad':
      return `<textarea style="width:100%;height:100%;border:none;resize:none;outline:none;background:transparent;color:#000;font-family:'Consolas','Courier New',monospace;"></textarea>`;
    default:
      return `<p>Hello from ${name}</p>`;
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