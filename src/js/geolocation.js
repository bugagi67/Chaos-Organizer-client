import moment from "moment";

export async function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Геолокация не поддерживается браузером"));
    }

    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        const { latitude, longitude } = currentPosition.coords;
        resolve({ latitude, longitude });
      },
      (error) => reject(error),
    );
  });
}

export default function addGeoMessage(position, timeStamp, id) {
  console.log(position);
  const listMessages = document.querySelector(".list-message");
  const message = document.createElement("div");
  message.className = "message-container";
  message.dataset.id = id;
  message.innerHTML = `
        <div class="text-and_date">
          <div class="container-options">
            <div class="date-and_favorite">
              <div class="date">${timeStamp || moment().format("HH:mm DD.MM.YYYY")}</div>
              <i class="fa-solid fa-star favorite"></i>
            </div>
            <div class="edit-message">
              <i class="fa-solid fa-trash remove-item"></i>
            </div>
          </div>
          📍 <a href="https://yandex.ru/maps/?ll=${position.longitude},${position.latitude}&z=16" target="_blank">Открыть в Яндекс.Картах</a>
        </div>
    `;
  listMessages.insertAdjacentElement("afterbegin", message);
}
