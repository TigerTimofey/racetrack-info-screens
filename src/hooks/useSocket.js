import { useEffect, useState } from "react";
import io from "socket.io-client";

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io(process.env.REACT_APP_SERVER_URL);
    setSocket(socketConnection);

    return () => {
      if (socketConnection) socketConnection.disconnect();
    };
  }, []);

  return socket;
};

export { useSocket };
