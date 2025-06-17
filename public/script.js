// Utility-Funktionen
function toggleSection(sectionId, isVisible) {
  document.getElementById(sectionId).style.display = isVisible
    ? "block"
    : "none";
}

async function fetchData(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok)
    throw new Error(`Fehler bei der Anfrage: ${response.statusText}`);
  return response.json();
}

// Logout-Button Funktionalität
function redirectToLogin() {
  window.location.href = "/login.html";
}
document.getElementById("logout")?.addEventListener("click", redirectToLogin);

// API-URLs als Konstanten
const API_URLS = {
  myTickets: "/api/mytickets",
  submitTicket: "/api/tickets",
  updateTicket: (id) => `/api/tickets/${id}`,
  deleteTicket: (id) => `/api/tickets/${id}`,
};

// Studentenseite
const btnNewTicket = document.getElementById("newTicketButton");
const btnViewTickets = document.getElementById("viewTicketsButton");
const sectionTicketCreation = document.getElementById("tCreation");
const sectionViewTickets = document.getElementById("viewTickets");

if (
  btnNewTicket &&
  btnViewTickets &&
  sectionTicketCreation &&
  sectionViewTickets
) {
  btnNewTicket.addEventListener("click", () => {
    toggleSection("tCreation", true);
    toggleSection("viewTickets", false);
  });

  btnViewTickets.addEventListener("click", () => {
    toggleSection("tCreation", false);
    toggleSection("viewTickets", true);
    loadStudentTickets();
  });

  async function loadStudentTickets() {
    try {
      const tickets = await fetchData(API_URLS.myTickets);
      const ticketList = document.getElementById("ticketList");
      ticketList.innerHTML = "";

      if (tickets.length === 0) {
        ticketList.innerHTML = "<li>Keine Tickets gefunden.</li>";
      } else {
        tickets.forEach((ticket) =>
          ticketList.appendChild(renderStudentTicket(ticket))
        );
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Tickets:", err);
      document.getElementById(
        "ticketList"
      ).innerHTML = `<li>Fehler: ${err.message}</li>`;
    }
  }

  function renderStudentTicket(ticket) {
    const li = document.createElement("li");
    li.innerHTML = `
            <strong>${ticket.title}</strong>: ${ticket.status}
            <div>
                <h3>Kommentare des Tutors:</h3>
                <ul>
                    ${ticket.comments
                      .map(
                        (comment) =>
                          `<li>${comment.comment} - ${new Date(
                            comment.date
                          ).toLocaleString("de-DE")}</li>`
                      )
                      .join("")}
                </ul>
            </div>
            <div>
                <p><strong>Kurscode:</strong> ${ticket.kursID}</p>
                <p><strong>Medienart:</strong> ${ticket.mediaType}</p>
                <p><strong>Datum:</strong> ${new Date(
                  ticket.date
                ).toLocaleString("de-DE")}</p>
                <p><strong>Beschreibung:</strong> ${ticket.description}</p>
                <p><strong>Genaue Stelle:</strong> ${ticket.exactLocation}</p>
                <p><strong>Priorität:</strong> ${ticket.seriousness}</p>
                <p><strong>E-Mail:</strong> ${ticket.email}</p>
            </div>
        `;
    return li;
  }

  const formSubmitTicket = document.getElementById("submitTicket");
  if (formSubmitTicket) {
    formSubmitTicket.addEventListener("submit", async function (e) {
      e.preventDefault();

      const ticketData = {
        kursID: document.getElementById("kursID").value,
        title: document.getElementById("title").value,
        mediaType: document.getElementById("mediaType").value,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value,
        exactLocation: document.getElementById("exactLocation").value,
        seriousness: document.getElementById("seriousness").value,
        name: document.getElementById("name").value,
        course: document.getElementById("course").value,
        matriculation: document.getElementById("matriculation").value,
        email: document.getElementById("email").value,
      };

      try {
        await fetchData(API_URLS.submitTicket, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketData),
        });

        alert("Ticket wurde erfolgreich erstellt!");
        formSubmitTicket.reset();
        document.getElementById("date").value = new Date()
          .toISOString()
          .split("T")[0];
      } catch (err) {
        alert("Fehler beim Erstellen des Tickets: " + err.message);
      }
    });
  }
}

// Tutorseite
const sectionTicketManagement = document.getElementById("ticketMgt");

