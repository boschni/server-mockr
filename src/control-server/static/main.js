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
  });
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

function initScenarioStartForm(form) {
  const id = form.getAttribute("data-scenario-start-form-id");
  const action = form.getAttribute("action");

  form.addEventListener("submit", e => {
    e.preventDefault();

    const url = new URL(action, document.location.origin);
    const searchParams = new URLSearchParams();

    const formData = new FormData(form);
    for (const [key, value] of formData) {
      searchParams.append(key, value);
    }

    url.search = searchParams.toString();

    fetch(url).then(() => {
      updateScenarioStatus(id, "started");
    });
  });
}

function initScenarioStartForms() {
  for (const form of document.querySelectorAll("[data-scenario-start-form]")) {
    initScenarioStartForm(form);
  }
}

function initScenarioStopForm(form) {
  const id = form.getAttribute("data-scenario-stop-form-id");
  const action = form.getAttribute("action");
  form.addEventListener("submit", e => {
    e.preventDefault();
    fetch(action).then(() => {
      updateScenarioStatus(id, "stopped");
    });
  });
}

function initScenarioStopForms() {
  for (const form of document.querySelectorAll("[data-scenario-stop-form]")) {
    initScenarioStopForm(form);
  }
}

function initScenarioResetForm(form) {
  const id = form.getAttribute("data-scenario-reset-form-id");
  const action = form.getAttribute("action");
  form.addEventListener("submit", e => {
    e.preventDefault();
    fetch(action).then(() => {
      updateScenarioStatus(id, "reset");
    });
  });
}

function initScenarioResetForms() {
  for (const form of document.querySelectorAll("[data-scenario-reset-form]")) {
    initScenarioResetForm(form);
  }
}

initScenarioRowExpanding();
initScenarioFilter("id");
initScenarioFilter("tags");
initScenarioStartForms();
initScenarioStopForms();
initScenarioResetForms();
