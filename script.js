const chords = [
  ["c", "C"],
  ["c7", "C7"],
  ["c-minor", "Cm"],
  ["c-minor7", "Cm7"],
  ["c-major7", "CM7"],
  ["d", "D"],
  ["d7", "D7"],
  ["d-minor", "Dm"],
  ["d-minor7", "Dm7"],
  ["d-major7", "DM7"],
  ["e", "E"],
  ["e7", "E7"],
  ["e-minor", "Em"],
  ["e-minor7", "Em7"],
  ["e-major7", "EM7"],
  ["f", "F"],
  ["f7", "F7"],
  ["f-minor", "Fm"],
  ["f-minor7", "Fm7"],
  ["f-major7", "FM7"],
  ["g", "G"],
  ["g7", "G7"],
  ["g-minor", "Gm"],
  ["g-minor7", "Gm7"],
  ["g-major7", "GM7"],
  ["a", "A"],
  ["a7", "A7"],
  ["a-minor", "Am"],
  ["a-minor7", "Am7"],
  ["a-major7", "AM7"],
  ["b", "B"],
  ["b7", "B7"],
  ["b-minor", "Bm"],
  ["b-minor7", "Bm7"],
  ["b-major7", "BM7"],
];

const storageKey = "guitarChordSets";
const menuButton = document.querySelector("[data-menu-button]");
const menuPanel = document.querySelector("[data-menu-panel], .menu-panel");
const menuBackdrop = document.querySelector("[data-menu-backdrop]");
const closeMenuButton = document.querySelector("[data-close-menu]");
const screenButtons = document.querySelectorAll("[data-screen-target]");
const screens = document.querySelectorAll("[data-screen]");
const openSetModalButton = document.querySelector("[data-open-set-modal]");
const closeSetModalButton = document.querySelector("[data-close-set-modal]");
const setModal = document.querySelector(".set-modal");
const modalBackdrop = document.querySelector("[data-modal-backdrop]");
const viewModal = document.querySelector(".view-modal");
const viewBackdrop = document.querySelector("[data-view-backdrop]");
const closeViewModalButton = document.querySelector("[data-close-view-modal]");
const viewTitle = document.querySelector("[data-view-title]");
const viewGrid = document.querySelector("[data-view-grid]");
const chordPicker = document.querySelector("[data-chord-picker]");
const selectedSlots = document.querySelector("[data-selected-slots]");
const selectedCount = document.querySelector("[data-selected-count]");
const saveSetButton = document.querySelector("[data-save-set]");
const setNameInput = document.querySelector("[data-set-name]");
const setList = document.querySelector("[data-set-list]");
const emptyState = document.querySelector("[data-empty-state]");

let selectedChords = [];
let savedSets = loadSets();

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function loadSets() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
}

function saveSets() {
  localStorage.setItem(storageKey, JSON.stringify(savedSets));
}

function openMenu() {
  document.body.classList.add("menu-open");
  menuButton.setAttribute("aria-expanded", "true");
  menuPanel.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuPanel.setAttribute("aria-hidden", "true");
}

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  screenButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screenTarget === name);
  });

  closeMenu();
}

function openSetModal() {
  document.body.classList.add("modal-open");
  setModal.setAttribute("aria-hidden", "false");
  setNameInput.focus();
}

function closeSetModal() {
  document.body.classList.remove("modal-open");
  setModal.setAttribute("aria-hidden", "true");
}

function openViewModal(setId) {
  const set = savedSets.find((savedSet) => savedSet.id === setId);
  if (!set) {
    return;
  }

  viewTitle.textContent = set.name;
  viewGrid.innerHTML = set.chords
    .map(
      (chord) => `
        <article class="practice-chord">
          <img src="assets/chords/${chord.id}.jpg" alt="${chord.name} 코드" />
          <strong>${chord.name}</strong>
        </article>
      `,
    )
    .join("");

  document.body.classList.add("view-open");
  viewModal.setAttribute("aria-hidden", "false");
}

