export type YoutubeSdk = {
  Player: any;
};

interface WindowWithYoutubeSdk extends Window {
  onYouTubeIframeAPIReady: () => void;
  YT: YoutubeSdk;
}

declare let window: WindowWithYoutubeSdk;

export const loadScript = () =>
  doesSdkExist()
    ? Promise.resolve(getSdk() as YoutubeSdk)
    : (new Promise(resolve => {
        const script: HTMLScriptElement = createScript();
        const previousOnReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (previousOnReady) {
            previousOnReady();
          }
          resolve(getSdk());
        };

        window.document.body.insertBefore(
          script,
          window.document.body.firstChild,
        );
      }) as Promise<YoutubeSdk>);

function doesSdkExist() {
  return Boolean(getSdk());
}

function getSdk() {
  return window.YT;
}

function createScript() {
  const script = window.document.createElement('script');
  script.defer = true;
  script.async = true;
  script.src = 'https://www.youtube.com/iframe_api';
  return script;
}
