/* =========================================================
   CRYSTAL PLATFORM - SUPABASE WALLET
   TEST MODE
   Minimum Deposit: $50
   Minimum Withdraw: $50
   ========================================================= */

(function () {

  let walletData = {
    balance: 0,
    transactions: []
  };

  let walletInitialized = false;
  let walletLoading = false;


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

        loading:
          "Ýüklenýär...",

        error:
          "Ýalňyşlyk ýüze çykdy. Täzeden synanyşyň."

      },

      ru: {

        history: "💳 История операций",
        testMode: "TEST MODE • Реальных денег нет",
        noTransactions: "Операций пока нет",

        depositTitle: "Пополнить",
        withdrawTitle: "Вывести",

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

        loading:
          "Загрузка...",

        error:
          "Произошла ошибка. Попробуйте снова."

      },

      en: {

        history: "💳 Transaction History",
        testMode: "TEST MODE • No real money involved",
        noTransactions: "No transactions yet",

        depositTitle: "Deposit",
        withdrawTitle: "Withdraw",

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

        loading:
          "Loading...",

        error:
          "Something went wrong. Please try again."

      }

    };

    return (
      texts[lang] &&
      texts[lang][key]
    ) || texts.en[key] || key;

  }


  /* =========================
     GET AUTH ID
     ========================= */

  function getAuthId() {

    try {

      if (
        typeof currentUser !== "undefined" &&
        currentUser &&
        currentUser.auth_id
      ) {

        return currentUser.auth_id;

      }

    } catch (e) {}

    return null;

  }


  /* =========================
     LOAD WALLET FROM SUPABASE
     ========================= */

  async function loadWallet() {

    const authId =
      getAuthId();

    if (!authId) return false;


    try {

      const {
        data,
        error
      } = await supabaseClient
        .from("wallets")
        .select(
          "balance,currency"
        )
        .eq(
          "auth_id",
          authId
        )
        .maybeSingle();


      if (error) {

        console.error(
          "Wallet load error:",
          error
        );

        return false;

      }


      if (!data) {

        const {
          data: newWallet,
          error: createError
        } = await supabaseClient
          .from("wallets")
          .insert({

            auth_id:
              authId,

            balance:
              0,

            currency:
              "USD"

          })
          .select(
            "balance,currency"
          )
          .single();


        if (createError) {

          console.error(
            "Wallet create error:",
            createError
          );

          return false;

        }


        walletData.balance =
          Number(
            newWallet.balance
          ) || 0;

      } else {

        walletData.balance =
          Number(
            data.balance
          ) || 0;

      }


      await loadTransactions();

      return true;

    } catch (error) {

      console.error(
        "Wallet error:",
        error
      );

      return false;

    }

  }


  /* =========================
     LOAD TRANSACTIONS
     ========================= */

  async function loadTransactions() {

    const authId =
      getAuthId();

    if (!authId) return;


    try {

      const {
        data,
        error
      } = await supabaseClient

        .from(
          "wallet_transactions"
        )

        .select(
          "id,type,amount,status,created_at"
        )

        .eq(
          "auth_id",
          authId
        )

        .order(
          "created_at",
          {
            ascending: false
          }
        )

        .limit(50);


      if (error) {

        console.error(
          "Transactions error:",
          error
        );

        return;

      }


      walletData.transactions =
        Array.isArray(data)
          ? data
          : [];

    } catch (error) {

      console.error(
        "Transaction load error:",
        error
      );

    }

  }


  /* =========================
     FORMAT MONEY
     ========================= */

  function formatMoney(amount) {

    return Number(
      amount || 0
    ).toFixed(2);

  }


  /* =========================
     FORMAT DATE
     ========================= */

  function formatDate(date) {

    try {

      return new Date(
        date
      ).toLocaleString();

    } catch (e) {

      return "";

    }

  }


  /* =========================
     RENDER BALANCE
     ========================= */

  function renderBalance() {

    const balanceElement =
      document.getElementById(
        "balance"
      );

    if (!balanceElement)
      return;

    balanceElement.textContent =
      formatMoney(
        walletData.balance
      );

  }


  /* =========================
     CREATE HISTORY BOX
     ========================= */

  function createHistoryBox() {

    const walletSection =
      document.getElementById(
        "wallet"
      );

    if (!walletSection)
      return;


    let historyBox =
      document.getElementById(
        "walletHistory"
      );


    if (historyBox)
      return;


    historyBox =
      document.createElement(
        "div"
      );

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

      <div
        id="walletTransactions"
      ></div>

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

    if (!container)
      return;


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
          ${walletText(
            "noTransactions"
          )}
        </div>

      `;

      return;

    }


    container.innerHTML =
      walletData.transactions
        .map(
          function (tx) {

            const amount =
              Number(
                tx.amount
              );


            const isDeposit =
              tx.type ===
              "Deposit";


            const sign =
              isDeposit
                ? "+"
                : "-";


            const statusClass =
              tx.status ===
              "Completed"

                ? "wallet-completed"

                : tx.status ===
                  "Rejected"

                  ? "wallet-rejected"

                  : "wallet-pending";


            return `

              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  gap:10px;
                  padding:12px 0;
                  border-bottom:
                    1px solid
                    rgba(255,255,255,.08);
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
                        ? "💵"
                        : "💸"
                    }
                    ${tx.type}
                  </div>


                  <div
                    style="
                      font-size:11px;
                      opacity:.5;
                      margin-top:4px;
                    "
                  >
                    ${formatDate(
                      tx.created_at
                    )}
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
                  style="
                    font-weight:700;
                    white-space:nowrap;
                  "
                >
                  ${sign}$
                  ${formatMoney(
                    amount
                  )}
                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =========================
     RENDER EVERYTHING
     ========================= */

  function renderWallet() {

    createHistoryBox();

    renderBalance();

    renderHistory();

  }


  /* =========================
     CREATE MODAL STYLE
     ========================= */

  function createModalStyle() {

    if (
      document.getElementById(
        "walletModalStyle"
      )
    ) return;


    const style =
      document.createElement(
        "style"
      );


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


    document.head.appendChild(
      style
    );

  }


  /* =========================
     SHOW AMOUNT MODAL
     ========================= */

  function showAmountModal(
    mode
  ) {

    createModalStyle();


    const isDeposit =
      mode === "deposit";


    const overlay =
      document.createElement(
        "div"
      );


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
          event.target ===
          overlay
        ) {

          close();

        }

      };


    confirm.onclick =
      async function () {

        const amount =
          Number(
            input.value
          );


        if (
          !Number.isFinite(
            amount
          ) ||
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


        confirm.disabled =
          true;

        confirm.textContent =
          walletText(
            "loading"
          );


        try {

          const functionName =
            isDeposit
              ? "test_deposit"
              : "test_withdraw";


          const {
            data,
            error
          } =
            await supabaseClient
              .rpc(
                functionName,
                {
                  p_amount:
                    amount
                }
              );


          if (error) {

            console.error(
              "Wallet RPC error:",
              error
            );

            const message =
              String(
                error.message ||
                ""
              );


            if (
              message
                .toLowerCase()
                .includes(
                  "insufficient"
                )
            ) {

              alert(
                walletText(
                  "insufficient"
                )
              );

            } else {

              alert(
                walletText(
                  "error"
                )
              );

            }


            confirm.disabled =
              false;

            confirm.textContent =
              walletText(
                "confirm"
              );

            return;

          }


          if (
            data &&
            data.balance !==
              undefined
          ) {

            walletData.balance =
              Number(
                data.balance
              ) || 0;

          }


          await loadTransactions();

          renderWallet();

          alert(
            isDeposit

              ? walletText(
                  "depositSuccess"
                )

              : walletText(
                  "withdrawSuccess"
                )
          );


          close();

        } catch (error) {

          console.error(
            "Wallet transaction error:",
            error
          );

          alert(
            walletText(
              "error"
            )
          );


          confirm.disabled =
            false;

          confirm.textContent =
            walletText(
              "confirm"
            );

        }

      };


    setTimeout(
      function () {

        input.focus();

      },
      100
    );

  }


  /* =========================
     GLOBAL DEPOSIT
     ========================= */

  window.deposit =
    function () {

      if (
        !walletInitialized
      ) {

        initWallet();

      }


      showAmountModal(
        "deposit"
      );

    };


  /* =========================
     GLOBAL WITHDRAW
     ========================= */

  window.withdraw =
    function () {

      if (
        !walletInitialized
      ) {

        initWallet();

      }


      showAmountModal(
        "withdraw"
      );

    };


  /* =========================
     INIT WALLET
     ========================= */

  async function initWallet() {

    if (
      walletInitialized ||
      walletLoading
    ) {

      return;

    }


    const authId =
      getAuthId();


    if (!authId) {

      return;

    }


    walletLoading =
      true;


    const success =
      await loadWallet();


    if (success) {

      renderWallet();

      walletInitialized =
        true;

      console.log(
        "SUPABASE WALLET READY:",
        authId
      );

    }


    walletLoading =
      false;

  }


  /* =========================
     WAIT FOR LOGIN
     ========================= */

  const walletTimer =
    setInterval(

      function () {

        if (
          getAuthId()
        ) {

          initWallet();

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