function closeViewModal() {
  document.body.classList.remove("view-open");
  viewModal.setAttribute("aria-hidden", "true");
}

function renderChordPicker() {
  chordPicker.innerHTML = chords
    .map(([id, name]) => {
      return `
        <button class="chord-option" type="button" data-chord-id="${id}">
          <img src="assets/chords/${id}.jpg" alt="${name} 코드" />
          <span>${name}</span>
        </button>
      `;
    })
    .join("");
}

function updateBuilder() {
  selectedCount.textContent = selectedChords.length;
  saveSetButton.disabled = selectedChords.length !== 4;
  renderSelectedSlots();
  renderChordPicker();
}

function renderSelectedSlots() {
  selectedSlots.innerHTML = Array.from({ length: 4 }, (_, index) => {
    const chord = selectedChords[index];

    if (!chord) {
      return `<div class="selected-slot is-empty">${index + 1}</div>`;
    }

    return `
      <button class="selected-slot" type="button" data-remove-selected="${index}" aria-label="${chord.name} 제거">
        <span>${chord.name}</span>
        <strong>&times;</strong>
      </button>
    `;
  }).join("");
}

function addChord(id) {
  if (selectedChords.length >= 4) {
    return;
  }

  const chord = chords.find(([chordId]) => chordId === id);
  selectedChords.push({ id: chord[0], name: chord[1] });
  updateBuilder();
}

function removeSelectedChord(index) {
  selectedChords.splice(index, 1);
  updateBuilder();
}

function createSet() {
  if (selectedChords.length !== 4) {
    return;
  }

  const fallbackName = selectedChords.map((chord) => chord.name).join(" - ");
  const name = setNameInput.value.trim() || fallbackName;

  const newSet = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    chords: selectedChords,
  };

  savedSets.unshift(newSet);

  selectedChords = [];
  setNameInput.value = "";
  saveSets();
  updateBuilder();
  renderSets();
  closeSetModal();
}

function deleteSet(id) {
  savedSets = savedSets.filter((set) => set.id !== id);
  saveSets();
  renderSets();
}

function renderSets() {
  emptyState.hidden = savedSets.length > 0;
  setList.innerHTML = savedSets
    .map((set) => {
      const setName = escapeHtml(set.name);
      const chordNames = escapeHtml(set.chords.map((chord) => chord.name).join(" / "));

      return `
        <article class="set-card" data-set-id="${set.id}">
          <div class="set-card-header">
            <button class="set-select-button" type="button" data-select-set="${set.id}">
              <strong>${setName}</strong>
              <span>${chordNames}</span>
            </button>
            <button type="button" data-delete-set="${set.id}">삭제</button>
          </div>
        </article>
      `;
    })
    .join("");
}

menuButton.addEventListener("click", openMenu);
closeMenuButton.addEventListener("click", closeMenu);
menuBackdrop.addEventListener("click", closeMenu);
openSetModalButton.addEventListener("click", openSetModal);
closeSetModalButton.addEventListener("click", closeSetModal);
modalBackdrop.addEventListener("click", closeSetModal);
closeViewModalButton.addEventListener("click", closeViewModal);
viewBackdrop.addEventListener("click", closeViewModal);
saveSetButton.addEventListener("click", createSet);

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screenTarget);
  });
});

chordPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chord-id]");
  if (!button) {
    return;
  }

  addChord(button.dataset.chordId);
});

selectedSlots.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-selected]");
  if (!button) {
    return;
  }

  removeSelectedChord(Number(button.dataset.removeSelected));
});

setList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-set]");
  if (deleteButton) {
    deleteSet(deleteButton.dataset.deleteSet);
    return;
  }

  const selectButton = event.target.closest("[data-select-set]");
  if (!selectButton) {
    return;
  }

  openViewModal(selectButton.dataset.selectSet);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeViewModal();
  closeSetModal();
  closeMenu();
});

renderChordPicker();
renderSelectedSlots();
renderSets();
