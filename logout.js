(function(){

  function addLogoutButton(){

    const profile =
      document.getElementById('profile');

    if(!profile)
      return;

    if(
      document.getElementById(
        'logoutAccountButton'
      )
    ){
      return;
    }


    const button =
      document.createElement('button');

    button.id =
      'logoutAccountButton';

    button.className =
      'profile-edit-btn';

    button.style.marginTop =
      '12px';

    button.style.background =
      '#7f1d1d';

    button.style.borderColor =
      '#991b1b';

    button.innerText =
      getLogoutText();


    button.onclick =
      async function(){

        button.disabled = true;

        button.innerText =
          getLogoutLoadingText();


        const { error } =
          await supabaseClient.auth.signOut();


        if(error){

          console.error(
            'LOGOUT ERROR:',
            error
          );

          button.disabled = false;

          button.innerText =
            getLogoutText();

          return;

        }


        /*
          Current account maglumatlaryny
          arassalaýarys.
        */

        currentUser = null;


        /*
          Miner state hem arassalanýar.
        */

        crystals = 0;

        dailyCrystals = 0;

        lastMiningDate = null;


        /*
          Eger auto miner işleýän bolsa,
          ony hem duruzýarys.
        */

        if(autoTimer){

          clearTimeout(autoTimer);

          autoTimer = null;

        }


        if(countdownTimer){

          clearInterval(
            countdownTimer
          );

          countdownTimer = null;

        }


        autoEndTime = null;


        /*
          Sahypany täzeden açýarys.
          Supabase session indi ýok.
        */

        location.reload();

      };


    profile.appendChild(button);


  }


  function getLogoutText(){

    if(
      typeof currentLanguage !==
      'undefined'
    ){

      if(currentLanguage === 'ru')
        return '🚪 Выйти из аккаунта';

      if(currentLanguage === 'en')
        return '🚪 Log out';

    }

    return '🚪 Accountdan çyk';

  }


  function getLogoutLoadingText(){

    if(
      typeof currentLanguage !==
      'undefined'
    ){

      if(currentLanguage === 'ru')
        return '⏳ Выход...';

      if(currentLanguage === 'en')
        return '⏳ Logging out...';

    }

    return '⏳ Çykylýar...';

  }


  /*
    App ýüklenenden soň barlaýarys.
  */

  const timer =
    setInterval(function(){

      addLogoutButton();

    },500);


  /*
    30 sekuntdan soň barlamagy bes edýär.
  */

  setTimeout(function(){

    clearInterval(timer);

  },30000);


  /*
    Ilkinji gezek hem synanyş.
  */

  addLogoutButton();

})();
