// =========================================================
// CRYSTAL PLATFORM - WALLET HISTORY
// =========================================================

async function loadWalletHistory() {
  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.log("No authenticated user");
      return;
    }

    const { data, error } = await supabaseClient
      .from("wallet_transactions")
      .select("*")
      .eq("auth_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("History error:", error);
      return;
    }

    renderWalletHistory(data || []);

  } catch (err) {
    console.error("History exception:", err);
  }
}


function renderWalletHistory(transactions) {

  let box = document.getElementById("wallet-history");

  if (!box) {

    const walletPage = document.getElementById("wallet");

    if (!walletPage) return;

    box = document.createElement("div");
    box.id = "wallet-history";

    box.style.marginTop = "20px";

    walletPage.appendChild(box);
  }


  if (!transactions.length) {

    box.innerHTML = `
      <div class="card">
        <div style="
          font-size:18px;
          font-weight:700;
          margin-bottom:8px;
        ">
          History
        </div>

        <div style="
          opacity:0.6;
          text-align:center;
          padding:20px 0;
        ">
          No transactions yet
        </div>
      </div>
    `;

    return;
  }


  let html = `
    <div class="card">

      <div style="
        font-size:18px;
        font-weight:700;
        margin-bottom:15px;
      ">
        History
      </div>
  `;


  transactions.forEach(tx => {

    const date = new Date(tx.created_at);

    const dateText = date.toLocaleString();


    let statusText = tx.status || "Pending";

    let statusColor = "#f5b942";

    if (statusText === "Completed") {
      statusColor = "#4ade80";
    }

    if (statusText === "Rejected") {
      statusColor = "#ff5c5c";
    }


    html += `
      <div style="
        padding:14px 0;
        border-bottom:1px solid rgba(255,255,255,0.08);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">

          <div>
            <div style="
              font-weight:700;
              font-size:15px;
            ">
              ${tx.type}
            </div>

            <div style="
              font-size:12px;
              opacity:0.55;
              margin-top:4px;
            ">
              ${tx.network || ""}
            </div>
          </div>


          <div style="
            font-weight:700;
            font-size:16px;
          ">
            $${Number(tx.amount).toFixed(2)}
          </div>

        </div>


        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-top:9px;
        ">

          <span style="
            color:${statusColor};
            font-size:13px;
            font-weight:700;
          ">
            ${statusText}
          </span>

          <span style="
            font-size:11px;
            opacity:0.45;
          ">
            ${dateText}
          </span>

        </div>

      </div>
    `;
  });


  html += `
    </div>
  `;

  box.innerHTML = html;
}


// Wallet açylanda history täzele
document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {
    loadWalletHistory();
  }, 1200);

});


// Başga JS-den hem çagyrmak üçin
window.loadWalletHistory = loadWalletHistory;
