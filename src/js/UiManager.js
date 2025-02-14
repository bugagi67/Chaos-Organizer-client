export default class UiManager {
  constructor() {
    this.dropdown = document.querySelector(".dropdown");
    this.dropDownFind = document.querySelector(".dropdown-find");
  }

  createDropdown() {
    const dropdownItem = document.createElement("div");
    dropdownItem.className = "dropdown-content";
    dropdownItem.innerHTML = `
      <div class="dropdown-item send-geolocation">Отправить ГЕО</div>
      <div class="dropdown-item types-files">Показать файлы</div>
      <div class="dropdown-item ">Избранные</div>
    `;
    this.dropdown.append(dropdownItem);
  }

  dropdownOpen() {
    const dropdown = document.querySelector(".dropdown-content");
    dropdown.style.display = "block";
  }

  dropdownClose() {
    const dropdown = document.querySelector(".dropdown-content");
    dropdown.style.display = "none";
  }

  openDropdownFind() {
    const find = document.querySelector(".find-area");
    find.style.display = "block";
  }

  closeDropdownFind() {
    const find = document.querySelector(".find-area");
    find.style.display = "none";
  }
}
