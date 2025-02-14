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

export default function addGeoMessage(position) {
  const listMessages = document.querySelector(".list-message");
  const message = document.createElement("div");
  message.className = "message-container";
  message.innerHTML = `
        <div class="text-and_date">
            📍 <a href="https://yandex.ru/maps/?ll=${position.longitude},${position.latitude}&z=16" target="_blank">Открыть в Яндекс.Картах</a>
            <div class="date">${moment().format("HH:mm DD.MM.YYYY")}</div>
        </div>
    `;
  listMessages.insertAdjacentElement("afterbegin", message);
}
