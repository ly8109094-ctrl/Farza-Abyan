importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBlukcCerg0JmlZJIKH_MMnfHqYT16VIPI",
  authDomain: "farza-abyan.firebaseapp.com",
  projectId: "farza-abyan",
  storageBucket: "farza-abyan.firebasestorage.app",
  messagingSenderId: "862766729352",
  appId: "1:862766729352:web:ca548168c1b14ce27f773d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
