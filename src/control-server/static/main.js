function initScenarioFilter(prop) {
  const summaryRows = document.querySelectorAll(".scenario-table__summary-row");
  const filter = document.querySelector(`[name=${prop}-filter]`);

  filter.addEventListener("input", e => {
    const inputValue = e.currentTarget.value.trim();

    for (const row of summaryRows) {
      const words = inputValue.split(" ");
      const propValue = row.getAttribute(`data-scenario-${prop}`);
      const matchWords = words.every(word => propValue.includes(word));
      if (inputValue === "" || matchWords) {
        row.classList.remove(`is-${prop}-filtered`);
      } else {
        row.classList.add(`is-${prop}-filtered`);
      }
    }

    localStorage.setItem(`${prop}-filter`, inputValue);
  });

  filter.value = localStorage.getItem(`${prop}-filter`);
  filter.dispatchEvent(new Event("input", { bubbles: true }));
}

function initScenarioRowExpanding() {
  const summaryRows = document.querySelectorAll(".scenario-table__summary-row");
  for (const row of summaryRows) {
    row.addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") {
        e.currentTarget.nextElementSibling.classList.toggle("is-open");
      }
    });
  }
}

function updateScenarioStatus(id, status) {
  const statusElements = document.querySelectorAll(
    ".scenario-table__summary-row .scenario-table__col-status"
  );

  for (const el of statusElements) {
    el.innerText = "Inactive";
  }

  const statusElement = document.querySelector(
    `.scenario-table__summary-row[data-scenario-id=${id}] .scenario-table__col-status`
  );

  if (status === "started") {
    statusElement.innerText = "Active";
  } else if (status === "stopped") {
    statusElement.innerText = "Inactive";
  } else if (status === "reset") {
    statusElement.innerText = "Active";
  }
}

function initScenarioStartButton(button) {
  button.addEventListener("click", e => {
    const form = button.closest("form");
    const id = form.getAttribute("data-scenario-start-form-id");
    const action = form.getAttribute("data-scenario-start-form-action");
    const url = new URL(action, document.location.origin);
    const searchParams = new URLSearchParams();

    const formData = new FormData(form);
    for (const [key, value] of formData) {
      searchParams.append(key, value);
    }

    url.search = searchParams.toString();

    fetch(url)
      .then(() => {
        updateScenarioStatus(id, "started");
      })
      .catch(e => console.log(e));

    // Prevent submit
    e.preventDefault();
  });
}

function initScenarioStartButtons() {
  const buttons = document.querySelectorAll("[data-scenario-start-button]");
  for (const button of buttons) {
    initScenarioStartButton(button);
  }
}

function initScenarioBootstrapButton(button) {
  button.addEventListener("click", _e => {
    const form = button.closest("form");
    const id = form.getAttribute("data-scenario-bootstrap-form-id");
    updateScenarioStatus(id, "started");
  });
}

function initScenarioBootstrapButtons() {
  const buttons = document.querySelectorAll("[data-scenario-bootstrap-button]");
  for (const button of buttons) {
    initScenarioBootstrapButton(button);
  }
}

function initScenarioStopButton(button) {
  button.addEventListener("click", e => {
    const form = button.closest("form");
    const id = form.getAttribute("data-scenario-stop-form-id");
    const action = form.getAttribute("action");
    fetch(action)
      .then(() => {
        updateScenarioStatus(id, "stopped");
      })
      .catch(e => console.log(e));
    e.preventDefault();
  });
}

function initScenarioStopButtons() {
  const buttons = document.querySelectorAll("[data-scenario-stop-button]");
  for (const button of buttons) {
    initScenarioStopButton(button);
  }
}

function initScenarioResetButton(button) {
  button.addEventListener("click", e => {
    const form = button.closest("form");
    const id = form.getAttribute("data-scenario-reset-form-id");
    const action = form.getAttribute("action");
    fetch(action).then(() => {
      updateScenarioStatus(id, "reset");
    });
    e.preventDefault();
  });
}

function initScenarioResetButtons() {
  const buttons = document.querySelectorAll("[data-scenario-reset-button]");
  for (const button of buttons) {
    initScenarioResetButton(button);
  }
}

initScenarioRowExpanding();
initScenarioFilter("id");
initScenarioFilter("tags");
initScenarioStartButtons();
initScenarioBootstrapButtons();
initScenarioStopButtons();
initScenarioResetButtons();
