import React, { useState } from "react";
import { Helmet } from "react-helmet";
import ico from '../../Assets/chatio-icon.png'
import ChatList from "../ChatList/ChatList";
import ChatWindow from "../ChatWindow/ChatWindow";
import "../ChatPage/chatPage.css"
function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="w-[100%] h-screen flex justify-center py-3 " >
      <Helmet>
        <meta charSet="utf-8" />
        <title>My chats</title>
        <link rel="shortcut icon" href={ico} type="image/x-icon" />

      </Helmet>
      <div className="w-[25%] p-1">
        <ChatList onSelectChat={handleSelectChat} />
      </div>

      <div className="w-[70%] h-full p-1">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="h-screen bg-white flex flex-col items-center justify-center ">
            <h1 className=" text-[5rem] " >C h a t io</h1>
            <h5 className=" text-capitalize text-gray-500">Select a chat to start messaging</h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
