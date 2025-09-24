import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echoConfig = {
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY || "app-key",
  wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: false, // لأننا http
  disableStats: true, // مانحتاج analytics
  enabledTransports: ["ws", "wss"],
};

const echo = new Echo(echoConfig);

// إضافة معالج الأخطاء للتصحيح
// دالة مساعدة لتسجيل تفاصيل الاتصال
const logConnectionDetails = () => {
  console.log("=== WebSocket Connection Details ===");
  console.log("WebSocket host:", echo.connector.options.wsHost);
  console.log("WebSocket port:", echo.connector.options.wsPort);
  console.log("Using TLS:", echo.connector.options.forceTLS);
  console.log("Connection state:", echo.connector.pusher.connection.state);
};

// استدعاء الدالة لتسجيل التفاصيل
logConnectionDetails();

// إضافة معالج لجميع حالات الاتصال
echo.connector.pusher.connection.bind("state_change", (states) => {
  console.log(
    "Connection state changed from",
    states.previous,
    "to",
    states.current
  );
});

// معالج للاتصال الناجح
echo.connector.pusher.connection.bind("connected", () => {
  console.log("✅ WebSocket connected successfully!");
  console.log("Socket ID:", echo.connector.pusher.connection.socket_id);
});

// معالج للانقطاع
echo.connector.pusher.connection.bind("disconnected", () => {
  console.log("⚠️ WebSocket disconnected");
});

// معالج لأخطاء المصادقة
echo.connector.pusher.connection.bind("message_error", (error) => {
  console.error("Message error:", error);
});

// معالج لأخطاء الاشتراك في القنوات
echo.connector.pusher.connection.bind("subscription_error", (error) => {
  console.error(
    "Subscription error - Status:",
    error.status,
    "Data:",
    error.data
  );
});

echo.connector.pusher.connection.bind("state_change", (states) => {
  console.log("Connection state changed:", states);
});

window.echo = echo;

export default echo;
