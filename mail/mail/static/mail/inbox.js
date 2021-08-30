document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function reply_email(sender, subject) {
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = `Re: ${subject}`;
  document.querySelector("#compose-subject").disabled = true;
  document.querySelector("#compose-recipients").disabled = true;
  document.querySelector("#compose-body").value = "";
  document.querySelector("#compose-body").focus();
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
  document.querySelector("#compose-subject").disabled = false;
  document.querySelector("#compose-recipients").disabled = false;
}

function send_email(event) {
  event.preventDefault();
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  }).then((response) => {
    load_mailbox("sent");
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  const emailbiew = document.querySelector("#emails-view");
  emailbiew.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  // Show the mailbox name
  fetch("/emails/" + mailbox)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((email) => {
        // if (mailbox === 'inbox'){

        // }
        const view = document.createElement("div");
        view.className = email.read ? "read_view" : "nread_view";
        emailbiew.append(view);
        const recipient = document.createElement("div");
        recipient.className = "recipient";
        recipient.innerHTML = `
        <span class = "sender"><b>${email.recipients[0]}</b></span>
        <span class = "subject">${email.subject}</span> <span class = "timestamp">${email.timestamp}</span>
        `;
        view.append(recipient);
        view.addEventListener("click", () => {
          fetch("/emails/" + email.id, {
            method: "PUT",
            body: JSON.stringify({
              read: true,
            }),
          }).then((response) => load_email(email.id));
        });
      });
    });
}

function load_email(id) {
  fetch("/emails/" + id)
    .then((response) => response.json())
    .then((data) => {
      document.querySelector("#emails-view").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#email-view").style.display = "block";

      const view = document.querySelector("#email-view");
      view.innerHTML = `
      <span>From: <b>${data.sender} </b></span> <br />
      <span>Subject: <b>${data.subject}</b></span> <br />
      <span>Datetime: <b>${data.timestamp}</b></span> <br />
      <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      <button class ="btn btn-sm btn-secondary px-3" id= "arch" >Archive</button>


      <hr />
      <span>${data.body}</span>
      `;

      document
        .querySelector("#reply")
        .addEventListener("click", () =>
          reply_email(data.sender, data.subject.replace("Re: ", ""))
        );
      document.querySelector("#arch").addEventListener("click", () => {
        fetch("/emails/" + data.id, {
          method: "PUT",
          body: JSON.stringify({
            archived: true,
          }),
        }).then((response) => load_mailbox("archive"));
      });
    });
}
