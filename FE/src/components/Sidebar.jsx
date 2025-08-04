import React, { useState, useEffect } from "react";
import useAuthStore from "../stores/authStore";
import apiService from "../services/api";
import ETFInvestmentSettings from "./ETFInvestmentSettings";

const ETF_LIST = [
  "미국 S&P500(SPY)",
  "미국 나스닥(QQQ)",
  "한국(EWY)",
  "일본(EWJ)",
  "중국(MCHI)",
  "유럽(VGK)",
];

const Sidebar = () => {
  const [selectedETFs, setSelectedETFs] = useState([]);
  const [riskLevel, setRiskLevel] = useState("5");
  const [apiKey, setApiKey] = useState("");
  const [modelType, setModelType] = useState("clova-x");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general"); // "general" 또는 "etf-settings"
  const { user } = useAuthStore();

  const handleETFChange = (etf) => {
    if (selectedETFs.includes(etf)) {
      setSelectedETFs(selectedETFs.filter((item) => item !== etf));
    } else {
      setSelectedETFs([...selectedETFs, etf]);
    }
  };

  // 컴포넌트 마운트 시 기존 설정 로드
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const responseSettings = await apiService.getUserInvestmentSettings();
        if (responseSettings.settings) {
          setRiskLevel(responseSettings.settings.risk_level?.toString() || "5");
          setApiKey(responseSettings.settings.api_key || "");
          setModelType(responseSettings.settings.model_type || "clova-x");
        }
        if (responseSettings.etfs) {
          const etfSymbols = responseSettings.etfs.map(p => `${p.name}(${p.symbol})`);
          setSelectedETFs(etfSymbols);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    };

    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // ETF 심볼 추출 (예: "미국 S&P500(SPY)" -> "SPY")
      const etfSymbols = selectedETFs.map(etf => {
        return etf.split("(")[1].split(")")[0];
      });

      // 설정 저장
      await apiService.updateInvestmentSettings({
        risk_level: parseInt(riskLevel),
        api_key: apiKey,
        model_type: modelType,
		etf_symbols: etfSymbols,
      });

      setMessage("설정이 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setMessage("설정 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // ETF 설정 변경 핸들러
  const handleETFSettingsChange = (settings) => {
    console.log('ETF 설정 변경:', settings);
    // 여기서 필요한 추가 로직을 수행할 수 있습니다
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col z-40 border-r border-gray-700/50 shadow-2xl">
      {/* 스크롤 가능한 컨테이너 */}
      <div className="flex flex-col h-full overflow-y-auto p-6">
        {/* 헤더 */}
        <div className="mb-8 pb-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">⚙️</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              설정
            </h2>
          </div>
          <p className="text-xs text-gray-400">AI 모델과 투자 설정을 관리하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="flex bg-gray-800/50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "general"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              일반 설정
            </button>
            <button
              onClick={() => setActiveTab("etf-settings")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "etf-settings"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              ETF 설정
            </button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === "general" ? (
          // 일반 설정 탭
          <>
            {/* 모델 선택 및 API 키 입력 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
                <h3 className="font-semibold text-gray-200">AI 모델 설정</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="api-key">
                    API KEY
                  </label>
                  <input 
                    id="api-key" 
                    type="text" 
                    placeholder="API 키를 입력하세요" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/30 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="model">
                    사용할 모델
                  </label>
                  <select 
                    id="model" 
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-600/30 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="clova-x">Clova X</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o-mini</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                <h3 className="font-semibold text-gray-200">사용자 정보</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      투자 성향
                    </label>
                    <span className="text-sm font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                      {riskLevel !== "" ? riskLevel : "-"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={riskLevel}
                      onChange={e => setRiskLevel(e.target.value)}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>보수적</span>
                      <span>공격적</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ETF 선택 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs">📈</span>
                </div>
                <h3 className="font-semibold text-gray-200">투자 ETF</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-400">현재 투자하고 있는 ETF를 선택하세요</p>
                
                {/* ETF 선택 카드 그리드 */}
                <div className="grid grid-cols-1 gap-3">
                  {ETF_LIST.map((etf) => {
                    const isSelected = selectedETFs.includes(etf);
                    const symbol = etf.split("(")[1].split(")")[0];
                    const name = etf.split("(")[0];
                    
                    return (
                      <div
                        key={etf}
                        onClick={() => handleETFChange(etf)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-lg shadow-blue-500/25'
                            : 'bg-gray-800/30 border-gray-600/30 hover:bg-gray-800/50 hover:border-gray-500/50'
                        }`}
                      >
                        {/* 선택 표시 */}
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-500'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        {/* ETF 정보 */}
                        <div className="flex items-center gap-3">
                          {/* ETF 아이콘 */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                              : 'bg-gradient-to-r from-gray-600 to-gray-700'
                          }`}>
                            <span className="text-sm font-bold text-white">{symbol}</span>
                          </div>
                          
                          {/* ETF 이름과 설명 */}
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${
                              isSelected ? 'text-blue-300' : 'text-gray-200'
                            }`}>
                              {name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {symbol} • {isSelected ? '선택됨' : '선택 안됨'}
                            </p>
                          </div>
                        </div>
                        
                        {/* 호버 효과 */}
                        <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-100'
                            : 'bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 hover:opacity-100'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* 스페이서 - 남은 공간을 차지 */}
            <div className="flex-1"></div>
            
            {/* 메시지 표시 */}
            {message && (
              <div className={`text-sm p-4 rounded-xl mb-4 backdrop-blur-sm border ${
                message.includes('성공') 
                  ? 'bg-green-900/20 text-green-300 border-green-500/30' 
                  : 'bg-red-900/20 text-red-300 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {message.includes('성공') ? '✅' : '❌'}
                  </span>
                  <span>{message}</span>
                </div>
              </div>
            )}
            
            {/* 저장 버튼 */}
            <button 
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                isLoading
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25'
              }`}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>저장 중...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>💾</span>
                  <span>설정 저장</span>
                </div>
              )}
            </button>
          </>
        ) : (
          // ETF 설정 탭
          <ETFInvestmentSettings 
            selectedETFs={selectedETFs}
            onSettingsChange={handleETFSettingsChange}
          />
        )}
      </div>

      {/* 커스텀 스타일 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #f97316);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #f97316);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar; 