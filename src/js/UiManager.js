export default class UiManager {
  constructor() {
    this.dropdown = document.querySelector(".dropdown");
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
}
