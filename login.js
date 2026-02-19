const form = document.getElementById("login-form");
const statusMsg = document.getElementById("status-msg");
const submitBtn = document.getElementById("submit-btn");

function setStatus(message, state) {
  statusMsg.textContent = message;
  statusMsg.dataset.state = state || "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    setStatus("Please enter both email and password.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Logging in...", "");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Unable to save login information.");
    }

    form.reset();
    const user = payload.user || { email };
    localStorage.setItem("brainGymUser", JSON.stringify(user));
    setStatus("Login successful. Redirecting...", "success");
    window.location.href = "home.html";
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});
