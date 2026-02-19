const form = document.getElementById("signup-form");
const statusMsg = document.getElementById("status-msg");
const submitBtn = document.getElementById("submit-btn");

function setStatus(message, state) {
  statusMsg.textContent = message;
  statusMsg.dataset.state = state || "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const verifyPassword = String(formData.get("verifyPassword") || "");

  if (!name || !dateOfBirth || !email || !password || !verifyPassword) {
    setStatus("Please fill in all signup fields.", "error");
    return;
  }

  if (password !== verifyPassword) {
    setStatus("Password and verify password must match.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Creating your account...", "");

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        dateOfBirth,
        email,
        password,
        verifyPassword
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Unable to create account.");
    }

    form.reset();
    const user = payload.user || { email, profile: { name, dateOfBirth } };
    localStorage.setItem("brainGymUser", JSON.stringify(user));
    setStatus("Account created. Redirecting...", "success");
    window.location.href = "home.html";
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});
