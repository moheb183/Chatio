import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../Login/Login";
import SignUp from "../SignUp/SignUp";

import ProtctedRoutes from "../protcted-Route/ProtctedRoutes";
import ChatPage from "../ChatPage/ChatPage";


function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/ChatPage"
        element={
          <ProtctedRoutes>
            <ChatPage />
          </ProtctedRoutes>
        }
      />

      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default Routers;
