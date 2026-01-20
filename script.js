const output = document.getElementById('output');
const input = document.getElementById('command');
const blip = document.getElementById('blip');
const boot = document.getElementById('boot');
const enterSound = document.getElementById('enterSound');
const errorSound = document.getElementById('errorSound');
let theme = 'cyan';
let chapters = [];
let currentChapter = 0;

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function printLine(text, delay = 20) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      output.innerHTML += text[i];
      playSound(blip);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        output.innerHTML += '\n';
        resolve();
      }
    }, delay);
  });
}

async function bootSequence() {
  await printLine('“Истина не живёт в свете.');
  await printLine('Она рождается во тьме.”\n');
  playSound(boot);
  await printLine('> boot lunar_protocol_v2.1');
  await printLine('> verifying core memory...');
  await printLine('> user_id: NIKITA_SEMIN');
  await printLine('> initializing cyan interface...');
  await printLine('> complete.');
  await printLine('> terminal online █\n');
  output.innerHTML += '> enter command:\n';
}

async function executeCommand(cmd) {
  const args = cmd.trim().split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case 'help':
      output.innerHTML += 'Commands: READ [n], NEXT, ABOUT, THEME LIST, THEME [n], SWITCH_MODE, REBOOT, CLEAR, HELP\n';
      break;
    case 'clear':
      output.innerHTML = '';
      break;
    case 'about':
      await printLine('Author: Nikita Semin');
      await printLine('Frontend Developer & Creator');
      await printLine('Portfolio: nikita-semin.github.io/Portfolio');
      break;
    case 'read':
      if (!args[1]) { output.innerHTML += 'Usage: READ [chapter number]\n'; break; }
      loadChapter(parseInt(args[1]));
      break;
    case 'next':
      loadChapter(currentChapter + 1);
      break;
    case 'switch_mode':
      document.body.classList.toggle('light-mode');
      break;
    case 'theme':
      if (args[1] === 'list') {
        output.innerHTML += '1: Green\n2: Amber\n3: Cyan (default)\n';
      } else {
        setTheme(args[1]);
      }
      break;
    case 'reboot':
      output.innerHTML = '';
      bootSequence();
      break;
    default:
      output.innerHTML += 'error: unknown command\n';
      playSound(errorSound);
  }
}

function setTheme(index) {
  document.body.classList.remove('green-theme', 'amber-theme', 'cyan-theme');
  switch (index) {
    case '1': document.body.classList.add('green-theme'); theme = 'green'; break;
    case '2': document.body.classList.add('amber-theme'); theme = 'amber'; break;
    case '3': default: document.body.classList.add('cyan-theme'); theme = 'cyan'; break;
  }
  output.innerHTML += '> theme set to ' + theme + '\n';
}

function loadChapter(index) {
  if (index <= 0 || index > chapters.length) {
    output.innerHTML += 'error: invalid chapter index\n';
    playSound(errorSound);
    return;
  }
  currentChapter = index;
  fetch('chapters/' + chapters[index - 1].file)
    .then(r => r.text())
    .then(async text => {
      output.innerHTML = '';
      await printLine('> loading ' + chapters[index - 1].title + '...');
      await new Promise(r => setTimeout(r, 500));
      output.innerHTML += text;
    });
}

fetch('chapters/manifest.json')
  .then(r => r.json())
  .then(data => { chapters = data; bootSequence(); });

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    playSound(enterSound);
    const cmd = input.value;
    input.value = '';
    output.innerHTML += '> ' + cmd + '\n';
    executeCommand(cmd);
  }
});
