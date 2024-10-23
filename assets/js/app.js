const CONFIG = {
  BASE_URL: "./assets/js/data/",
  FILE_EXT: ".json",
};

function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);

  dropdown.classList.toggle("show");
}

function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

async function getContent(filename) {
  return fetch(`${CONFIG.BASE_URL}/${filename}${CONFIG.FILE_EXT}`)
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) =>
      console.error("Something shit happened: " + error.message)
    );
}

function createContentHtml(content, contentJson) {
  const { name, method, url, description, status } = content;

  return `<div class="dropdown-container">
    <button class="dropdown-btn" onclick="toggleDropdown('${name}')">
    <span class="get-method">${method}</span>
    <p class="dropdown-description">
      ${url}
      <small>${description}</small>
    </p>
    </button>
    <div class="dropdown-content" id="${name}">
      <table>
        <tr>
          <th>Code</th>
          <th>Description</th>
        </tr>
        <tr>
          <td class="json-viewer">${status}</td>
          <td class="json-viewer">
            <pre> ${syntaxHighlight(contentJson)} </pre>
          </td>
        </tr>
      </table>
    </div>
  </div>`;
}

async function renderContent() {
  const mainContent = document.getElementById("main-content");
  const listContents = await getContent("listContents");

  const contentPromises = listContents.data.map(async (value) => {
    const contentJson = await getContent(value.name);

    return { value, contentJson };
  });

  const contents = await Promise.all(contentPromises);

  const contentHtml = contents
    .map(({ value, contentJson }) => createContentHtml(value, contentJson))
    .join("");

  mainContent.innerHTML = contentHtml;
}

document.addEventListener("DOMContentLoaded", renderContent);
