import Modal from "./Modal";
import UiManager from "./uiManager";
import { formatTime } from "./utils";
import addGeoMessage, { getPosition } from "./geolocation";
import moment from "moment";

export default class Widget {
  constructor() {
    this.modal = new Modal();
    this.uimanager = new UiManager();
    this.listMessages = document.querySelector(".list-message");
    this.inputPosition = document.querySelector("#coordinates");
    this.inputMessage = document.querySelector("#enter-text");
    this.buttonsRecord = document.querySelectorAll(".record");
    this.inputAddFile = document.querySelector(".overlapped");
    this.baseUrl = `http://localhost:9010`;
    this.watch = this.timer();
    this.initWebSocket();
  }

  init() {
    this.uimanager.createDropdown();

    document.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" && !event.ctrlKey) {
        event.preventDefault();

        const text = this.inputMessage.value.trim();

        if (text) {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
              JSON.stringify({
                type: "send_message",
                content: text,
                contentType: "text",
              }),
            );
          }
          this.resetInput(this.inputMessage);
        }
      }
    });

    document.addEventListener("click", async (event) => {
      const target = event.target;

      if (target.classList.contains("sidebar")) {
        console.log(target);
        this.uimanager.dropdownOpen();
      }

      if (
        !target.closest(".dropdown-content") &&
        !target.closest(".dropdown-item") &&
        !target.closest(".dropdown")
      ) {
        this.uimanager.dropdownClose();
      }

      if (target.classList.contains("find")) {
        this.uimanager.openDropdownFind();
      }

      if (
        !target.closest(".dropdown-find") &&
        !target.closest(".find") &&
        !target.closest(".find-area")
      ) {
        this.uimanager.closeDropdownFind();
      }

      if (target.classList.contains("favorite")) {
        if (target.classList.contains("favorite-active")) {
          target.classList.remove("favorite-active");
        } else {
          target.classList.add("favorite-active");
        }
      }

      if (target.classList.contains("cancel")) {
        this.resetInput(this.inputPosition);
        this.closeModal();
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

        recorder.addEventListener("stop", async () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const file = new File([blob], "recording.webm", {
            type: "video/webm",
          });

          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("http://localhost:9010/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const { fileUrl, contentType, fileName } = await response.json();
            this.ws.send(
              JSON.stringify({
                type: "send_file",
                contentType: contentType,
                content: fileUrl,
                fileName: fileName,
                timeStamp: moment().format("HH:mm DD.MM.YYYY"),
              }),
            );
          }
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

        recorder.addEventListener("stop", async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const file = new File([blob], "recording.webm", {
            type: "audio/webm",
          });

          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("http://localhost:9010/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const { fileUrl, contentType } = await response.json();
            this.ws.send(
              JSON.stringify({
                type: "send_file",
                contentType: contentType,
                content: fileUrl,
                fileName: "recording.webm",
                timeStamp: moment().format("HH:mm DD.MM.YYYY"),
              }),
            );
          }
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
          .then((position) => {
            addGeoMessage(position);
            this.uimanager.dropdownClose();
          })
          .catch((error) =>
            console.error("Ошибка получения геолокации:", error),
          );
      }
    });

    this.inputAddFile.addEventListener("change", async () => {
      try {
        const file = this.inputAddFile.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:9010/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const { fileUrl, contentType, fileName } = await response.json();
          console.log("URL файла (до отправки в WS):", fileUrl);
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        alert("Не удалось загрузить файл");
      }
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

  addMessage(
    content,
    timeStamp,
    contentType = "text",
    fileUrl,
    fileType,
    fileName,
  ) {
    const listMessages = document.querySelector(".list-message");
    const message = document.createElement("div");
    message.className = "message-container";

    let contentBlock = "";

    if (contentType === "text") {
      contentBlock = content;
    } else {
      let filePreview = "";

      if (fileType.startsWith("image/")) {
        filePreview = `<img src="${fileUrl}" alt="${fileName}" class="message-image">`;
      } else if (fileType.startsWith("video/")) {
        filePreview = `
          <video controls class="message-video">
            <source src="${fileUrl}" type="${fileType}">
            Ваш браузер не поддерживает видео
          </video>
        `;
      } else if (fileType.startsWith("audio/")) {
        filePreview = `
          <audio controls class="message-audio">
            <source src="${fileUrl}" type="${fileType}">
            Ваш браузер не поддерживает аудио
            </audio>
         `;
      } else {
        filePreview = `
          <a href="${fileUrl}" download="${fileName}" class="message-file">
          📄 ${fileName}
          </a>
        `;
      }
      contentBlock = filePreview;
    }

    message.innerHTML = `
        <div class="text-and_date">
          <div class="container-options">
            <div class="date-and_favorite">
              <div class="date">${timeStamp}</div>
              <i class="fa-solid fa-star favorite"></i>
            </div>
            <div class="edit-message">
              ${contentType === "text" ? '<i class="fa-solid fa-pen"></i>' : ""}
              <i class="fa-solid fa-trash"></i>
            </div>
          </div>
          ${contentBlock}
        </div>
      `;

    listMessages.insertAdjacentElement("afterbegin", message);
    listMessages.scrollTop = 0;
  }

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

  initWebSocket() {
    this.ws = new WebSocket("ws://127.0.0.1:9010");
    this.ws.addEventListener("open", () => {
      console.log("Websocket подключен");
    });

    this.ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setTimeout(() => this.initWebSocket(), 3000);
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === "message_history") {
        message.messages.forEach((msg) => {
          if (msg.contentType === "text") {
            this.addMessage(msg.content, msg.timeStamp);
          } else {
            this.addMessage(
              "",
              msg.timeStamp,
              msg.contentType,
              msg.content,
              msg.contentType,
              msg.fileName,
            );
          }
        });
      }

      if (message.type === "new_message") {
        if (message.contentType === "text") {
          this.addMessage(message.content, message.timeStamp);
        } else {
          this.addMessage(
            "",
            message.timeStamp,
            message.contentType,
            message.content,
            message.contentType,
            message.fileName,
          );
        }
      }
    });

    this.ws.addEventListener("close", () => {
      console.log("Websocket отключен");
    });
  }
}
