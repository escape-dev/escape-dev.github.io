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

const experiences = {
  message: "OK",
  data: [
    {
      title: "Freelance Backend Developer",
      description:
        "Working as a backend developer, responsible for developing and maintaining the company's backend services",
      start_date: "January 2024",
      end_date: null,
      is_active: true,
      skills: ["Kotlin", "Spring Boot", "PostgreSQL", "Gitlab", "Scrum"],
    },
    {
      title: "Freelance Backend Developer",
      company_name: "PT. Qatros Teknologi Nusantara",
      description:
        "As a backend developer, I create APIs, design database systems, and integrate third-party APIs like Challonge for tournament bracket generator. At MovesGG, a platform for gaming tournaments, I focus on building scalable backend services to handle tournament management and ensure smooth integration with external services.",
      start_date: "December 2022",
      end_date: "March 2023",
      is_active: false,
      skills: ["Ruby", "Ruby on Rails", "Scrum", "PostgreSQL", "Gitlab"],
    },
    {
      title: "Internship Web Developer",
      company_name: "PT. Git Solution",
      description:
        "Internship as a full stack web developer, develop online learning management system (LMS) using Laravel.",
      start_date: "September 2021",
      end_date: "December 2021",
      is_active: false,
      skills: ["PHP", "Laravel", "PostgreSQL", "Git", "RESTApi"],
    },
  ],
};

const projects = {
  message:
    "The project I worked on was an internal system at my previous company, and due to confidentiality agreements, I’m unable to share specific details.",
  data: null,
};

const reachMeOut = {
  message: "OK",
  data: [
    {
      platform_name: "linkedin",
      url: "https://www.linkedin.com/in/hafizalfikri/",
    },
    {
      platform_name: "github",
      url: "https://github.com/escape-dev",
    },
    {
      platform_name: "email",
      url: "hafiz170301@gmail.com",
    },
  ],
};

document.getElementById("experience-content").innerHTML =
  syntaxHighlight(experiences);
document.getElementById("projects-content").innerHTML =
  syntaxHighlight(projects);
document.getElementById("reach-me-out-content").innerHTML =
  syntaxHighlight(reachMeOut);
