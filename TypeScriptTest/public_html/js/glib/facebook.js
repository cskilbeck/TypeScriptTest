window.fbAsyncInit = function() {
    FB.init({
        appId      : '224932627603132',
        xfbml      : true,
        version    : 'v2.3'
  });
};

function init_Facebook() {
    var js,
        fjs;
    fjs = document.getElementsByTagName('script')[0];
    if (document.getElementById('facebook-jssdk')) {
        return;
    }
    js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}
