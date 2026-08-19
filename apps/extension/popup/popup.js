function $(id) {
  return document.getElementById(id);
}

function send(message) {
  return chrome.runtime.sendMessage(message);
}

function render(state) {
  $("logged-out").hidden = state.loggedIn;
  $("logged-in").hidden = !state.loggedIn;
  if (state.loggedIn) $("user-name").textContent = state.user?.name ?? "";
}

async function init() {
  const state = await send({ type: "GET_STATE" });
  render(state);
}

$("login-btn").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  const errorEl = $("login-error");
  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "Preencha e-mail e senha.";
    return;
  }

  const response = await send({ type: "LOGIN", email, password });
  if (response.error) {
    errorEl.textContent = response.error;
    return;
  }
  render(response);
});

$("logout-btn").addEventListener("click", async () => {
  const response = await send({ type: "LOGOUT" });
  render(response);
});

init();
