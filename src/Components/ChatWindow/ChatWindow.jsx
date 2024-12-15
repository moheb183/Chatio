import React, { useState, useEffect, useRef } from "react";
import {
  ref,
  get,
  getDatabase,
  push,
  onValue,
  update,
} from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, database } from "../FirebaseConfig";
import icon from "../../Assets/send (2).svg";
import pengiun from "../../Assets/pengiun.png";
import downloadIcon from "../../Assets/download_15101137.png";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import "./ChatWindow.css";


import { set, onDisconnect } from "firebase/database";


// video 
function ChatWindow({ chatId }) {


  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [user] = useAuthState(auth);
  const currentUserId = user ? user.uid : null;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatUsers, setChatUsers] = useState({});
  const [chatUser, setChatUser] = useState(null);
  const [file, setFile] = useState(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // vioce note message 

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const audioChunks = useRef([]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messagesArray = [];
      for (let id in data) {
        messagesArray.push({ id, ...data[id] });
      }
      setMessages(messagesArray);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    const db = getDatabase();
    const chatRef = ref(db, `chats/${chatId}/members`);

    onValue(chatRef, (snapshot) => {
      const members = snapshot.val();
      const otherUserId = Object.keys(members).find(
        (id) => id !== currentUserId
      );

      if (otherUserId) {
        const userRef = ref(db, `users/${otherUserId}`);
        onValue(userRef, (userSnapshot) => {
          setChatUser(userSnapshot.val());
        });
      }

      const memberProfilePics = {};
      Object.keys(members).forEach((userId) => {
        const userRef = ref(db, `users/${userId}`);
        onValue(userRef, (userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData) {
            memberProfilePics[userId] = userData.profilePicUrl;
          }
        });
      });

      setChatUsers(memberProfilePics);
    });
  }, [chatId, currentUserId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !file) return;

    const message = {
      sender: currentUserId,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");

      fetch("https://api.cloudinary.com/v1_1/dtps4ojjk/image/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          const fileUrl = data.url;
          message.fileUrl = fileUrl;
          sendMessageToDatabase(message);
        })
        .catch((error) => console.error("Error uploading file:", error));
    } else {
      sendMessageToDatabase(message);
    }

    setNewMessage("");
    setFile(null);
  };

  const sendMessageToDatabase = (message) => {
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const unreadRef = ref(db, `chats/${chatId}/unread`);
    push(messagesRef, message);

    get(unreadRef).then((snapshot) => {
      const unreadData = snapshot.val() || {};
      const updatedUnread = {};

      for (const userId in unreadData) {
        if (userId !== currentUserId) {
          updatedUnread[userId] = (unreadData[userId] || 0) + 1;
        }
      }

      update(unreadRef, updatedUnread);
    });

    const chatRef = ref(db, `chats/${chatId}`);
    let lastMessageText = "";

    if (message.text) {
      lastMessageText = message.text;
    } else if (message.fileUrl) {
      if (message.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        lastMessageText = "Sent a photo 📷";
      } else {
        lastMessageText = "Sent a file 📎";
      }
    } else if (message.audioUrl) {
      lastMessageText = "Sent a voice note 🎙️";
    }
    update(chatRef, {
      lastMessage: lastMessageText,
      lastMessageTime: message.timestamp,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDownload = (fileUrl) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileUrl.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCancelFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };


  // vioce note message 
  const startRecording = () => {
    if (isRecording) return;
    if (audioUrl) {
      setAudioUrl(null);
      setAudioBlob(null);
    }
    setIsRecording(true);
    audioChunks.current = [];
    const stream = navigator.mediaDevices.getUserMedia({ audio: true });
    stream.then((mediaStream) => {
      mediaRecorderRef.current = new MediaRecorder(mediaStream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setAudioPreview(URL.createObjectURL(blob));

      };
      mediaRecorderRef.current.start();
    });
  };


  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendAudioMessage = () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("upload_preset", "ml_default");

    fetch("https://api.cloudinary.com/v1_1/dtps4ojjk/raw/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const audioUrl = data.url;
        const message = {
          sender: currentUserId,
          audioUrl: audioUrl,
          timestamp: new Date().toISOString(),
        };
        sendMessageToDatabase(message);
        setAudioBlob(null);
        setAudioUrl(null);
        setAudioPreview(null);
      })
      .catch((error) => console.error("Error uploading audio:", error));
  };
  const handleCancelAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioPreview(null);
  };


  // scroll to bottom

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);






  return (

    <div className="min-h-full w-full">


      <div className=" bg-white border-[1px] border-gray-200 rounded-xl">
        <div className="flex items-center p-1">
          <div className="w-[2.5rem] h-[2.5rem] overflow-hidden rounded-full">
            <img
              src={chatUser?.profilePicUrl || pengiun}
              alt="User-img"
              className="img-fluid w-full h-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h5 className="text-base text-capitalize text-[#39a8b8] font-semibold text-[1.25rem]">
              {chatUser?.name || "Anonymous"}
            </h5>
            <p className="text-sm text-gray-600 text-left">
              Online
            </p>
          </div>
        </div>

        <hr className="text-black" />

        <div className="back-ground chat-container w-full h-[80vh] custom-scrollbar overflow-y-auto">

          {loadingMessages ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === currentUserId
                  ? "flex-row-reverse"
                  : "flex-row"
                  } mx-2 items-center`}
              >
                <div className="w-[2.5rem] h-[2.5rem] overflow-hidden rounded-full mx-1">
                  <img
                    src={
                      message.sender === currentUserId
                        ? chatUsers[currentUserId] || pengiun
                        : chatUsers[message.sender] || pengiun
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className={`p-2 my-2 max-w-[50%]  break-words ${message.sender === currentUserId
                    ? "bg-[#30a8b8] text-white rounded-se-xl rounded-es-xl"
                    : "bg-[#325da6] text-white  rounded-ss-xl rounded-ee-xl"
                    }`}
                >

                  {message.fileUrl && (
                    <div className="flex items-center space-x-1 flex-wrap">
                      {message.fileUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                        <img
                          src={message.fileUrl}
                          alt="attached"
                          className="w-auto  h-auto cursor-pointer   rounded-xl"
                          onClick={() => window.open(message.fileUrl, "_blank")}
                        />
                      ) : (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={downloadIcon}
                            alt="Download"
                            className="w-auto h-auto items-center object-cover cursor-pointer"
                          />
                          <span className=" text-sm ">
                            {" "}
                            Download pdf or zip File
                          </span>
                        </a>
                      )}
                    </div>
                  )}

                  {message.text && <p>{message.text}</p>}
                  {message.audioUrl && (
                    <div className="audio-message">
                      <audio controls>
                        <source src={message.audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  <span
                    className={`flex items-end  justify-end   ${message.sender === currentUserId
                      ? " ms-2 text-[.75rem] text-white"
                      : " ms-2 text-[.75rem] text-white"
                      }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef}></div>

        </div>

        <hr className="text-gray-300" />

        {file && (
          <div className="preview border p-2 bg-gray-100 rounded mb-2 flex justify-between items-center ">
            <p className="text-sm">Attached File: {file.name}</p>
            <button
              onClick={handleCancelFile}
              className=" text-red-500 text-sm  "
            >
              Cancel
            </button>
          </div>
        )}
        <div className="relative w-full  top-[-.5rem]">
          {file && file.type.startsWith("image/") && (
            <div className="absolute bottom-[100%] left-0 w-full flex flex-col items-start p-2 border border-gray-300 bg-gray-200 shadow-lg rounded">
              <div className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="max-w-[5rem] max-h-[5rem] object-contain rounded"
                />
                <button
                  onClick={handleCancelFile}
                  className="absolute top-0 right-1 bg-gray-400  text-white rounded w-6   p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="text-center w-full p-2 rounded flex items-center">

            <div className="relative pt-2">

              <div onClick={() => setShowEmojiPicker(!showEmojiPicker)} >
                <i class="fa-regular fa-face-smile fs-5"></i>
              </div>


              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-10 left-[-20rem] z-50"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji) =>
                      setNewMessage(newMessage + emoji.native)
                    }
                  />
                </div>
              )}
            </div>

            <textarea
              className="w-full h-full outline-none border-none resize-none overflow-hidden p-2 "
              rows="1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder=" Type Here"
            />

            <div className="flex w-[20%] items-center justify-around mt-2  ">

              <div className="cursor-pointer">
                <label htmlFor="file-upload" aria-label="attach">


                  <div className="rounded rounded-circle h-[2rem] w-[2rem] d-flex items-center justify-center">
                    <i class="fa-solid fa-paperclip text-grey-600 fs-5"></i>
                  </div>

                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*, .pdf, .zip"
                />
              </div>


              <div
                className="bg-[#39a8b8] rounded-full w-[2rem] h-[2rem] flex items-center justify-center"
                onClick={handleSendMessage}
              >
                <img src={icon} alt="send icon" className="icon" />
              </div>

              {/* Voice recording button */}


              <div className="flex items-center ">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  className="recording-btn w-[2rem] h-[2rem] "
                >
                  <div className="mic rounded rounded-circle bg-[#39a8b8] h-[2rem] w-[2rem] d-flex items-center justify-center">
                    <i class="fa-solid fa-microphone fs-6 text-[#fff]"></i>
                  </div>
                </button>
                {isRecording && (
                  <span className="flex items-center p-2 border text-red-500 border-gray-300 bg-gray-100 rounded mb-2 absolute left-0 top-[-2rem] w-full  ">Recording...</span>
                )}
                {audioUrl && !isRecording && (
                  <div className="flex items-center p-2 border border-gray-300 bg-gray-100 rounded mb-2 absolute left-0 top-[-4rem] w-full">
                    <p className="text-sm text-gray-500 ">Audio Note Preview:</p>

                    <audio controls className="flex-grow mx-4 ">
                      <source src={audioPreview} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>

                    <button
                      onClick={handleCancelAudio}
                      className="text-red-500 text-sm font-semibold px-2 py-1 rounded hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendAudioMessage}
                      className="text-[#39a8b8] text-sm  font-semibold px-4 py-1 rounded  hover:bg-gray-200"
                    >
                      Send
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;