// Zeige die Ticket-Management-Sektion direkt beim Laden der Seite
if (sectionTicketManagement) {
  sectionTicketManagement.style.display = "block"; // Standardmäßig sichtbar
  loadTutorTickets(); // Tickets direkt laden

  document
    .getElementById("applyFilters")
    ?.addEventListener("click", loadTutorTickets);

  async function loadTutorTickets() {
    const search = document.getElementById("searchTickets")?.value || "";
    const status = document.getElementById("filterStatus")?.value || "";

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (status) queryParams.append("status", status);

    try {
      const tickets = await fetchData(`/api/tickets?${queryParams.toString()}`);
      const ticketList = document.getElementById("ticketList");
      ticketList.innerHTML = "";

      if (tickets.length === 0) {
        ticketList.innerHTML = "<li>Keine Tickets gefunden.</li>";
      } else {
        tickets.forEach((ticket) =>
          ticketList.appendChild(renderTutorTicket(ticket))
        );
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Tickets:", err);
      document.getElementById(
        "ticketList"
      ).innerHTML = `<li>Fehler: ${err.message}</li>`;
    }
  }

  function renderTutorTicket(ticket) {
    // Datum ohne Uhrzeit formatieren (TT.MM.JJJJ)
    const formattedDate = new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(ticket.date));
  
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ticket.title}</strong> - Status: ${ticket.status}
      <div>
          <p><strong>Kurscode:</strong> ${ticket.kursID}</p>
          <p><strong>Medienart:</strong> ${ticket.mediaType}</p>
          <p><strong>Datum:</strong> ${formattedDate}</p>
          <p><strong>Beschreibung:</strong> ${ticket.description}</p>
          <p><strong>Genaue Stelle:</strong> ${ticket.exactLocation}</p>
          <p><strong>Priorität:</strong> ${ticket.seriousness}</p>
          <p><strong>Name:</strong> ${ticket.name}</p>
          <p><strong>Studiengang:</strong> ${ticket.course}</p>
          <p><strong>Matrikelnummer:</strong> ${ticket.matriculation}</p>
          <p><strong>E-Mail des Studenten:</strong> ${ticket.email || "Keine E-Mail angegeben"}</p>
      </div>
      <div class="action-buttons-container">
          <textarea id="comment_${ticket._id}" placeholder="Kommentar hinzufügen..."></textarea>
          <label for="status_${ticket._id}">Status ändern:</label>
          <select id="status_${ticket._id}" ${ticket.status === "abgeschlossen" ? "disabled" : ""}>
              <option value="in Bearbeitung" ${ticket.status === "in Bearbeitung" ? "selected" : ""}>In Bearbeitung</option>
              <option value="abgeschlossen" ${ticket.status === "abgeschlossen" ? "selected" : ""}>Abgeschlossen</option>
          </select>
      </div>
      <div class="action-buttons-wrapper">
          <button class="action-button" onclick="updateTicket('${ticket._id}')">Aktualisieren</button>
          <button class="action-button" onclick="deleteTicket('${ticket._id}')">Löschen</button>
      </div>
      <h3>Kommentare</h3>
      <ul id="commentHistory_${ticket._id}">
          ${ticket.comments
            .map(
              (c) =>
                `<li>${c.comment} - ${new Date(c.date).toLocaleString("de-DE")}</li>`
            )
            .join("")}
      </ul>`;
    return li;
  }
  

  window.toggleDetails = function (ticketId) {
    const detailsSection = document.getElementById(`details_${ticketId}`);
    detailsSection.style.display =
      detailsSection.style.display === "none" ? "block" : "none";
  };

  window.updateTicket = async function (ticketId) {
    const comment = document.getElementById(`comment_${ticketId}`).value;
    const status = document.getElementById(`status_${ticketId}`).value;

    try {
      await fetchData(API_URLS.updateTicket(ticketId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, status }),
      });

      alert("Ticket erfolgreich aktualisiert!");
      loadTutorTickets();
    } catch (err) {
      alert("Fehler beim Aktualisieren des Tickets: " + err.message);
    }
  };

  window.deleteTicket = async function (ticketId) {
    try {
      await fetchData(API_URLS.deleteTicket(ticketId), { method: "DELETE" });

      alert("Ticket erfolgreich gelöscht");
      loadTutorTickets();
    } catch (err) {
      alert("Fehler beim Löschen des Tickets: " + err.message);
    }
  };
}
