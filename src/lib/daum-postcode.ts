type DaumPostcodeData = {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
  buildingName?: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => { open: () => void };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadDaumPostcodeScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Daum Postcode is only available in the browser."));
  }

  if (window.daum?.Postcode) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Daum 우편번호 서비스를 불러오지 못했습니다."));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function openDaumPostcode(onComplete: (address: string) => void) {
  await loadDaumPostcodeScript();

  new window.daum!.Postcode({
    oncomplete(data) {
      const base =
        data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
      const extra = data.buildingName ? ` ${data.buildingName}` : "";
      onComplete(`${base}${extra}`.trim());
    },
  }).open();
}
