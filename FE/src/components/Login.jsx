import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import apiService from "../services/api";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await apiService.login(userId, password);
      
      // 로그인 성공 시 상태 업데이트
      login(
        { userId: userId, name: response.name },
        response.access_token
      );
      
      navigate("/");
    } catch (error) {
      setError(error.message || "로그인 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-2">로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-3 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none"
          required
        />
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold py-3 rounded"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <a href="/signup" onClick={handleSignupClick} className="hover:underline">회원가입</a>
          <a href="#" className="hover:underline">비밀번호 찾기</a>
        </div>
      </form>
    </div>
  );
};

export default Login; 