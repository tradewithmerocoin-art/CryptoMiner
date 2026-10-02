/* =========================================================
   CRYSTAL PLATFORM - REAL USDT WALLET
   Networks:
   TRC20
   BEP20
   ERC20

   Minimum Deposit: $50
   Minimum Withdraw: $50

   IMPORTANT:
   - Deposit does NOT automatically increase balance.
   - Withdraw does NOT automatically send crypto.
   - Both create Pending transactions in Supabase.
   - Balance is changed only after manual verification.
========================================================= */

(function () {

  const MIN_AMOUNT = 50;

  const USDT_NETWORKS = {

    TRC20: {
      name: "TRC20",
      chain: "TRON",
      address:
        "TC3M9Eq18snE7HRnayyyyfYJ5nLcCx7ceQ"
    },

    BEP20: {
      name: "BEP20",
      chain: "BNB Smart Chain",
      address:
        "0x506996BE51a2B1d0e61390221366320151bF80b5"
    },

    ERC20: {
      name: "ERC20",
      chain: "Ethereum",
      address:
        "0x506996BE51a2B1d0e61390221366320151bF80b5"
    }

  };


  let walletInitialized = false;
  let walletBalance = 0;
  let walletTransactions = [];


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

        history:
          "💳 Töleg taryhy",

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

        transactionHash:
          "Transaction Hash",

        transactionHashHint:
          "Töleg edeniňizden soň transaction hash-i giriziň.",

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

        pendingWithdraw:
          "Garaşylýan Withdraw bar. Balansyňyzdan artyk çykaryp bilmersiňiz.",

        depositCreated:
          "Deposit haýyşy döredildi. Töleg barlanandan soň balansyňyz artdyrylar.",

        withdrawCreated:
          "Withdraw haýyşy döredildi. Tassyklanandan soň töleg iberiler.",

        invalidAddress:
          "USDT wallet salgysyny giriziň.",

        invalidHash:
          "Transaction Hash giriziň.",

        depositInstruction:
          "Aşakdaky salgy diňe saýlanan tor üçin USDT kabul edýär.",

        withdrawInstruction:
          "USDT haýsy salgyňyza iberilmelidigini giriziň.",

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
          "⚠️ Diňe saýlanan tor arkaly USDT iberiň. Nädogry tor ulanylsa, pul ýitip biler."

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

        transactionHash:
          "Transaction Hash",

        transactionHashHint:
          "После оплаты введите transaction hash.",

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

        pendingWithdraw:
          "Есть ожидающий Withdraw. Нельзя вывести больше доступного баланса.",

        depositCreated:
          "Запрос на Deposit создан. Баланс будет увеличен после проверки платежа.",

        withdrawCreated:
          "Запрос на Withdraw создан. После подтверждения платёж будет отправлен.",

        invalidAddress:
          "Введите USDT адрес.",

        invalidHash:
          "Введите Transaction Hash.",

        depositInstruction:
          "Этот адрес принимает USDT только через выбранную сеть.",

        withdrawInstruction:
          "Введите адрес, на который нужно отправить USDT.",

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
          "⚠️ Отправляйте USDT только через выбранную сеть. Неправильная сеть может привести к потере средств."

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

        transactionHash:
          "Transaction Hash",

        transactionHashHint:
          "Enter the transaction hash after making the payment.",

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

        pendingWithdraw:
          "You already have a pending withdrawal. You cannot request more than your available balance.",

        depositCreated:
          "Deposit request created. Your balance will increase after payment verification.",

        withdrawCreated:
          "Withdrawal request created. The payment will be sent after approval.",

        invalidAddress:
          "Enter a USDT wallet address.",

        invalidHash:
          "Enter the transaction hash.",

        depositInstruction:
          "This address accepts USDT only through the selected network.",

        withdrawInstruction:
          "Enter the address where you want to receive USDT.",

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
          "⚠️ Send USDT only through the selected network. Using the wrong network may result in loss of funds."

      }

    };

    return (
      texts[lang] &&
      texts[lang][key]
    ) ||
    texts.en[key] ||
    key;

  }


  /* =========================================================
     CURRENT USER
  ========================================================= */

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


  /* =========================================================
     FORMAT
  ========================================================= */

  function formatMoney(amount) {

    return Number(amount || 0)
      .toFixed(2);

  }


  /* =========================================================
     WALLET ROW
  ========================================================= */

  async function ensureWallet() {

    const authId =
      getAuthId();

    if (!authId)
      return false;


    const { data, error } =
      await supabaseClient
        .from("wallets")
        .select("*")
        .eq(
          "auth_id",
          authId
        )
        .maybeSingle();


    if (error) {

      console.error(
        "WALLET LOAD ERROR:",
        error
      );

      return false;

    }


    if (data) {

      walletBalance =
        Number(data.balance || 0);

      return true;

    }


    const { data:newWallet, error:createError } =
      await supabaseClient
        .from("wallets")
        .insert({

          auth_id:
            authId,

          balance:
            0,

          currency:
            "USD"

        })
        .select()
        .single();


    if (createError) {

      console.error(
        "WALLET CREATE ERROR:",
        createError
      );

      return false;

    }


    walletBalance =
      Number(
        newWallet.balance || 0
      );

    return true;

  }


  /* =========================================================
     LOAD TRANSACTIONS
  ========================================================= */

  async function loadTransactions() {

    const authId =
      getAuthId();

    if (!authId)
      return;


    const { data, error } =
      await supabaseClient
        .from("wallet_transactions")
        .select("*")
        .eq(
          "auth_id",
          authId
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        )
        .limit(50);


    if (error) {

      console.error(
        "TRANSACTION LOAD ERROR:",
        error
      );

      return;

    }


    walletTransactions =
      data || [];

  }


  /* =========================================================
     PENDING WITHDRAW TOTAL
  ========================================================= */

  function getPendingWithdrawTotal() {

    return walletTransactions
      .filter(function (tx) {

        return (
          tx.type === "Withdraw" &&
          tx.status === "Pending"
        );

      })
      .reduce(function (total, tx) {

        return total +
          Number(tx.amount || 0);

      }, 0);

  }


  function getAvailableBalance() {

    return Math.max(
      0,
      walletBalance -
      getPendingWithdrawTotal()
    );

  }


  /* =========================================================
     RENDER BALANCE
  ========================================================= */

  function renderBalance() {

    const element =
      document.getElementById(
        "balance"
      );

    if (!element)
      return;

    element.innerText =
      formatMoney(
        walletBalance
      );

  }


  /* =========================================================
     HISTORY BOX
  ========================================================= */

  function createHistoryBox() {

    const walletSection =
      document.getElementById(
        "wallet"
      );

    if (!walletSection)
      return;


    if (
      document.getElementById(
        "walletHistory"
      )
    )
      return;


    const box =
      document.createElement("div");

    box.id =
      "walletHistory";

    box.className =
      "card wallet-history-card";


    box.innerHTML = `

      <div
        class="section-title"
        style="font-size:20px;margin-bottom:12px;"
      >
        ${walletText("history")}
      </div>

      <div
        id="walletTransactions"
      ></div>

    `;


    walletSection.appendChild(
      box
    );

  }


  /* =========================================================
     RENDER HISTORY
  ========================================================= */

  function renderHistory() {

    const container =
      document.getElementById(
        "walletTransactions"
      );

    if (!container)
      return;


    if (!walletTransactions.length) {

      container.innerHTML = `

        <div
          style="
            text-align:center;
            opacity:.5;
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
      walletTransactions
        .map(function (tx) {

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


          const statusClass =
            tx.status === "Completed"
              ? "wallet-completed"
              : tx.status === "Rejected"
                ? "wallet-rejected"
                : "wallet-pending";


          const network =
            tx.network
              ? " • " + tx.network
              : "";


          const date =
            tx.created_at
              ? new Date(
                  tx.created_at
                ).toLocaleString()
              : "";


          return `

            <div
              style="
                padding:13px 0;
                border-bottom:
                  1px solid
                  rgba(255,255,255,.08);
              "
            >

              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                "
              >

                <div>

                  <div
                    style="
                      font-weight:700;
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
                      margin-top:4px;
                    "
                  >
                    ${date}
                  </div>

                  <div
                    class="${statusClass}"
                    style="
                      font-size:10px;
                      font-weight:700;
                      margin-top:5px;
                    "
                  >
                    ${tx.status}
                  </div>

                </div>


                <div
                  class="${amountClass}"
                  style="
                    font-weight:800;
                    white-space:nowrap;
                  "
                >
                  ${sign}$${formatMoney(tx.amount)}
                </div>

              </div>

            </div>

          `;

        })
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
    )
      return;


    const style =
      document.createElement("style");

    style.id =
      "realWalletStyle";


    style.textContent = `

      .wallet-modal-overlay{

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


      .wallet-modal{

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


      .wallet-modal-title{

        font-size:21px;
        font-weight:900;

        margin-bottom:18px;

      }


      .wallet-label{

        display:block;

        font-size:12px;

        color:#94a3b8;

        font-weight:700;

        margin-bottom:7px;

      }


      .wallet-input,
      .wallet-select{

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


      .wallet-select option{

        background:#0b1220;
        color:white;

      }


      .wallet-input:focus,
      .wallet-select:focus{

        border-color:#60a5fa;

        box-shadow:
          0 0 0 3px
          rgba(96,165,250,.10);

      }


      .wallet-address-box{

        padding:13px;

        border-radius:14px;

        background:
          rgba(37,99,235,.10);

        border:
          1px solid
          rgba(96,165,250,.18);

        margin-bottom:12px;

      }


      .wallet-address{

        word-break:break-all;

        font-size:12px;

        line-height:1.5;

        margin-top:7px;

        color:#e2e8f0;

      }


      .wallet-copy{

        width:100%;

        padding:10px;

        border-radius:11px;

        background:#1e293b;

        margin-top:10px;

        font-weight:700;

        font-size:12px;

      }


      .wallet-warning{

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


      .wallet-hint{

        font-size:11px;

        color:#94a3b8;

        line-height:1.5;

        margin:
          -4px 0 13px;

      }


      .wallet-available{

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


      .wallet-buttons{

        display:flex;

        gap:10px;

        margin-top:5px;

      }


      .wallet-button{

        flex:1;

        padding:14px;

        border:0;

        border-radius:14px;

        font-weight:800;

        font-size:14px;

      }


      .wallet-cancel{

        background:#1e293b;
        color:white;

      }


      .wallet-confirm{

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );

        color:white;

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

      if (!element)
        return;


      try {

        await navigator.clipboard.writeText(
          element.innerText
        );

        const button =
          document.getElementById(
            "walletCopyButton"
          );

        if(button){

          button.innerText =
            walletText("copied");

          setTimeout(function(){

            button.innerText =
              walletText("copy");

          },1500);

        }

      } catch(error) {

        alert(
          element.innerText
        );

      }

    };


  /* =========================================================
     SHOW DEPOSIT
  ========================================================= */

  function showDepositModal() {

    createStyles();


    const overlay =
      document.createElement("div");

    overlay.className =
      "wallet-modal-overlay";


    overlay.innerHTML = `

      <div class="wallet-modal">

        <div class="wallet-modal-title">
          ${walletText("depositTitle")}
        </div>


        <label class="wallet-label">
          ${walletText("network")}
        </label>


        <select
          id="walletDepositNetwork"
          class="wallet-select"
        >

          <option value="">
            ${walletText("selectNetwork")}
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
              ${walletText("address")}
            </div>

            <div
              id="walletDepositAddress"
              class="wallet-address"
            ></div>

            <button
              id="walletCopyButton"
              class="wallet-copy"
              type="button"
              onclick="copyWalletAddress()"
            >
              ${walletText("copy")}
            </button>

          </div>


          <div class="wallet-warning">
            ${walletText("warning")}
          </div>

        </div>


        <label class="wallet-label">
          ${walletText("amount")}
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


        <label class="wallet-label">
          ${walletText("transactionHash")}
        </label>

        <input
          id="walletDepositHash"
          class="wallet-input"
          type="text"
          placeholder="0x... / transaction hash"
        />


        <div class="wallet-hint">
          ${walletText("transactionHashHint")}
        </div>


        <div class="wallet-buttons">

          <button
            id="walletDepositCancel"
            class="wallet-button wallet-cancel"
          >
            ${walletText("cancel")}
          </button>

          <button
            id="walletDepositConfirm"
            class="wallet-button wallet-confirm"
          >
            ${walletText("confirm")}
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


        if(!network){

          addressBox.style.display =
            "none";

          return;

        }


        address.innerText =
          network.address;

        addressBox.style.display =
          "block";

      };


    function close() {

      overlay.remove();

    }


    document.getElementById(
      "walletDepositCancel"
    ).onclick =
      close;


    overlay.onclick =
      function(event){

        if(
          event.target === overlay
        ){

          close();

        }

      };


    document.getElementById(
      "walletDepositConfirm"
    ).onclick =
      async function () {

        const network =
          networkSelect.value;

        const amount =
          Number(
            document.getElementById(
              "walletDepositAmount"
            ).value
          );

        const txHash =
          document.getElementById(
            "walletDepositHash"
          ).value.trim();


        if(!network){

          alert(
            walletText(
              "selectNetwork"
            )
          );

          return;

        }


        if(
          !Number.isFinite(amount) ||
          amount < MIN_AMOUNT
        ){

          alert(
            walletText(
              "minimumDeposit"
            )
          );

          return;

        }


        if(!txHash){

          alert(
            walletText(
              "invalidHash"
            )
          );

          return;

        }


        const authId =
          getAuthId();

        if(!authId){

          alert(
            "Authentication required."
          );

          return;

        }


        this.disabled = true;


        const { error } =
          await supabaseClient
            .from("wallet_transactions")
            .insert({

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
                ].address,

              tx_hash:
                txHash

            });


        this.disabled = false;


        if(error){

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


        await loadTransactions();

        renderHistory();

        close();


        alert(
          walletText(
            "depositCreated"
          )
        );

      };

  }


  /* =========================================================
     SHOW WITHDRAW
  ========================================================= */

  function showWithdrawModal() {

    createStyles();


    const available =
      getAvailableBalance();


    if(available < MIN_AMOUNT){

      alert(
        walletText(
          "insufficient"
        )
      );

      return;

    }


    const overlay =
      document.createElement("div");

    overlay.className =
      "wallet-modal-overlay";


    overlay.innerHTML = `

      <div class="wallet-modal">

        <div class="wallet-modal-title">
          ${walletText("withdrawTitle")}
        </div>


        <div class="wallet-available">
          ${walletText("available")}:
          <b>$${formatMoney(available)}</b>
        </div>


        <label class="wallet-label">
          ${walletText("network")}
        </label>


        <select
          id="walletWithdrawNetwork"
          class="wallet-select"
        >

          <option value="">
            ${walletText("selectNetwork")}
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
          ${walletText("address")}
        </label>


        <input
          id="walletWithdrawAddress"
          class="wallet-input"
          type="text"
          placeholder="USDT wallet address"
        />


        <div class="wallet-hint">
          ${walletText("withdrawInstruction")}
        </div>


        <label class="wallet-label">
          ${walletText("amount")}
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


        <div class="wallet-hint">
          ${walletText("minimumWithdraw")}
        </div>


        <div class="wallet-buttons">

          <button
            id="walletWithdrawCancel"
            class="wallet-button wallet-cancel"
          >
            ${walletText("cancel")}
          </button>

          <button
            id="walletWithdrawConfirm"
            class="wallet-button wallet-confirm"
          >
            ${walletText("confirm")}
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    function close(){

      overlay.remove();

    }


    document.getElementById(
      "walletWithdrawCancel"
    ).onclick =
      close;


    overlay.onclick =
      function(event){

        if(
          event.target === overlay
        ){

          close();

        }

      };


    document.getElementById(
      "walletWithdrawConfirm"
    ).onclick =
      async function(){

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


        if(!network){

          alert(
            walletText(
              "selectNetwork"
            )
          );

          return;

        }


        if(!address){

          alert(
            walletText(
              "invalidAddress"
            )
          );

          return;

        }


        if(
          !Number.isFinite(amount) ||
          amount < MIN_AMOUNT
        ){

          alert(
            walletText(
              "minimumWithdraw"
            )
          );

          return;

        }


        const currentAvailable =
          getAvailableBalance();


        if(amount > currentAvailable){

          alert(
            walletText(
              "insufficient"
            )
          );

          return;

        }


        const authId =
          getAuthId();

        if(!authId){

          alert(
            "Authentication required."
          );

          return;

        }


        this.disabled = true;


        const { error } =
          await supabaseClient
            .from("wallet_transactions")
            .insert({

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

            });


        this.disabled = false;


        if(error){

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


        await loadTransactions();

        renderHistory();


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
    function(){

      if(!walletInitialized){

        initWallet();

      }

      showDepositModal();

    };


  window.withdraw =
    function(){

      if(!walletInitialized){

        initWallet();

      }

      showWithdrawModal();

    };


  /* =========================================================
     RENDER
  ========================================================= */

  function renderWallet(){

    createHistoryBox();

    renderBalance();

    renderHistory();

  }


  /* =========================================================
     INIT
  ========================================================= */

  async function initWallet(){

    if(
      typeof currentUser === "undefined" ||
      !currentUser ||
      !currentUser.auth_id
    ){

      return false;

    }


    const walletReady =
      await ensureWallet();


    if(!walletReady)
      return false;


    await loadTransactions();


    renderWallet();


    walletInitialized = true;


    console.log(
      "REAL USDT WALLET READY"
    );


    return true;

  }


  /* =========================================================
     WAIT FOR LOGIN
  ========================================================= */

  const walletTimer =
    setInterval(
      async function(){

        if(
          await initWallet()
        ){

          clearInterval(
            walletTimer
          );

        }

      },
      800
    );


  setTimeout(
    function(){

      clearInterval(
        walletTimer
      );

    },
    30000
  );


})();
