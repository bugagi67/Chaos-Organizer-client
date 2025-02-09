import Modal from "./Modal";
import UiManager from "./uiManager";
import positionValidation, { formatTime } from "./utils";
import addGeoMessage,  { getPosition } from "./geolocation";
import moment from "moment";
// import { getPosition } from "./geolocation";

export default class Widget {
  constructor() {
    this.modal = new Modal();
    this.uimanager = new UiManager();

    this.listMessages = document.querySelector(".list-message");
    this.inputPosition = document.querySelector("#coordinates");
    this.inputMesage = document.querySelector("#enter-text");
    this.buttonsRecord = document.querySelectorAll(".record");
    this.inputAddFile = document.querySelector(".overlapped");
    this.watch = this.timer();
  }

  init() {
    this.uimanager.createDropdown();

    document.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        if (event.ctrlKey) {
          event.preventDefault();
          const textArea = this.inputMesage;
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;

          textArea.value =
            textArea.value.substring(0, start) +
            "\n" +
            textArea.value.substring(end);

          textArea.selectionStart = textArea.selectionEnd = start + 1;
        } else {
          event.preventDefault();
          const text = this.inputMesage.value;

          if (text.trim()) {
            const htmlText = `<div class="data">${text}</div>`;
            // this.getPosition(htmlText);
            this.addMessage(htmlText);
            this.resetInput(this.inputMesage);
          }
        }
      }
    });

    document.addEventListener("click", async (event) => {
      const target = event.target;

      if (target.classList.contains("sidebar")) {
        console.log(target)
        this.uimanager.dropdownOpen();
      }

      if (
        !target.closest(".dropdown-content") &&
        !target.closest(".dropdown-item") && 
        !target.closest(".dropdown")
      ) {
        this.uimanager.dropdownClose();
      }

      if (target.classList.contains("cancel")) {
        this.resetInput(this.inputPosition);
        this.closeModal();
      }

      if (target.classList.contains("ok")) {
        const position = this.inputPosition.value.trim();
        const text = this.inputMesage.value;

        const validPosition = positionValidation(position);

        if (validPosition) {
          this.addMessage(text, validPosition);
          this.resetInput(this.inputPosition);
          this.resetInput(this.inputMesage);
          this.modal.closeModal();
        }
        this.showError();
      }

      if (target.classList.contains("record-video")) {
        this.hideButtonsRecord();
        const confirmVideoRecord = document.querySelector(".confirm-record");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 670 },
            height: { ideal: 680 },
            facingMode: "user",
          },
        });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.addEventListener("dataavailable", (event) => {
          chunks.push(event.data);
        });

        recorder.addEventListener("stop", () => {
          const blob = new Blob(chunks);

          const videoSrc = URL.createObjectURL(blob);

          const videoPlayer = `<video class="audio-player video" controls src="${videoSrc}"></video>`;

          this.addMessage(videoPlayer);
        });

        recorder.start();

        confirmVideoRecord.addEventListener("click", () => {
          console.log("click");
          recorder.stop();
          stream.getTracks().forEach((track) => track.stop());
          this.cancelRecord();
        });
      }

      if (target.classList.contains("record-audio")) {
        this.hideButtonsRecord();
        const confirmAudioRecord = document.querySelector(".confirm-record");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.addEventListener("dataavailable", (event) => {
          chunks.push(event.data);
        });

        recorder.addEventListener("stop", () => {
          const blob = new Blob(chunks);

          const src = URL.createObjectURL(blob);

          const player = `<audio class="audio-player audio" controls src="${src}"></audio>`;

          this.addMessage(player);
        });

        recorder.start();

        confirmAudioRecord.addEventListener("click", () => {
          recorder.stop();
          stream.getTracks().forEach((track) => track.stop());
          this.cancelRecord();
        });
      }

      if (target.classList.contains("cancel-record")) {
        this.cancelRecord();
      }

      if (target.classList.contains("add-file")) {
        this.inputAddFile.dispatchEvent(new MouseEvent("click"));
      }

      if (target.classList.contains("image")) {
        this.modal.modalZoomImage(target.src);
      }

      if (target.classList.contains("close_btn")) {
        this.modal.closeModalZoom();
      }

      if (target.classList.contains("send-geolocation")) {
        getPosition()
          .then(position => {
            addGeoMessage(position);
            this.uimanager.dropdownClose();
          })
          .catch(error => console.error("Ошибка получения геолокации:", error));
          
      }
    });

    this.inputAddFile.addEventListener("change", (e) => {
      e.preventDefault();

      const file = this.inputAddFile.files && this.inputAddFile.files[0];

      if (!file) return;

      const url = URL.createObjectURL(file);
      this.addFileMessage(url, file);
    });


  }

  hideButtonsRecord() {
    this.buttonsRecord.forEach((button) => button.classList.add("icon"));
    this.showRecordingButtons();
  }

  cancelRecord() {
    this.watch.stop();
    const removeElement = document.querySelectorAll(".del");
    removeElement.forEach((element) => element.remove());
    this.buttonsRecord.forEach((element) => element.classList.remove("icon"));
  }

  addMessage(data) {
    const listMessages = document.querySelector(".list-message")
    const textMessage = document.createElement("div");
    textMessage.className = "message-container";
    textMessage.innerHTML = `
      <div class="text-and_date">
        ${data}
        <div class="date">${moment().format("HH:mm DD.MM.YYYY")}</div>
      </div>

    `;
    listMessages.insertAdjacentElement("afterbegin", textMessage);
    listMessages.scrollTop = 0;
  }

  addFileMessage(fileUrl, file) {
    const message = document.createElement("div");
    message.className = "message-container";

    let filePreview = "";

    if (file.type.startsWith("image/")) {
      filePreview = `<img src="${fileUrl}" alt="Изображение" class="message-container image">`;
    } else if (file.type.startsWith("video/")) {
      filePreview = `<video controls class="message-container video"><source src="${fileUrl}" type="${file.type}">Ваш браузер не поддерживает видео.</video>`;
    } else if (file.type.startsWith("audio/")) {
      filePreview = `<audio controls class="message-container audio"><source src="${fileUrl}" type="${file.type}">Ваш браузер не поддерживает аудио.</audio>`;
    } else {
      filePreview = `<a href="${fileUrl}" download class="message-file">📄 ${file.name}</a>`;
    }

    message.innerHTML = `
    <div class="text-and_date">
      ${filePreview}
      <div class="date">${moment().format("HH:mm DD.MM.YYYY")}</div>
    </div>
  `;

    this.listMessages.insertAdjacentElement("afterbegin", message);
    this.listMessages.scrollTop = 0;
  }

  editUserName() {}

  resetInput(input) {
    input.value = "";
  }

  showRecordingButtons() {
    const createMessage = document.querySelector(".create-message");

    const confirm = document.createElement("i");
    confirm.className = "fa-solid fa-check confirm-record del";
    createMessage.append(confirm);

    const timer = document.createElement("span");
    timer.className = "timer del";
    timer.textContent = "00:00";
    createMessage.append(timer);

    this.watch.start((formattedTime) => {
      timer.textContent = formattedTime;
    });

    const cancel = document.createElement("i");
    cancel.className = "fa-solid fa-xmark cancel-record del";
    createMessage.append(cancel);
  }

  timer() {
    let seconds = 0;
    let intervalId = null;

    return {
      start(callback) {
        if (intervalId) return;
        intervalId = setInterval(() => {
          seconds++;
          if (callback) callback(formatTime(seconds));
        }, 1000);
      },
      stop() {
        clearInterval(intervalId);
        seconds = 0;
        intervalId = null;
      },
    };
  }
}
