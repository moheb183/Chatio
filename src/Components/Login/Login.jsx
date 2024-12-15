import React, { useState } from "react";
import "./Login.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";
import ico from '../../Assets/chatio-icon.png'


function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleLogin(values) {
    const signIn = async (email, password) => {
      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = userCredential.user.accessToken;
        sessionStorage.setItem("token", JSON.stringify(idToken));
        setLoading(false);
        toast.success("Logged In Successfully!", { duration: 2000 });
        navigate("/ChatPage");
      } catch (error) {
        setLoading(false);
        toast.error("Wrong Email or Password!", { duration: 2000 });
      }
    };

    signIn(values.email, values.password);
  }

  let formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: yup.object({
      email: yup.string().required("you must enter your g-mail"),
      password: yup.string().required("password is required"),
    }),

    onSubmit: handleLogin,
  });

  return (
    <div
      id="body"
      className="vh-100 d-flex flex-column justify-content-center align-items-center"
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>Login</title>
        <link rel="shortcut icon" href={ico} type="image/x-icon" />

      </Helmet>
      <h1 className="font-bold text-3xl text-center p-4 ">Login</h1>
      <div className="w-25 p-5 " id="loginBox">
        <form onSubmit={formik.handleSubmit} className=" d-flex flex-column">
          <label htmlFor="email" className="my-1">
            Email :
          </label>
          <input
            type="email"
            className=""
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            id="email"
            value={formik.values.email}
            name="email"
          />

          <label htmlFor="password" className="my-1">
            password :
          </label>
          <input
            type="password"
            className=""
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            id="password"
            value={formik.values.password}
            name="password"
          />

          <button className="py-1 w-[100%] bg-[#222831] hover:bg-[#393E46] text-white rounded-md my-2 ">
            Login
            {loading && <i class="fa-solid fa-spinner fa-spin ml-1 "></i>}
          </button>
          <div>
            <Link to="/SignUp">
              <p className="text-[12px]  ms-1 text-red-700 cursor-pointer">
                Don't have an account
              </p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
