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

function initScenarioStartForm(formElement) {
  formElement.addEventListener("submit", e => {
    e.preventDefault();

    const action = formElement.getAttribute("action");
    const url = new URL(action, document.location.origin);
    const searchParams = new URLSearchParams();

    const formData = new FormData(formElement);
    for (const [key, value] of formData) {
      searchParams.append(key, value);
    }

    url.searchParams = searchParams;

    fetch(url).then(() => {
      const id = formElement.getAttribute("data-scenario-id");
      const statusElement = document.querySelector(
        `.scenario-table__summary-row[data-scenario-id=${id}] .scenario-table__col-status`
      );
      const now = new Date();
      const time = now.toTimeString().substr(0, 8);
      statusElement.innerText = `Started at ${time}`;
    });
  });
}

function initScenarioStartForms() {
  for (const form of document.querySelectorAll("form")) {
    initScenarioStartForm(form);
  }
}

initScenarioRowExpanding();
initScenarioFilter("id");
initScenarioFilter("tags");
initScenarioStartForms();
