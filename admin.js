const pendingList = document.getElementById("pendingList");
const adminStatus = document.getElementById("adminStatus");

const setStatus = (text) => {
  if (adminStatus) adminStatus.textContent = text;
};

const renderPending = (items) => {
  if (!pendingList) return;
  pendingList.innerHTML = "";

  if (!items.length) {
    pendingList.innerHTML = "<p>No pending reviews.</p>";
    return;
  }

  items.forEach((review) => {
    const card = document.createElement("article");
    card.className = "policy-card";
    const name = document.createElement("h2");
    name.textContent = review.name;
    const message = document.createElement("p");
    message.textContent = review.message;
    const meta = document.createElement("p");
    meta.textContent = `Submitted: ${new Date(review.createdAt).toLocaleString()}`;
    meta.style.color = "#4b6276";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.marginTop = "12px";

    const approveBtn = document.createElement("button");
    approveBtn.className = "button primary";
    approveBtn.textContent = "Approve";
    approveBtn.addEventListener("click", () => updateReview("approve", review.id));

    const rejectBtn = document.createElement("button");
    rejectBtn.className = "button ghost";
    rejectBtn.textContent = "Reject";
    rejectBtn.addEventListener("click", () => updateReview("reject", review.id));

    actions.appendChild(approveBtn);
    actions.appendChild(rejectBtn);
    card.appendChild(name);
    card.appendChild(message);
    card.appendChild(meta);
    card.appendChild(actions);
    pendingList.appendChild(card);
  });
};

const loadPending = async () => {
  try {
    const response = await fetch("/api/reviews/pending");
    const data = await response.json();
    renderPending(Array.isArray(data) ? data : []);
  } catch (error) {
    setStatus("Failed to load pending reviews.");
  }
};

const updateReview = async (action, id) => {
  try {
    const response = await fetch(`/api/reviews/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error("Request failed");
    setStatus("Review updated.");
    loadPending();
  } catch (error) {
    setStatus("Update failed.");
  }
};

loadPending();
