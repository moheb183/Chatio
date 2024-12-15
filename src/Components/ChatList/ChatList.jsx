import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { auth } from "../FirebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import img_receiver from "../../Assets/pengiun.png";
import "../ChatList/ChatList.css";

function ChatList({ onSelectChat }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user] = useAuthState(auth);
  const currentUserId = user ? user.uid : null;
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessageTimes, setLastMessageTimes] = useState({});

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([id, userData]) => ({
          id,
          ...userData,
        }));
        setUsers(userList);
      } else {
        console.log("No users found");
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserId &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastMessageDetails = (chatId, userId) => {
    const db = getDatabase();

    const chatRef = ref(db, `chats/${chatId}`);
    const unreadRef = ref(db, `chats/${chatId}/unread/${currentUserId}`);

    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setLastMessages((prevState) => ({
          ...prevState,
          [userId]: data.lastMessage,
        }));
        setLastMessageTimes((prevState) => ({
          ...prevState,
          [userId]: data.lastMessageTime,
        }));
      }
    });

    onValue(unreadRef, (unreadSnapshot) => {
      const unreadCount = unreadSnapshot.val() || 0;
      setUnreadCounts((prevState) => ({
        ...prevState,
        [userId]: unreadCount,
      }));
    });
  };

  const handleCreateChat = async (selectedUserId) => {
    const db = getDatabase();
    const chatRef = ref(db, "chats");

    const snapshot = await get(chatRef);
    let existingChatId = null;

    if (snapshot.exists()) {
      snapshot.forEach((chat) => {
        const members = chat.val().members;
        if (members && members[currentUserId] && members[selectedUserId]) {
          existingChatId = chat.key;
        }
      });
    }

    if (existingChatId) {
      onSelectChat(existingChatId);

      const unreadRef = ref(
        db,
        `chats/${existingChatId}/unread/${currentUserId}`
      );
      set(unreadRef, 0);

      getLastMessageDetails(existingChatId, selectedUserId);
    } else {
      const newChatRef = push(chatRef);
      const chatId = newChatRef.key;

      await set(newChatRef, {
        members: { [currentUserId]: true, [selectedUserId]: true },
        lastMessage: "",
        lastMessageTime: null,
        unread: { [currentUserId]: 0, [selectedUserId]: 0 },
      });

      onSelectChat(chatId);

      const unreadRef = ref(db, `chats/${chatId}/unread/${currentUserId}`);
      set(unreadRef, 0);

      getLastMessageDetails(chatId, selectedUserId);
    }
  };

  return (
    <div
      id="chatList"
      className="border-[1px] w-[100%] h-screen overflow-y-auto custom-scrollbar border-gray-200 rounded-xl"
    >
      <header className="d-flex justify-content-between align-items-center px-2">
        <h1 className="fs-1 fw-bolder p-1">All Users</h1>
        <i className="fs-2 fa-solid fa-bars"></i>
      </header>
      <hr className="text-gray-400" />

      <div className="my-3 p-1">
        <input
          type="search"
          className="w-[100%] border-gray-400 outline-none py-1"
          placeholder="Search for users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-chats text-center text-capitalize font-medium text-[1.25rem] ">No users found</div>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user.id}
            className="item my-2 "
            onClick={() => handleCreateChat(user.id)}
          >
            <div className="item-body p-1 d-flex">
              <div className="w-[3rem] h-[3rem] col-4 overflow-hidden rounded-full ms-2">
                <img
                  src={user.profilePicUrl || img_receiver}
                  alt="User-img"
                  className="img-fluid w-full h-full object-cover"
                />
              </div>

              <div className="d-flex flex-column ms-2 w-100 gap-1">
                <div className="item-details d-flex justify-content-between align-items-center">
                  <h2 className="fw-bold text-capitalize text-[#15535d]">{user.name}</h2>
                  <span className="text-gray-400 text-sm">
                    {lastMessageTimes[user.id]
                      ? new Date(lastMessageTimes[user.id]).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )
                      : " "}
                  </span>
                </div>
                <div className="item-details d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-column  ">
                    <div className="text-gray-400 ">
                      <p className="">
                        {lastMessages[user.id] || "Click to start chat"}
                      </p>
                    </div>
                  </div>
                  {unreadCounts[user.id] > 0 && (
                    <span className="badge bg-[#e73879] rounded ">
                      {unreadCounts[user.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ChatList;
