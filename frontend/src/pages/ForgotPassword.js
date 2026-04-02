import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();   // very important

    console.log("Sending:", email, newPassword);   // this must print in console

    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email: email,
        newPassword: newPassword,
      });

      console.log("Response:", res.data);
      alert(res.data.message);
    } catch (error) {
      console.log("Error:", error);
      alert("Error resetting password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <form onSubmit={handleReset} className="bg-gray-800 p-6 rounded-xl w-96">
        <h2 className="text-white text-2xl mb-4">Reset Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 p-2 rounded text-white"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}