const chords = [
  ["C", "C"],
  ["C7", "C7"],
  ["C-MINOR", "Cm"],
  ["C-MINOR7", "Cm7"],
  ["C-MAJOR7", "CM7"],
  ["D", "D"],
  ["D7", "D7"],
  ["D-MINOR", "Dm"],
  ["D-MINOR7", "Dm7"],
  ["D-MAJOR7", "DM7"],
  ["E", "E"],
  ["E7", "E7"],
  ["E-MINOR", "Em"],
  ["E-MINOR7", "Em7"],
  ["E-MAJOR7", "EM7"],
  ["F", "F"],
  ["F7", "F7"],
  ["F-MINOR", "Fm"],
  ["F-MINOR7", "Fm7"],
  ["F-MAJOR7", "FM7"],
  ["G", "G"],
  ["G7", "G7"],
  ["G-MINOR", "Gm"],
  ["G-MINOR7", "Gm7"],
  ["G-MAJOR7", "GM7"],
  ["A", "A"],
  ["A7", "A7"],
  ["A-MINOR", "Am"],
  ["A-MINOR7", "Am7"],
  ["A-MAJOR7", "AM7"],
  ["B", "B"],
  ["B7", "B7"],
  ["B-MINOR", "Bm"],
  ["B-MINOR7", "Bm7"],
  ["B-MAJOR7", "BM7"],
];

const storageKey = "guitarChordSets";
const legacyChordIds = {
  "a": "A",
  "a7": "A7",
  "a-major7": "A-MAJOR7",
  "a-minor": "A-MINOR",
  "a-minor7": "A-MINOR7",
  "b": "B",
  "b7": "B7",
  "b-major7": "B-MAJOR7",
  "b-minor": "B-MINOR",
  "b-minor7": "B-MINOR7",
  "c": "C",
  "c7": "C7",
  "c-major7": "C-MAJOR7",
  "c-minor": "C-MINOR",
  "c-minor7": "C-MINOR7",
  "d": "D",
  "d7": "D7",
  "d-major7": "D-MAJOR7",
  "d-minor": "D-MINOR",
  "d-minor7": "D-MINOR7",
  "e": "E",
  "e7": "E7",
  "e-major7": "E-MAJOR7",
  "e-minor": "E-MINOR",
  "e-minor7": "E-MINOR7",
  "f": "F",
  "f7": "F7",
  "f-major7": "F-MAJOR7",
  "f-minor": "F-MINOR",
  "f-minor7": "F-MINOR7",
  "g": "G",
  "g7": "G7",
  "g-major7": "G-MAJOR7",
  "g-minor": "G-MINOR",
  "g-minor7": "G-MINOR7",
};
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
saveSets();

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
    return migrateSets(JSON.parse(localStorage.getItem(storageKey)) ?? []);
  } catch {
    return [];
  }
}

function migrateSets(sets) {
  return sets.map((set) => ({
    ...set,
    chords: set.chords.map((chord) => ({
      ...chord,
      id: legacyChordIds[chord.id] ?? chord.id,
    })),
  }));
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
