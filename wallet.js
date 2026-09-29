/* =========================================================
   CRYSTAL PLATFORM - TEST WALLET
   TEST MODE ONLY
   Minimum Deposit: $50
   Minimum Withdraw: $50
   ========================================================= */

(function () {

  let walletData = {
    balance: 0,
    transactions: []
  };

  let walletInitialized = false;


  /* =========================
     LANGUAGE
     ========================= */

  function walletLang() {

    try {

      if (
        typeof currentLanguage !== "undefined" &&
        currentLanguage
      ) {
        return currentLanguage;
      }

    } catch (e) {}

    return "tk";
  }


  function walletText(key) {

    const lang = walletLang();

    const texts = {

      tk: {

        history: "💳 Töleg taryhy",
        testMode: "TEST MODE • Hakyky pul hereketi ýok",
        noTransactions: "Häzirlikçe hereket ýok",

        depositTitle: "Pul goş",
        withdrawTitle: "Pul çykar",

        amount: "Mukdar",
        cancel: "Ýatyr",
        confirm: "Tassykla",

        minimumDeposit:
          "Iň az pul goşmak: $50",

        minimumWithdraw:
          "Iň az pul çykarmak: $50",

        invalidAmount:
          "Dogry mukdar giriziň.",

        depositSuccess:
          "Pul üstünlikli goşuldy.",

        withdrawSuccess:
          "Pul çykarmak haýyşy kabul edildi.",

        insufficient:
          "Balans ýeterlik däl.",

        deposit:
          "Deposit",

        withdraw:
          "Withdraw",

        completed:
          "Completed",

        pending:
          "Pending"

      },

      ru: {

        history: "💳 История операций",
        testMode: "TEST MODE • Реальных денег нет",
        noTransactions: "Операций пока нет",

        depositTitle: "Пополнить",
        withdrawTitle: "Вывести",

        amount: "Сумма",
        cancel: "Отмена",
        confirm: "Подтвердить",

        minimumDeposit:
          "Минимальное пополнение: $50",

        minimumWithdraw:
          "Минимальный вывод: $50",

        invalidAmount:
          "Введите правильную сумму.",

        depositSuccess:
          "Баланс успешно пополнен.",

        withdrawSuccess:
          "Запрос на вывод принят.",

        insufficient:
          "Недостаточно средств.",

        deposit:
          "Deposit",

        withdraw:
          "Withdraw",

        completed:
          "Completed",

        pending:
          "Pending"

      },

      en: {

        history: "💳 Transaction History",
        testMode: "TEST MODE • No real money involved",
        noTransactions: "No transactions yet",

        depositTitle: "Deposit",
        withdrawTitle: "Withdraw",

        amount: "Amount",
        cancel: "Cancel",
        confirm: "Confirm",

        minimumDeposit:
          "Minimum deposit: $50",

        minimumWithdraw:
          "Minimum withdrawal: $50",

        invalidAmount:
          "Enter a valid amount.",

        depositSuccess:
          "Deposit successful.",

        withdrawSuccess:
          "Withdrawal request accepted.",

        insufficient:
          "Insufficient balance.",

        deposit:
          "Deposit",

        withdraw:
          "Withdraw",

        completed:
          "Completed",

        pending:
          "Pending"

      }

    };

    return (
      texts[lang] &&
      texts[lang][key]
    ) || texts.en[key] || key;

  }


  /* =========================
     ACCOUNT KEY
     ========================= */

  function getWalletKey() {

    try {

      if (
        typeof currentUser !== "undefined" &&
        currentUser &&
        currentUser.auth_id
      ) {

        return "crypto_wallet_" + currentUser.auth_id;

      }

    } catch (e) {}

    return null;

  }


  /* =========================
     LOAD WALLET
     ========================= */

  function loadWallet() {

    const key = getWalletKey();

    if (!key) return;

    try {

      const saved =
        localStorage.getItem(key);

      if (saved) {

        const parsed =
          JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object"
        ) {

          walletData = {

            balance:
              Number(parsed.balance) || 0,

            transactions:
              Array.isArray(parsed.transactions)
                ? parsed.transactions
                : []

          };

        }

      } else {

        walletData = {

          balance: 0,

          transactions: []

        };

        saveWallet();

      }

    } catch (error) {

      console.error(
        "Wallet load error:",
        error
      );

    }

  }


  /* =========================
     SAVE WALLET
     ========================= */

  function saveWallet() {

    const key = getWalletKey();

    if (!key) return;

    try {

      localStorage.setItem(

        key,

        JSON.stringify(walletData)

      );

    } catch (error) {

      console.error(
        "Wallet save error:",
        error
      );

    }

  }


  /* =========================
     FORMAT MONEY
     ========================= */

  function formatMoney(amount) {

    return Number(amount || 0)
      .toFixed(2);

  }


  /* =========================
     ADD WALLET HISTORY
     ========================= */

  function addTransaction(
    type,
    amount,
    status
  ) {

    walletData.transactions.unshift({

      id:
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .substring(2, 8),

      date:
        new Date().toLocaleString(),

      type: type,

      amount:
        Number(amount),

      status: status

    });

    if (
      walletData.transactions.length > 50
    ) {

      walletData.transactions =
        walletData.transactions.slice(
          0,
          50
        );

    }

  }


  /* =========================
     RENDER BALANCE
     ========================= */

  function renderBalance() {

    const balanceElement =
      document.getElementById("balance");

    if (!balanceElement) return;

    balanceElement.textContent =
      formatMoney(
        walletData.balance
      );

  }


  /* =========================
     WALLET HISTORY UI
     ========================= */

  function createHistoryBox() {

    const walletSection =
      document.getElementById("wallet");

    if (!walletSection) return;

    let historyBox =
      document.getElementById(
        "walletHistory"
      );

    if (historyBox) return;

    historyBox =
      document.createElement("div");

    historyBox.id =
      "walletHistory";

    historyBox.className =
      "card wallet-history-card";

    historyBox.innerHTML = `

      <div
        class="section-title"
        style="
          margin-bottom:10px;
          font-size:18px;
          font-weight:700;
        "
      >
        ${walletText("history")}
      </div>

      <div
        id="walletTestNotice"
        style="
          font-size:12px;
          opacity:.65;
          margin-bottom:14px;
        "
      >
        ${walletText("testMode")}
      </div>

      <div id="walletTransactions"></div>

    `;

    const cards =
      walletSection.querySelectorAll(
        ".card"
      );

    if (cards.length > 0) {

      cards[0]
        .insertAdjacentElement(
          "afterend",
          historyBox
        );

    } else {

      walletSection.appendChild(
        historyBox
      );

    }

  }


  /* =========================
     RENDER HISTORY
     ========================= */

  function renderHistory() {

    const container =
      document.getElementById(
        "walletTransactions"
      );

    if (!container) return;

    if (
      !walletData.transactions.length
    ) {

      container.innerHTML = `

        <div
          style="
            opacity:.55;
            text-align:center;
            padding:18px 5px;
            font-size:13px;
          "
        >
          ${walletText("noTransactions")}
        </div>

      `;

      return;

    }


    container.innerHTML =
      walletData.transactions
        .map(function (tx) {

          const amount =
            Number(tx.amount);

          const isDeposit =
            tx.type === "Deposit";

          const sign =
            isDeposit ? "+" : "-";

          const amountClass =
            isDeposit
              ? "wallet-positive"
              : "wallet-negative";

          const statusClass =
            tx.status === "Completed"
              ? "wallet-completed"
              : "wallet-pending";


          return `

            <div
              style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
                padding:12px 0;
                border-bottom:1px solid rgba(255,255,255,.08);
              "
            >

              <div>

                <div
                  style="
                    font-weight:600;
                    font-size:14px;
                  "
                >
                  ${
                    isDeposit
                      ? "💵 "
                      : "💸 "
                  }${tx.type}
                </div>

                <div
                  style="
                    font-size:11px;
                    opacity:.5;
                    margin-top:4px;
                  "
                >
                  ${tx.date}
                </div>

                <div
                  class="${statusClass}"
                  style="
                    font-size:10px;
                    margin-top:4px;
                    font-weight:600;
                  "
                >
                  ${tx.status}
                </div>

              </div>


              <div
                class="${amountClass}"
                style="
                  font-weight:700;
                  white-space:nowrap;
                "
              >
                ${sign}$${formatMoney(amount)}
              </div>

            </div>

          `;

        })
        .join("");

  }


  /* =========================
     MODAL STYLE
     ========================= */

  function createModalStyle() {

    if (
      document.getElementById(
        "walletModalStyle"
      )
    ) return;

    const style =
      document.createElement("style");

    style.id =
      "walletModalStyle";

    style.textContent = `

      .wallet-modal-overlay {

        position:fixed;

        inset:0;

        background:
          rgba(0,0,0,.72);

        backdrop-filter:
          blur(8px);

        display:flex;

        align-items:center;

        justify-content:center;

        z-index:99999;

        padding:20px;

      }


      .wallet-modal {

        width:100%;

        max-width:380px;

        background:
          linear-gradient(
            145deg,
            #17171d,
            #0d0d12
          );

        border:
          1px solid
          rgba(255,255,255,.12);

        border-radius:22px;

        padding:22px;

        box-shadow:
          0 20px 70px
          rgba(0,0,0,.55);

      }


      .wallet-modal-title {

        font-size:20px;

        font-weight:800;

        margin-bottom:18px;

      }


      .wallet-modal-input {

        width:100%;

        box-sizing:border-box;

        background:
          rgba(255,255,255,.07);

        border:
          1px solid
          rgba(255,255,255,.12);

        color:white;

        border-radius:13px;

        padding:14px;

        font-size:17px;

        outline:none;

        margin-bottom:10px;

      }


      .wallet-modal-hint {

        font-size:12px;

        opacity:.55;

        margin-bottom:18px;

      }


      .wallet-modal-buttons {

        display:flex;

        gap:10px;

      }


      .wallet-modal-button {

        flex:1;

        border:none;

        border-radius:13px;

        padding:13px;

        font-size:14px;

        font-weight:700;

        cursor:pointer;

      }


      .wallet-modal-cancel {

        background:
          rgba(255,255,255,.08);

        color:white;

      }


      .wallet-modal-confirm {

        background:
          linear-gradient(
            135deg,
            #6c5ce7,
            #8e7dff
          );

        color:white;

      }

    `;

    document.head.appendChild(style);

  }


  /* =========================
     SHOW MODAL
     ========================= */

  function showAmountModal(
    mode
  ) {

    createModalStyle();

    const isDeposit =
      mode === "deposit";

    const overlay =
      document.createElement("div");

    overlay.className =
      "wallet-modal-overlay";

    overlay.innerHTML = `

      <div
        class="wallet-modal"
      >

        <div
          class="wallet-modal-title"
        >
          ${
            isDeposit
              ? "💵 " +
                walletText(
                  "depositTitle"
                )
              : "💸 " +
                walletText(
                  "withdrawTitle"
                )
          }
        </div>


        <input
          id="walletAmountInput"
          class="wallet-modal-input"
          type="number"
          inputmode="decimal"
          min="50"
          step="0.01"
          placeholder="50"
        />


        <div
          class="wallet-modal-hint"
        >
          ${
            isDeposit
              ? walletText(
                  "minimumDeposit"
                )
              : walletText(
                  "minimumWithdraw"
                )
          }

          ${
            !isDeposit
              ? "<br>Balance: $" +
                formatMoney(
                  walletData.balance
                )
              : ""
          }

        </div>


        <div
          class="wallet-modal-buttons"
        >

          <button
            class="
              wallet-modal-button
              wallet-modal-cancel
            "
            id="walletCancelButton"
          >
            ${walletText("cancel")}
          </button>


          <button
            class="
              wallet-modal-button
              wallet-modal-confirm
            "
            id="walletConfirmButton"
          >
            ${walletText("confirm")}
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    const input =
      document.getElementById(
        "walletAmountInput"
      );

    const cancel =
      document.getElementById(
        "walletCancelButton"
      );

    const confirm =
      document.getElementById(
        "walletConfirmButton"
      );


    function close() {

      overlay.remove();

    }


    cancel.onclick =
      close;


    overlay.onclick =
      function (event) {

        if (
          event.target === overlay
        ) {

          close();

        }

      };


    confirm.onclick =
      function () {

        const amount =
          Number(
            input.value
          );


        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {

          alert(
            walletText(
              "invalidAmount"
            )
          );

          return;

        }


        if (
          amount < 50
        ) {

          alert(

            isDeposit
              ? walletText(
                  "minimumDeposit"
                )
              : walletText(
                  "minimumWithdraw"
                )

          );

          return;

        }


        if (
          !isDeposit &&
          amount >
            walletData.balance
        ) {

          alert(
            walletText(
              "insufficient"
            )
          );

          return;

        }


        if (isDeposit) {

          walletData.balance +=
            amount;

          addTransaction(
            "Deposit",
            amount,
            "Completed"
          );

          saveWallet();

          renderWallet();

          alert(
            walletText(
              "depositSuccess"
            )
          );

        } else {

          walletData.balance -=
            amount;

          addTransaction(
            "Withdraw",
            amount,
            "Pending"
          );

          saveWallet();

          renderWallet();

          alert(
            walletText(
              "withdrawSuccess"
            )
          );

        }


        close();

      };


    setTimeout(
      function () {

        input.focus();

      },
      100
    );

  }


  /* =========================
     GLOBAL BUTTON FUNCTIONS
     ========================= */

  window.deposit =
    function () {

      if (!walletInitialized) {

        initWallet();

      }

      showAmountModal(
        "deposit"
      );

    };


  window.withdraw =
    function () {

      if (!walletInitialized) {

        initWallet();

      }

      showAmountModal(
        "withdraw"
      );

    };


  /* =========================
     RENDER WALLET
     ========================= */

  function renderWallet() {

    createHistoryBox();

    renderBalance();

    renderHistory();

  }


  /* =========================
     INIT WALLET
     ========================= */

  function initWallet() {

    if (
      typeof currentUser ===
      "undefined" ||
      !currentUser ||
      !currentUser.auth_id
    ) {

      return false;

    }


    loadWallet();

    renderWallet();

    walletInitialized = true;

    console.log(
      "TEST WALLET READY:",
      getWalletKey()
    );

    return true;

  }


  /* =========================
     WAIT FOR LOGIN
     ========================= */

  const walletTimer =
    setInterval(

      function () {

        if (
          initWallet()
        ) {

          clearInterval(
            walletTimer
          );

        }

      },

      500

    );


  setTimeout(

    function () {

      clearInterval(
        walletTimer
      );

    },

    30000

  );


})();
