import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../FirebaseConfig";
import axios from "axios";
import { useState } from "react";
import toast  from "react-hot-toast";
import ico from '../../Assets/chatio-icon.png'
import { Helmet } from "react-helmet";


function SignUp() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "ml_default");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dtps4ojjk/image/upload",
        formData
      );
      console.log("Uploaded image URL:", response.data.secure_url);
      return response.data.secure_url;
    } catch (error) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message
      );
      return null;
    }
  };

  const handleSignup = async (values) => {
    setLoading(true);
    const setDataFirebase = async (email, password, name, profilePicUrl) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name,
          photoURL: profilePicUrl,
        });

        const userRef = ref(database, "users/" + user.uid);
        await set(userRef, {
          name: name,
          email: email,
          userId: user.uid,
          profilePicUrl: profilePicUrl,
        });

        toast.success("Account Created Successfully!");
        setLoading(false);
        navigate("/");
      } catch (error) {
        toast.error("Your Account is already Exist!");
        setLoading(false);
      }
    };

    let profilePicUrl = imageUrl;

    if (image) {
      profilePicUrl = await uploadImage(image);
    }

    setDataFirebase(values.email, values.password, values.name, profilePicUrl);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Name is required")
        .matches(/^[a-zA-Z\s]+$/, "Name must contain only alphabets"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .required("Required")
        .matches(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/,
          "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
        ),
      confirmPassword: Yup.string()
        .required("Required")
        .oneOf([Yup.ref("password"), null], "Passwords must match"),
    }),
    onSubmit: handleSignup,
  });

  return (
    <div className="bg-[#F7FBFC] h-screen">
      <Helmet>
        <meta charSet="utf-8" />
        <title>SignUp</title>
        <link rel="shortcut icon" href={ico} type="image/x-icon" />

      </Helmet>
      <h1 className="font-bold text-3xl text-center p-4">SignUp</h1>
      <div className="flex justify-center items-center">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col border border-black rounded-xl p-4 w-[25%]"
        >
          <label htmlFor="name" className="font-bold my-1">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className="border border-black rounded-md p-1"
          />
          {formik.errors.name && (
            <div className="text-[12px] text-red-700">{formik.errors.name}</div>
          )}

          <label htmlFor="email" className="font-bold my-1">
            E-mail:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className="border border-black rounded-md p-1"
          />
          {formik.errors.email && (
            <div className="text-[12px] text-red-700">
              {formik.errors.email}
            </div>
          )}

          <label htmlFor="password" className="font-bold my-1">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className="border border-black rounded-md p-1"
          />
          {formik.errors.password && (
            <div className="text-[12px] text-red-700">
              {formik.errors.password}
            </div>
          )}

          <label htmlFor="confirmPassword" className="font-bold my-1">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className="border border-black rounded-md p-1"
          />
          {formik.errors.confirmPassword && (
            <div className="text-[12px] text-red-700">
              {formik.errors.confirmPassword}
            </div>
          )}

          <label htmlFor="profilePic" className="font-bold my-1">
            Profile Picture:
          </label>
          <input
            type="file"
            id="profilePic"
            name="profilePic"
            onChange={handleImageChange}
            className="border border-black rounded-md p-1"
          />

          <button
            type="submit"
            className="bg-[#222831] hover:bg-[#393E46] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-2"
          >
            Submit
            {loading && <i class="fa-solid fa-spinner fa-spin ml-1 "></i>}
          </button>

          <div>
            <Link to="/">
              <p className="text-[12px] ms-1 text-red-700 cursor-pointer">
                Already have an account?
              </p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
