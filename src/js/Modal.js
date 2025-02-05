export default class Modal {
  constructor() {}

	userNameModal() {
		const body = document.querySelector("body");

    const modal = document.createElement("div");
    modal.className = "modal user-name_modal";
    modal.innerHTML = `
        <div class="modal-content">
			<h3>Хотите изменить имя?</h3>
			<input type="text" id="coordinates" placeholder="Введите новое имя">
			<div class="buttons">
				<button class="cancel" id="cancel-btn">Отмена</button>
				<button class="ok" id="ok-btn">OK</button>
			</div>
		</div>
        `;

    body.append(modal);
	}

  createGeolocationModal() {
    const body = document.querySelector("body");

    const modal = document.createElement("div");
    modal.className = "modal geolocation-modal";
    modal.id = "geolocation-modal";
    modal.innerHTML = `
        <div class="modal-content">
			<h3>Что-то пошло не так</h3>
			<p>К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение на использование
				геолокации, либо введите координаты вручную.</p>
			<p>Широта и долгота через запятую</p>
			<input type="text" id="coordinates" placeholder="51.50851,-0.12572">
			<div class="buttons">
				<button class="cancel" id="cancel-btn">Отмена</button>
				<button class="ok" id="ok-btn">OK</button>
			</div>
		</div>
        `;

    body.append(modal);
  }

  showModal(selector) {
    const modal = document.querySelector(selector);
    modal.classList.add("active");
  }

  closeModal(selector) {
    const modal = document.querySelector(selector);
    modal.classList.remove("active");
  }

	showError() {
    const buttons = document.querySelector(".buttons");
    const okButton = document.querySelector("#ok-btn");
    const error = document.createElement("span");
    error.textContent = "Данные некорректны";
    error.style.color = "#B22222";
    error.fontSize = "10px";
    buttons.insertBefore(error, okButton);
    setTimeout(() => {
      error.remove();
    }, 2000);
  }
}
