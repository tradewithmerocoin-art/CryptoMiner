/* =========================================================
   CRYSTAL PLATFORM - SIMPLE USDT WALLET
   SUPABASE + LOCALSTORAGE HISTORY FALLBACK

   Deposit:
   Network -> Address -> Amount -> Confirm -> Pending

   Withdraw:
   Network -> Address -> Amount -> Confirm -> Pending

   IMPORTANT:
   - Deposit does NOT automatically increase balance.
   - Withdraw does NOT automatically send money.
   - Owner manually verifies and processes transactions.
========================================================= */

(function () {

  const MIN_AMOUNT = 50;

  const USDT_NETWORKS = {

    TRC20: {
      name: "TRC20",
      chain: "TRON",
      address: "TC3M9Eq18snE7HRnayyyyfYJ5nLcCx7ceQ"
    },

    BEP20: {
      name: "BEP20",
      chain: "BNB Smart Chain",
      address: "0x506996BE51a2B1d0e61390221366320151bF80b5"
    },

    ERC20: {
      name: "ERC20",
      chain: "Ethereum",
      address: "0x506996BE51a2B1d0e61390221366320151bF80b5"
    }

  };


  let walletInitialized = false;

  let walletBalance = 0;

  let walletTransactions = [];

  let historyUsingLocalStorage = false;


  /* =========================================================
     LANGUAGE
  ========================================================= */

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

        noTransactions:
          "Häzirlikçe hereket ýok",

        depositTitle:
          "💵 USDT Deposit",

        withdrawTitle:
          "💸 USDT Withdraw",

        amount:
          "Mukdar",

        network:
          "Tor",

        address:
          "USDT salgysy",

        selectNetwork:
          "Tor saýlaň",

        cancel:
          "Ýatyr",

        confirm:
          "Tassykla",

        copy:
          "Göçür",

        copied:
          "Göçürildi ✓",

        minimumDeposit:
          "Iň az Deposit: $50",

        minimumWithdraw:
          "Iň az Withdraw: $50",

        invalidAmount:
          "Dogry mukdar giriziň.",

        insufficient:
          "Balans ýeterlik däl.",

        depositCreated:
          "Deposit haýyşy döredildi. Töleg barlanandan soň balansyňyz artdyrylar.",

        withdrawCreated:
          "Withdraw haýyşy döredildi. Tassyklanandan soň töleg iberiler.",

        invalidAddress:
          "USDT wallet salgysyny giriziň.",

        completed:
          "Completed",

        pending:
          "Pending",

        rejected:
          "Rejected",

        deposit:
          "Deposit",

        withdraw:
          "Withdraw",

        available:
          "Elýeterli balans",

        warning:
          "⚠️ Diňe saýlanan tor arkaly USDT iberiň. Nädogry tor ulanylsa, pul ýitip biler.",

        authError:
          "Login maglumatyny alyp bolmady.",

        walletError:
          "Wallet maglumatyny alyp bolmady."

      },


      ru: {

        history:
          "💳 История операций",

        noTransactions:
          "Операций пока нет",

        depositTitle:
          "💵 USDT Deposit",

        withdrawTitle:
          "💸 USDT Withdraw",

        amount:
          "Сумма",

        network:
          "Сеть",

        address:
          "USDT адрес",

        selectNetwork:
          "Выберите сеть",

        cancel:
          "Отмена",

        confirm:
          "Подтвердить",

        copy:
          "Копировать",

        copied:
          "Скопировано ✓",

        minimumDeposit:
          "Минимальный Deposit: $50",

        minimumWithdraw:
          "Минимальный Withdraw: $50",

        invalidAmount:
          "Введите правильную сумму.",

        insufficient:
          "Недостаточно средств.",

        depositCreated:
          "Запрос на Deposit создан. Баланс будет увеличен после проверки платежа.",

        withdrawCreated:
          "Запрос на Withdraw создан. После подтверждения платёж будет отправлен.",

        invalidAddress:
          "Введите USDT адрес.",

        completed:
          "Completed",

        pending:
          "Pending",

        rejected:
          "Rejected",

        deposit:
          "Deposit",

        withdraw:
          "Withdraw",

        available:
          "Доступный баланс",

        warning:
          "⚠️ Отправляйте USDT только через выбранную сеть. Неправильная сеть может привести к потере средств.",

        authError:
          "Не удалось получить данные входа.",

        walletError:
          "Не удалось получить данные кошелька."

      },


      en: {

        history:
          "💳 Transaction History",

        noTransactions:
          "No transactions yet",

        depositTitle:
          "💵 USDT Deposit",

        withdrawTitle:
          "💸 USDT Withdraw",

        amount:
          "Amount",

        network:
          "Network",

        address:
          "USDT Address",

        selectNetwork:
          "Select network",

        cancel:
          "Cancel",

        confirm:
          "Confirm",

        copy:
          "Copy",

        copied:
          "Copied ✓",

        minimumDeposit:
          "Minimum Deposit: $50",

        minimumWithdraw:
          "Minimum Withdraw: $50",

        invalidAmount:
          "Enter a valid amount.",

        insufficient:
          "Insufficient balance.",

        depositCreated:
          "Deposit request created. Your balance will increase after payment verification.",

        withdrawCreated:
          "Withdrawal request created. The payment will be sent after approval.",

        invalidAddress:
          "Enter a USDT wallet address.",

        completed:
          "Completed",

        pending:
          "Pending",

        rejected:
          "Rejected",

        deposit:
          "Deposit",

        withdraw:
          "Withdraw",

        available:
          "Available balance",

        warning:
          "⚠️ Send USDT only through the selected network. Using the wrong network may result in loss of funds.",

        authError:
          "Could not get authentication data.",

        walletError:
          "Could not load wallet data."

      }

    };

    return (
      texts[lang] &&
      texts[lang][key]
    ) || texts.en[key] || key;

  }


  /* =========================================================
     AUTH
  ========================================================= */

  async function getAuthId() {

    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.getUser();

      if (error) {

        console.error(
          "AUTH USER ERROR:",
          error
        );

        return null;

      }

      if (
        data &&
        data.user &&
        data.user.id
      ) {

        return data.user.id;

      }

    } catch (error) {

      console.error(
        "AUTH USER EXCEPTION:",
        error
      );

    }

    return null;

  }


  /* =========================================================
     LOCAL STORAGE KEY
  ========================================================= */

  function getLocalHistoryKey(authId) {

    if (!authId) {
      return null;
    }

    return "crypto_wallet_history_" + authId;

  }


  /* =========================================================
     LOCAL STORAGE SAVE
  ========================================================= */

  function saveLocalHistory() {

    try {

      const authId =
        walletTransactions.length
          ? walletTransactions[0].auth_id
          : null;

      if (!authId) {
        return;
      }

      const key =
        getLocalHistoryKey(authId);

      if (!key) {
        return;
      }

      localStorage.setItem(
        key,
        JSON.stringify(
          walletTransactions
        )
      );

    } catch (error) {

      console.error(
        "LOCAL HISTORY SAVE ERROR:",
        error
      );

    }

  }


  /* =========================================================
     LOCAL STORAGE LOAD
  ========================================================= */

  async function loadLocalHistory(authId) {

    try {

      const key =
        getLocalHistoryKey(authId);

      if (!key) {
        return [];
      }

      const saved =
        localStorage.getItem(key);

      if (!saved) {
        return [];
      }

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(parsed)
      ) {

        return parsed;

      }

    } catch (error) {

      console.error(
        "LOCAL HISTORY LOAD ERROR:",
        error
      );

    }

    return [];

  }


  /* =========================================================
     MONEY
  ========================================================= */

  function formatMoney(amount) {

    return Number(amount || 0)
      .toFixed(2);

  }


  /* =========================================================
     WALLET
  ========================================================= */

  async function ensureWallet() {

  const authId = await getAuthId();

  if (!authId) {
    console.error("AUTH ID NOT FOUND");
    return false;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("wallets")
    .select("balance")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) {

    console.error(
      "WALLETS BALANCE LOAD ERROR:",
      error
    );

    return false;
  }

  if (!data) {

    console.log(
      "No wallet found for this auth_id:",
      authId
    );

    walletBalance = 0;

    return true;
  }

  /*
   * IMPORTANT:
   * Balance comes ONLY from public.wallets.balance
   */
  walletBalance =
    Number(data.balance || 0);

  console.log(
    "BALANCE FROM wallets:",
    walletBalance
  );

  return true;
  }


  /* =========================================================
     LOAD SUPABASE TRANSACTIONS
  ========================================================= */

  async function loadTransactions() {

    const authId =
      await getAuthId();

    if (!authId) {

      return false;

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("wallet_transactions")
        .select(
          "id, auth_id, type, amount, status, network, wallet_address, created_at"
        )
        .eq("auth_id", authId)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(50);


    if (error) {

      console.error(
        "TRANSACTION LOAD ERROR:",
        error
      );


      console.log(
        "Using LOCAL STORAGE history..."
      );


      const localHistory =
        await loadLocalHistory(
          authId
        );


      walletTransactions =
        localHistory;

      historyUsingLocalStorage =
        true;


      return true;

    }


    walletTransactions =
      data || [];


    historyUsingLocalStorage =
      false;


    /*
     * Supabase works.
     * Save a copy locally as backup.
     */

    if (
      walletTransactions.length
    ) {

      saveLocalHistory();

    }


    console.log(
      "WALLET TRANSACTIONS:",
      walletTransactions
    );


    console.log(
      "HISTORY COUNT:",
      walletTransactions.length
    );


    return true;

  }


  /* =========================================================
     PENDING WITHDRAW
  ========================================================= */

  function getPendingWithdrawTotal() {

    return walletTransactions

      .filter(function (tx) {

        return (
          tx.type === "Withdraw" &&
          tx.status === "Pending"
        );

      })

      .reduce(
        function (total, tx) {

          return (
            total +
            Number(
              tx.amount || 0
            )
          );

        },
        0
      );

  }


  function getAvailableBalance() {

  return Math.max(
    0,
    Number(walletBalance || 0)
  );

  }


  /* =========================================================
     BALANCE
  ========================================================= */

  function renderBalance() {

  const element =
    document.getElementById("balance");

  if (!element) {
    return;
  }

  element.innerText =
    Number(walletBalance || 0).toFixed(2);

  }

  /* =========================================================
     HISTORY BOX
  ========================================================= */

  function createHistoryBox() {

    const walletSection =
      document.getElementById(
        "wallet"
      );


    if (!walletSection) {

      console.error(
        "WALLET SECTION NOT FOUND"
      );

      return;

    }


    let box =
      document.getElementById(
        "walletHistory"
      );


    if (box) {

      return;

    }


    box =
      document.createElement(
        "div"
      );


    box.id =
      "walletHistory";


    box.className =
      "card wallet-history-card";


    box.style.display =
      "block";

    box.style.width =
      "100%";

    box.style.marginTop =
      "18px";

    box.style.visibility =
      "visible";

    box.style.opacity =
      "1";


    box.innerHTML = `

      <div
        style="
          font-size:20px;
          font-weight:800;
          margin-bottom:14px;
        "
      >
        ${walletText("history")}
      </div>

      <div
        id="walletHistoryMode"
        style="
          font-size:11px;
          opacity:.45;
          margin-bottom:10px;
        "
      ></div>

      <div
        id="walletTransactions"
      ></div>

    `;


    /*
     * Same placement as the old
     * working TEST WALLET.
     */

    const cards =
      walletSection.querySelectorAll(
        ".card"
      );


    if (
      cards.length > 0
    ) {

      cards[0].insertAdjacentElement(
        "afterend",
        box
      );

    } else {

      walletSection.appendChild(
        box
      );

    }

  }


  /* =========================================================
     HISTORY RENDER
  ========================================================= */

  function renderHistory() {

    createHistoryBox();


    const container =
      document.getElementById(
        "walletTransactions"
      );


    if (!container) {

      console.error(
        "WALLET TRANSACTIONS CONTAINER NOT FOUND"
      );

      return;

    }


    const modeElement =
      document.getElementById(
        "walletHistoryMode"
      );


    if (modeElement) {

      modeElement.innerText =
        historyUsingLocalStorage
          ? "LOCAL HISTORY"
          : "SUPABASE HISTORY";

    }


    if (
      !walletTransactions.length
    ) {

      container.innerHTML = `

        <div
          style="
            text-align:center;
            opacity:.5;
            padding:20px 5px;
            font-size:13px;
          "
        >
          ${walletText(
            "noTransactions"
          )}
        </div>

      `;

      return;

    }


    container.innerHTML =
      walletTransactions
        .map(
          function (tx) {

            const isDeposit =
              tx.type === "Deposit";


            const sign =
              isDeposit
                ? "+"
                : "-";


            const amountClass =
              isDeposit
                ? "wallet-positive"
                : "wallet-negative";


            let statusClass =
              "wallet-pending";


            if (
              tx.status ===
              "Completed"
            ) {

              statusClass =
                "wallet-completed";

            }


            if (
              tx.status ===
              "Rejected"
            ) {

              statusClass =
                "wallet-rejected";

            }


            const network =
              tx.network
                ? " • " +
                  tx.network
                : "";


            let date = "";


            if (
              tx.created_at
            ) {

              date =
                new Date(
                  tx.created_at
                ).toLocaleString();

            } else if (
              tx.date
            ) {

              date =
                tx.date;

            }


            return `

              <div
                style="
                  padding:14px 0;
                  border-bottom:
                    1px solid
                    rgba(255,255,255,.08);
                "
              >

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:12px;
                  "
                >

                  <div>

                    <div
                      style="
                        font-weight:800;
                        font-size:14px;
                      "
                    >

                      ${
                        isDeposit
                          ? "💵"
                          : "💸"
                      }

                      ${tx.type}${network}

                    </div>


                    <div
                      style="
                        font-size:11px;
                        opacity:.5;
                        margin-top:5px;
                      "
                    >
                      ${date}
                    </div>


                    <div
                      class="${statusClass}"
                      style="
                        font-size:11px;
                        font-weight:800;
                        margin-top:6px;
                      "
                    >
                      ${tx.status}
                    </div>

                  </div>


                  <div
                    class="${amountClass}"
                    style="
                      font-size:15px;
                      font-weight:900;
                      white-space:nowrap;
                    "
                  >
                    ${sign}$${formatMoney(
                      tx.amount
                    )}
                  </div>

                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =========================================================
     STYLES
  ========================================================= */

  function createStyles() {

    if (
      document.getElementById(
        "realWalletStyle"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "realWalletStyle";


    style.textContent = `

      .wallet-modal-overlay {

        position:fixed;
        inset:0;

        background:
          rgba(0,0,0,.78);

        backdrop-filter:
          blur(10px);

        display:flex;

        align-items:center;
        justify-content:center;

        padding:18px;

        z-index:999999;

      }


      .wallet-modal {

        width:100%;
        max-width:410px;

        max-height:
          calc(100vh - 36px);

        overflow-y:auto;

        background:
          linear-gradient(
            145deg,
            #151925,
            #090c14
          );

        border:
          1px solid
          rgba(255,255,255,.12);

        border-radius:24px;

        padding:21px;

        box-shadow:
          0 25px 80px
          rgba(0,0,0,.65);

      }


      .wallet-modal-title {

        font-size:21px;
        font-weight:900;

        margin-bottom:18px;

      }


      .wallet-label {

        display:block;

        font-size:12px;

        color:#94a3b8;

        font-weight:700;

        margin-bottom:7px;

      }


      .wallet-input,
      .wallet-select {

        width:100%;

        box-sizing:border-box;

        padding:14px;

        border-radius:14px;

        border:
          1px solid
          #334155;

        background:
          #0b1220;

        color:white;

        outline:none;

        font-size:15px;

        margin-bottom:13px;

      }


      .wallet-select option {

        background:#0b1220;
        color:white;

      }


      .wallet-address-box {

        padding:13px;

        border-radius:14px;

        background:
          rgba(37,99,235,.10);

        border:
          1px solid
          rgba(96,165,250,.18);

        margin-bottom:12px;

      }


      .wallet-address {

        word-break:break-all;

        font-size:12px;

        line-height:1.5;

        margin-top:7px;

        color:#e2e8f0;

      }


      .wallet-copy {

        width:100%;

        padding:10px;

        border:0;

        border-radius:11px;

        background:#1e293b;

        color:white;

        margin-top:10px;

        font-weight:700;

        font-size:12px;

      }


      .wallet-warning {

        padding:12px;

        border-radius:13px;

        background:
          rgba(245,158,11,.08);

        border:
          1px solid
          rgba(245,158,11,.18);

        color:#fcd34d;

        font-size:11px;

        line-height:1.5;

        margin-bottom:14px;

      }


      .wallet-available {

        padding:11px 13px;

        background:
          rgba(34,197,94,.08);

        border:
          1px solid
          rgba(34,197,94,.16);

        border-radius:13px;

        margin-bottom:14px;

        font-size:12px;

      }


      .wallet-buttons {

        display:flex;

        gap:10px;

        margin-top:5px;

      }


      .wallet-button {

        flex:1;

        padding:14px;

        border:0;

        border-radius:14px;

        font-weight:800;

        font-size:14px;

      }


      .wallet-cancel {

        background:#1e293b;
        color:white;

      }


      .wallet-confirm {

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );

        color:white;

      }


      .wallet-positive {

        color:#4ade80;

      }


      .wallet-negative {

        color:#f87171;

      }


      .wallet-pending {

        color:#fbbf24;

      }


      .wallet-completed {

        color:#4ade80;

      }


      .wallet-rejected {

        color:#f87171;

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =========================================================
     COPY ADDRESS
  ========================================================= */

  window.copyWalletAddress =
    async function () {

      const element =
        document.getElementById(
          "walletDepositAddress"
        );


      if (!element) {
        return;
      }


      try {

        await navigator.clipboard.writeText(
          element.innerText
        );


        const button =
          document.getElementById(
            "walletCopyButton"
          );


        if (button) {

          button.innerText =
            walletText("copied");


          setTimeout(
            function () {

              button.innerText =
                walletText("copy");

            },
            1500
          );

        }

      } catch (error) {

        alert(
          element.innerText
        );

      }

    };


  /* =========================================================
     DEPOSIT
  ========================================================= */

  function showDepositModal() {

    createStyles();


    const overlay =
      document.createElement(
        "div"
      );


    overlay.className =
      "wallet-modal-overlay";


    overlay.innerHTML = `

      <div class="wallet-modal">

        <div class="wallet-modal-title">
          ${walletText(
            "depositTitle"
          )}
        </div>


        <label class="wallet-label">
          ${walletText(
            "network"
          )}
        </label>


        <select
          id="walletDepositNetwork"
          class="wallet-select"
        >

          <option value="">
            ${walletText(
              "selectNetwork"
            )}
          </option>

          <option value="TRC20">
            TRC20 • TRON
          </option>

          <option value="BEP20">
            BEP20 • BNB Smart Chain
          </option>

          <option value="ERC20">
            ERC20 • Ethereum
          </option>

        </select>


        <div
          id="walletDepositAddressBox"
          style="display:none;"
        >

          <div class="wallet-address-box">

            <div class="wallet-label">
              ${walletText(
                "address"
              )}
            </div>


            <div
              id="walletDepositAddress"
              class="wallet-address"
            ></div>


            <button
              id="walletCopyButton"
              class="wallet-copy"
              type="button"
            >
              ${walletText(
                "copy"
              )}
            </button>

          </div>


          <div class="wallet-warning">
            ${walletText(
              "warning"
            )}
          </div>

        </div>


        <label class="wallet-label">
          ${walletText(
            "amount"
          )}
        </label>


        <input
          id="walletDepositAmount"
          class="wallet-input"
          type="number"
          inputmode="decimal"
          min="50"
          step="0.01"
          placeholder="50"
        />


        <div class="wallet-buttons">

          <button
            id="walletDepositCancel"
            class="wallet-button wallet-cancel"
            type="button"
          >
            ${walletText(
              "cancel"
            )}
          </button>


          <button
            id="walletDepositConfirm"
            class="wallet-button wallet-confirm"
            type="button"
          >
            ${walletText(
              "confirm"
            )}
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    const networkSelect =
      document.getElementById(
        "walletDepositNetwork"
      );


    const addressBox =
      document.getElementById(
        "walletDepositAddressBox"
      );


    const address =
      document.getElementById(
        "walletDepositAddress"
      );


    networkSelect.onchange =
      function () {

        const network =
          USDT_NETWORKS[
            this.value
          ];


        if (!network) {

          addressBox.style.display =
            "none";

          return;

        }


        address.innerText =
          network.address;


        addressBox.style.display =
          "block";

      };


    document.getElementById(
      "walletCopyButton"
    ).onclick =
      window.copyWalletAddress;


    function close() {

      overlay.remove();

    }


    document.getElementById(
      "walletDepositCancel"
    ).onclick =
      close;


    overlay.onclick =
      function (event) {

        if (
          event.target === overlay
        ) {

          close();

        }

      };


    document.getElementById(
      "walletDepositConfirm"
    ).onclick =
      async function () {

        const button =
          this;


        const network =
          networkSelect.value;


        const amount =
          Number(
            document.getElementById(
              "walletDepositAmount"
            ).value
          );


        if (!network) {

          alert(
            walletText(
              "selectNetwork"
            )
          );

          return;

        }


        if (
          !Number.isFinite(amount) ||
          amount < MIN_AMOUNT
        ) {

          alert(
            walletText(
              "minimumDeposit"
            )
          );

          return;

        }


        const authId =
          await getAuthId();


        if (!authId) {

          alert(
            walletText(
              "authError"
            )
          );

          return;

        }


        button.disabled =
          true;


        const transaction = {

          auth_id:
            authId,

          type:
            "Deposit",

          amount:
            amount,

          status:
            "Pending",

          network:
            network,

          wallet_address:
            USDT_NETWORKS[
              network
            ].address

        };


        const {
          data,
          error
        } =
          await supabaseClient
            .from(
              "wallet_transactions"
            )
            .insert(
              transaction
            )
            .select(
              "id, auth_id, type, amount, status, network, wallet_address, created_at"
            )
            .single();


        if (error) {

          button.disabled =
            false;


          console.error(
            "DEPOSIT REQUEST ERROR:",
            error
          );


          alert(
            error.message ||
            "Deposit request failed."
          );

          return;

        }


        /*
         * Add the newly created transaction
         * to local backup immediately.
         */

        walletTransactions =
          [
            data,
            ...walletTransactions
          ];


        historyUsingLocalStorage =
          false;


        saveLocalHistory();


        renderHistory();


        button.disabled =
          false;


        close();


        alert(
          walletText(
            "depositCreated"
          )
        );

      };

  }


  /* =========================================================
     WITHDRAW
  ========================================================= */

  function showWithdrawModal() {

    createStyles();


    const available =
      getAvailableBalance();


    if (
      available <
      MIN_AMOUNT
    ) {

      alert(
        walletText(
          "insufficient"
        )
      );

      return;

    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.className =
      "wallet-modal-overlay";


    overlay.innerHTML = `

      <div class="wallet-modal">

        <div class="wallet-modal-title">
          ${walletText(
            "withdrawTitle"
          )}
        </div>


        <div class="wallet-available">

          ${walletText(
            "available"
          )}:

          <b>
            $${formatMoney(
              available
            )}
          </b>

        </div>


        <label class="wallet-label">
          ${walletText(
            "network"
          )}
        </label>


        <select
          id="walletWithdrawNetwork"
          class="wallet-select"
        >

          <option value="">
            ${walletText(
              "selectNetwork"
            )}
          </option>

          <option value="TRC20">
            TRC20 • TRON
          </option>

          <option value="BEP20">
            BEP20 • BNB Smart Chain
          </option>

          <option value="ERC20">
            ERC20 • Ethereum
          </option>

        </select>


        <label class="wallet-label">
          ${walletText(
            "address"
          )}
        </label>


        <input
          id="walletWithdrawAddress"
          class="wallet-input"
          type="text"
          placeholder="USDT wallet address"
          autocomplete="off"
        />


        <label class="wallet-label">
          ${walletText(
            "amount"
          )}
        </label>


        <input
          id="walletWithdrawAmount"
          class="wallet-input"
          type="number"
          inputmode="decimal"
          min="50"
          step="0.01"
          placeholder="50"
        />


        <div class="wallet-buttons">

          <button
            id="walletWithdrawCancel"
            class="wallet-button wallet-cancel"
            type="button"
          >
            ${walletText(
              "cancel"
            )}
          </button>


          <button
            id="walletWithdrawConfirm"
            class="wallet-button wallet-confirm"
            type="button"
          >
            ${walletText(
              "confirm"
            )}
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    function close() {

      overlay.remove();

    }


    document.getElementById(
      "walletWithdrawCancel"
    ).onclick =
      close;


    overlay.onclick =
      function (event) {

        if (
          event.target === overlay
        ) {

          close();

        }

      };


    document.getElementById(
      "walletWithdrawConfirm"
    ).onclick =
      async function () {

        const button =
          this;


        const network =
          document.getElementById(
            "walletWithdrawNetwork"
          ).value;


        const address =
          document.getElementById(
            "walletWithdrawAddress"
          ).value.trim();


        const amount =
          Number(
            document.getElementById(
              "walletWithdrawAmount"
            ).value
          );


        if (!network) {

          alert(
            walletText(
              "selectNetwork"
            )
          );

          return;

        }


        if (!address) {

          alert(
            walletText(
              "invalidAddress"
            )
          );

          return;

        }


        if (
          !Number.isFinite(amount) ||
          amount < MIN_AMOUNT
        ) {

          alert(
            walletText(
              "minimumWithdraw"
            )
          );

          return;

        }


        const currentAvailable =
          getAvailableBalance();


        if (
          amount >
          currentAvailable
        ) {

          alert(
            walletText(
              "insufficient"
            )
          );

          return;

        }


        const authId =
          await getAuthId();


        if (!authId) {

          alert(
            walletText(
              "authError"
            )
          );

          return;

        }


        button.disabled =
          true;


        const transaction = {

          auth_id:
            authId,

          type:
            "Withdraw",

          amount:
            amount,

          status:
            "Pending",

          network:
            network,

          wallet_address:
            address

        };


        const {
          data,
          error
        } =
          await supabaseClient
            .from(
              "wallet_transactions"
            )
            .insert(
              transaction
            )
            .select(
              "id, auth_id, type, amount, status, network, wallet_address, created_at"
            )
            .single();


        if (error) {

          button.disabled =
            false;


          console.error(
            "WITHDRAW REQUEST ERROR:",
            error
          );


          alert(
            error.message ||
            "Withdrawal request failed."
          );

          return;

        }


        walletTransactions =
          [
            data,
            ...walletTransactions
          ];


        historyUsingLocalStorage =
          false;


        saveLocalHistory();


        renderHistory();


        button.disabled =
          false;


        close();


        alert(
          walletText(
            "withdrawCreated"
          )
        );

      };

  }


  /* =========================================================
     GLOBAL BUTTONS
  ========================================================= */

  window.deposit =
    async function () {

      if (
        !walletInitialized
      ) {

        await initWallet();

      }

      showDepositModal();

    };


  window.withdraw =
    async function () {

      if (
        !walletInitialized
      ) {

        await initWallet();

      }

      showWithdrawModal();

    };


  /* =========================================================
     RENDER
  ========================================================= */

  function renderWallet() {

    createHistoryBox();

    renderBalance();

    renderHistory();

  }


  /* =========================================================
     INIT
  ========================================================= */

  async function initWallet() {

    if (
      walletInitialized
    ) {

      return true;

    }


    const authId =
      await getAuthId();


    if (!authId) {

      return false;

    }


    const walletReady =
      await ensureWallet();


    if (!walletReady) {

      return false;

    }


    const transactionsReady =
      await loadTransactions();


    if (!transactionsReady) {

      return false;

    }


    renderWallet();


    walletInitialized =
      true;


    console.log(
      "SIMPLE USDT WALLET READY"
    );


    console.log(
      "HISTORY COUNT:",
      walletTransactions.length
    );


    return true;

  }


  /* =========================================================
     WAIT FOR LOGIN
  ========================================================= */

  const walletTimer =
    setInterval(
      async function () {

        const ready =
          await initWallet();


        if (ready) {

          clearInterval(
            walletTimer
          );

        }

      },
      800
    );


  setTimeout(
    function () {

      clearInterval(
        walletTimer
      );

    },
    30000
  );


  /* =========================================================
     REFRESH
  ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      setTimeout(
        async function () {

          if (
            !walletInitialized
          ) {

            await initWallet();

          } else {

            await loadTransactions();

            renderWallet();

          }

        },
        1200
      );

    }
  );


})();
