(function(){

  function createLogoutButton(){

    if(document.getElementById('logoutAccountButton')){
      return;
    }

    const button =
      document.createElement('button');

    button.id =
      'logoutAccountButton';

    button.textContent =
      '🚪 Accountdan çyk';

    button.style.cssText = `
      width: 100%;
      margin-top: 15px;
      padding: 14px;
      border: none;
      border-radius: 12px;
      background: #222;
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    `;

    button.onclick =
      async function(){

        button.disabled = true;
        button.textContent =
          '⏳ Çykylýar...';

        try{

          const { error } =
            await supabaseClient.auth.signOut();

          if(error){

            console.error(
              'LOGOUT ERROR:',
              error
            );

            button.disabled = false;
            button.textContent =
              '🚪 Accountdan çyk';

            return;
          }

          /*
            Current account maglumatlaryny
            arassalaýarys.
          */

          currentUser = null;

          localStorage.removeItem(
            'currentUser'
          );

          /*
            App-y täzeden açýarys.
            startApp() Auth session-y görüp,
            login sahypasyna geçirer.
          */

          location.reload();

        }catch(error){

          console.error(
            'LOGOUT ERROR:',
            error
          );

          button.disabled = false;
          button.textContent =
            '🚪 Accountdan çyk';

        }

      };


    /*
      Profile sahypasynda düwmäni ýerleşdirmäge
      ýer gözleýäris.
    */

    const profile =
      document.getElementById('profileScreen') ||
      document.getElementById('profilePage') ||
      document.querySelector('.profile-screen') ||
      document.querySelector('.profile-page');

    if(profile){

      profile.appendChild(button);

    }

  }


  /*
    Sahypa doly açylandan soň synanyşýar.
  */

  if(document.readyState === 'loading'){

    document.addEventListener(
      'DOMContentLoaded',
      createLogoutButton
    );

  }else{

    createLogoutButton();

  }


  /*
    Profile soňrak açylýan bolsa,
    birnäçe wagtlap barlap dur.
  */

  let attempts = 0;

  const timer =
    setInterval(function(){

      createLogoutButton();

      attempts++;

      if(attempts >= 30){
        clearInterval(timer);
      }

    }, 1000);

})();
