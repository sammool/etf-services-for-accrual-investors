import React, { useState, useEffect, useRef } from "react";
import useAuthStore from "../stores/authStore";
import useChatStore from "../stores/chatStore";
import ChatMessage from "./ChatMessage";
import FileUpload from "./FileUpload";
import apiService from "../services/api";

const MainContent = () => {
  const [question, setQuestion] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef(null);
  const { logout } = useAuthStore();
  const { 
    messages, 
    isLoading, 
    isStreaming, 
    addMessage, 
    updateLastMessage, 
    setLoading, 
    setStreaming,
    loadHistory 
  } = useChatStore();

  // 컴포넌트 마운트 시 대화 히스토리 및 알림 설정 로드
  useEffect(() => {
    loadHistory();
    
    // 알림 설정 로드
    const loadNotificationSettings = async () => {
      try {
        const settings = await apiService.getNotificationSettings();
        setIsNotificationEnabled(settings.notification_enabled);
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      }
    };
    
    loadNotificationSettings();
  }, [loadHistory]);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => setQuestion(e.target.value);

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage);
    setQuestion("");
    setLoading(true);

    try {
      // 스트리밍 응답 처리
      let assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      addMessage(assistantMessage);
      setStreaming(true);

      let accumulatedContent = '';
      await apiService.sendMessageStream(question.trim(), (chunk) => {
        accumulatedContent += chunk;
        updateLastMessage(accumulatedContent);
      });

      setStreaming(false);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      updateLastMessage('죄송합니다. 메시지 전송에 실패했습니다. 다시 시도해 주세요.');
      setStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file) => {
    // 파일 업로드 로직 (추후 구현)
    console.log('파일 업로드:', file.name);
    setShowFileUpload(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 로그아웃이 실패해도 로그인 페이지로 이동
      window.location.href = "/login";
    }
  };

  const toggleNotification = async () => {
    try {
      const newStatus = !isNotificationEnabled;
      setIsNotificationEnabled(newStatus);
      
      // 백엔드에 알림 설정 업데이트
      await apiService.updateNotificationSettings({
        notification_enabled: newStatus,
      });
      
      console.log(`알림이 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      // 실패 시 원래 상태로 되돌리기
      setIsNotificationEnabled(!isNotificationEnabled);
    }
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white min-h-screen flex flex-col relative">
      {/* 헤더 - 그라데이션 배경과 그림자 효과 */}
      <div className="flex justify-between items-center p-6 pb-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold">💸</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              적립형 투자 챗봇
            </h1>
            <p className="text-sm text-gray-400">AI와 함께하는 스마트 투자</p>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      {/* 파일 업로드 영역 - 부드러운 애니메이션 */}
      {showFileUpload && (
        <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-300">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
      )}

      {/* 챗봇 대화 영역 - 개선된 스크롤바와 그라데이션 */}
      <div className="flex-1 mx-6 rounded-2xl p-6 overflow-y-auto mb-4 relative" 
           style={{ 
             maxHeight: 'calc(100vh - 250px)',
             background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)',
             backdropFilter: 'blur(10px)',
             border: '1px solid rgba(75, 85, 99, 0.3)'
           }}>
        {/* 스크롤바 스타일링 */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3B82F6, #8B5CF6);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563EB, #7C3AED);
          }
          
          /* textarea 스크롤바 숨기기 */
          textarea::-webkit-scrollbar {
            display: none;
          }
          textarea {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        <div className="space-y-6 custom-scrollbar">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isStreaming={isStreaming && message.id === messages[messages.length - 1]?.id}
            />
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-4 bg-gray-800/50 rounded-2xl px-6 py-4 backdrop-blur-sm">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDelay: '-0.5s'}}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200">AI가 응답을 생성하고 있습니다...</span>
                  <span className="text-xs text-gray-400">잠시만 기다려주세요</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 - 개선된 디자인과 애니메이션 */}
      <div className="mx-6 mb-6 rounded-2xl p-6 relative overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)',
             backdropFilter: 'blur(10px)',
             border: '1px solid rgba(75, 85, 99, 0.3)',
             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
           }}>
        {/* 배경 장식 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          {/* 알림 설정 버튼 - 개선된 디자인 */}
          <button
            className={`h-14 w-14 rounded-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 ${
              isNotificationEnabled 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 backdrop-blur-sm border border-gray-600/30'
            }`}
            onClick={toggleNotification}
            title="실시간 알림 설정"
          >
            <span className="text-xl">{isNotificationEnabled ? '🔔' : '🔕'}</span>
          </button>

          {/* 메시지 입력 - 개선된 디자인 */}
          <div className="flex-1 relative">
            <textarea
              value={question}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="금융 정보에 대해 질문하세요! (Enter로 전송, Shift+Enter로 줄바꿈)"
              className="w-full h-14 p-4 pr-16 bg-gray-800/50 text-white placeholder-gray-400 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm border border-gray-600/30 transition-all duration-200 overflow-hidden"
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
            {/* 입력 힌트 */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {question.length > 0 && `${question.length}자`}
            </div>
          </div>

          {/* 전송 버튼 - 개선된 디자인 */}
          <button
            className={`h-14 w-14 rounded-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 ${
              question.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
            }`}
            onClick={handleSend}
            disabled={!question.trim() || isLoading}
            title="메시지 전송"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl">➤</span>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default MainContent; 