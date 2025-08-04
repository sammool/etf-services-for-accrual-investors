import React, { useState, useEffect } from "react";
import apiService from "../services/api";

const ETFInvestmentSettings = ({ selectedETFs, onSettingsChange }) => {
  const [etfSettings, setEtfSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isFetching, setIsFetching] = useState(true); // DB 데이터 로딩 상태

  // 투자 주기 옵션
  const investmentCycles = [
    { value: "daily", label: "매일" },
    { value: "weekly", label: "매주" },
    { value: "monthly", label: "매월" },
  ];

  // 요일 옵션 (매주 투자용) - 월요일을 0으로 통일
  const weekDays = [
    { value: "0", label: "월요일" },
    { value: "1", label: "화요일" },
    { value: "2", label: "수요일" },
    { value: "3", label: "목요일" },
    { value: "4", label: "금요일" },
    { value: "5", label: "토요일" },
    { value: "6", label: "일요일" },
  ];

  // 일 옵션 (매월 투자용)
  const monthDays = Array.from({ length: 28 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}일`,
  }));

  // DB에서 ETF별 투자 설정 불러오기 (한 번만 실행)
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const res = await apiService.getETFInvestmentSettings();
        // res.etf_settings: [{symbol, name, cycle, day, amount, ...}]
        const dbSettings = {};
        if (res && Array.isArray(res.etf_settings)) {
          res.etf_settings.forEach(setting => {
            dbSettings[setting.symbol] = {
              cycle: setting.cycle,
              day: setting.day.toString(),
              amount: setting.amount.toString(),
              name: setting.name || setting.symbol
            };
          });
        }
        if (isMounted) {
          setEtfSettings(dbSettings);
        }
      } catch (error) {
        console.error("ETF 설정 로드 실패:", error);
        // DB에 정보가 없을 수도 있으니 기존 설정 유지 (빈 객체로 초기화하지 않음)
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // selectedETFs 변경 시, 누락된 ETF만 추가 (기존 설정 보존)
  useEffect(() => {
    if (isFetching) return;
    
    setEtfSettings(prev => {
      const newSettings = { ...prev };
      
      // 새로 선택된 ETF들에 대해 기본값 추가 (기존 설정 보존)
      selectedETFs.forEach(etf => {
        const etfSymbol = etf.split("(")[1].split(")")[0];
        if (!newSettings[etfSymbol]) {
          newSettings[etfSymbol] = {
            cycle: "monthly",
            day: "1",
            amount: "",
            name: etf
          };
        } else {
          // name 동기화 (기존 설정은 유지)
          newSettings[etfSymbol].name = etf;
        }
      });
      
      return newSettings;
    });
  }, [selectedETFs, isFetching]);

  // 설정 변경 핸들러
  const handleSettingChange = (etfSymbol, field, value) => {
    setEtfSettings(prev => ({
      ...prev,
      [etfSymbol]: {
        ...prev[etfSymbol],
        [field]: value
      }
    }));
  };

  // 설정 저장
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // 선택된 ETF의 설정만 필터링하여 전송
      const settingsArray = Object.entries(etfSettings)
        .filter(([symbol]) => 
          selectedETFs.some(etf => etf.includes(symbol))
        )
        .map(([symbol, settings]) => ({
          symbol,
          name: settings.name,
          cycle: settings.cycle,
          day: parseInt(settings.day),
          amount: parseInt(settings.amount) || 0
        }));

      // API 호출하여 설정 저장
      await apiService.updateETFInvestmentSettings(settingsArray);
      setMessage("ETF 투자 설정이 성공적으로 저장되었습니다!");
      // 부모 컴포넌트에 변경 알림
      if (onSettingsChange) {
        onSettingsChange(settingsArray);
      }
    } catch (error) {
      console.error('ETF 설정 저장 실패:', error);
      setMessage("ETF 설정 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // ETF 설정 카드 렌더링
  const renderETFCard = (etf) => {
    const etfSymbol = etf.split("(")[1].split(")")[0];
    const settings = etfSettings[etfSymbol] || {};

    return (
      <div key={etfSymbol} className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-4 mb-4">
        {/* ETF 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">📈</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">{etf}</h3>
              <p className="text-xs text-gray-400">개별 투자 설정</p>
            </div>
          </div>
        </div>

        {/* 투자 주기 설정 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            투자 주기
          </label>
          <div className="grid grid-cols-3 gap-2">
            {investmentCycles.map(cycle => (
              <label
                key={cycle.value}
                className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  settings.cycle === cycle.value
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <input
                  type="radio"
                  name={`cycle-${etfSymbol}`}
                  value={cycle.value}
                  checked={settings.cycle === cycle.value}
                  onChange={(e) => handleSettingChange(etfSymbol, 'cycle', e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{cycle.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 투자 일 설정 */}
        {settings.cycle !== 'daily' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              투자 일
            </label>
            <select
              value={settings.day || "1"}
              onChange={(e) => handleSettingChange(etfSymbol, 'day', e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600/30 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
            >
              {settings.cycle === 'weekly' ? (
                // 매주 투자 시 요일 선택
                weekDays.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))
              ) : settings.cycle === 'monthly' ? (
                // 매월 투자 시 일 선택
                monthDays.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))
              ) : (
                // 기본값
                <option value="1">1일</option>
              )}
            </select>
          </div>
        )}

        {/* 투자 금액 설정 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            투자 금액
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.amount || ""}
              onChange={(e) => handleSettingChange(etfSymbol, 'amount', e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="w-full p-3 pr-16 rounded-xl bg-gray-700/50 border border-gray-600/30 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 font-medium">
              만원
            </div>
          </div>
          {settings.amount && (
            <p className="text-xs text-blue-400 mt-1">
              {parseInt(settings.amount || 0).toLocaleString()}만원 ({parseInt(settings.amount || 0) * 10000}원)
            </p>
          )}
        </div>
      </div>
    );
  };

  if (selectedETFs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📈</span>
        </div>
        <p className="text-gray-400">먼저 투자할 ETF를 선택해주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
          <span className="text-lg">⚙️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            ETF별 투자 설정
          </h2>
          <p className="text-sm text-gray-400">각 ETF의 투자 주기, 일, 금액을 개별적으로 설정하세요</p>
        </div>
      </div>

      {/* ETF 설정 카드들 */}
      <div className="space-y-4">
        {selectedETFs.map(renderETFCard)}
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className={`text-sm p-4 rounded-xl backdrop-blur-sm border ${
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
            : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg shadow-yellow-500/25'
        }`}
        onClick={handleSaveSettings}
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
            <span>ETF 설정 저장</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ETFInvestmentSettings; 