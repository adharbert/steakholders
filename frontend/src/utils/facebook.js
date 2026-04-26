const FB_SDK_URL = 'https://connect.facebook.net/en_US/sdk.js';

let sdkReady = null;

function loadSdk(appId) {
  if (sdkReady) return sdkReady;

  sdkReady = new Promise((resolve) => {
    if (window.FB) { resolve(window.FB); return; }

    window.fbAsyncInit = () => {
      window.FB.init({ appId, version: 'v19.0', cookie: true, xfbml: false });
      resolve(window.FB);
    };

    const script = document.createElement('script');
    script.src = FB_SDK_URL;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });

  return sdkReady;
}

export async function loginWithFacebook(appId) {
  const FB = await loadSdk(appId);
  return new Promise((resolve, reject) => {
    FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('Facebook sign-in was cancelled or failed.'));
        }
      },
      { scope: 'email' }
    );
  });
}
