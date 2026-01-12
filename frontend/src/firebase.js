import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACitE6L2_c2LXcTzFyyA81wbLazPX5E6U",
  authDomain: "unimart-2358.firebaseapp.com",
  projectId: "unimart-2358",
  storageBucket: "unimart-2358.appspot.com",
  messagingSenderId: "696475752874",
  appId: "1:696475752874:web:86c18a843e31ae2b1973d3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,                     
      "recaptcha-container",    
      {
        size: "invisible",
      }
    );
  }
};
