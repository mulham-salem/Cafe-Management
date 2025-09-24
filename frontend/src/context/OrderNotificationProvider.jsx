import { createContext, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components/styles/toastStyles.css";
import echo from "../../echo";

const OrderNotificationContext = createContext();

export const OrderNotificationProvider = ({ children }) => {
  useEffect(() => {
    try {
      const channel = echo.channel("notifications");
      channel.listen(".new-notification", (e) => {
        console.log("Received notification via WebSocket:", e);
        const n = e.notification;
        const msg = n.message;
        const orderId = msg.split("#")[1].split(" ")[0];
        setTimeout(() => {
          if (n.seen === false && n.purpose === "Order Ready") {
            toast.info(`☕️ Your order #${orderId} is ready!`, {
              autoClose: true,
              icon: false,
              closeButton: false,
              hideProgressBar: true,
              className: "ready-custom-toast",
              bodyClassName: "ready-custom-toast-body",
            });
          }
        }, 4000);
      });

      // معالج الأخطاء للقناة
      channel.error((error) => {
        console.error("Channel error:", error);
        toast.error("Connection error. Reconnecting...");
      });

      return () => {
        echo.leaveChannel("notifications");
      };
    } catch (error) {
      console.error("Failed to set up WebSocket:", error);
      toast.error("Real-time messaging unavailable");
    }
  }, []);

  return (
    <OrderNotificationContext.Provider value={{}}>
      {children}
    </OrderNotificationContext.Provider>
  );
};
