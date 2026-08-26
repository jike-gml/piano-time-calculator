(() => {
  "use strict";
  const form = document.querySelector("#time-form");
  const clearButton = document.querySelector("#clear-button");
  const result = document.querySelector("#result-value");
  const error = document.querySelector("#error-message");
  const startInput = document.querySelector("#start-time");
  const endInput = document.querySelector("#end-time");
  const inputs = [startInput, endInput];
  const zeroTime = "00:00:00:00";

  function showError(message, input) {
    error.textContent = message;
    error.hidden = false;
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }

  function clearError() {
    error.hidden = true;
    error.textContent = "";
    inputs.forEach((input) => {
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
    });
  }

  function formatDigits(value) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.match(/.{1,2}/g)?.join(":") ?? "";
  }

  function selectInput(input) {
    input.focus();
    input.select();
  }

  function readTime(input, label) {
    if (!/^\d{2}:\d{2}:\d{2}:\d{2}$/.test(input.value)) {
      showError(`${label}を8桁で入力してください。`, input);
      return null;
    }
    const values = input.value.split(":").map(Number);
    const [, minutes, seconds, milliseconds] = values;
    if (minutes > 59 || seconds > 59 || milliseconds > 59) {
      showError(`${label}の値を確認してください。分・秒・ミリ秒は00〜59です。`, input);
      return null;
    }
    return values;
  }

  function toUnits([hours, minutes, seconds, milliseconds]) {
    return (((hours * 60) + minutes) * 60 + seconds) * 60 + milliseconds;
  }

  function formatTime(total) {
    const hours = Math.floor(total / 216000);
    const minutes = Math.floor((total % 216000) / 3600);
    const seconds = Math.floor((total % 3600) / 60);
    const milliseconds = total % 60;
    return [hours, minutes, seconds, milliseconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();
    const start = readTime(startInput, "開始時間");
    if (!start) return;
    const end = readTime(endInput, "終了時間");
    if (!end) return;
    const startValue = toUnits(start);
    const endValue = toUnits(end);
    if (endValue < startValue) {
      showError("終了時間は開始時間以降を入力してください。", endInput);
      return;
    }
    result.value = formatTime(endValue - startValue);
    endInput.blur();
  });

  clearButton.addEventListener("click", () => {
    inputs.forEach((input) => { input.value = zeroTime; });
    clearError();
    result.value = zeroTime;
    selectInput(startInput);
  });

  inputs.forEach((input) => {
    input.addEventListener("focus", () => input.select());
    input.addEventListener("input", () => {
      const digitCount = input.value.replace(/\D/g, "").length;
      input.value = formatDigits(input.value);
      clearError();
      if (input === startInput && digitCount >= 8) {
        selectInput(endInput);
      }
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      if (input === startInput) {
        selectInput(endInput);
      } else {
        form.requestSubmit();
      }
    });
    input.addEventListener("blur", () => {
      if (input.value === "") input.value = zeroTime;
    });
  });
})();
