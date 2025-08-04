/**
 * 한국 시간대(KST) 처리 유틸리티
 */

// 한국 시간대 설정
const KST_TIMEZONE = 'Asia/Seoul';

/**
 * 현재 한국 시간을 반환
 * @returns {Date} 한국 시간 Date 객체
 */
export const getKSTNow = () => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: KST_TIMEZONE}));
};

/**
 * UTC 시간을 한국 시간으로 변환
 * @param {Date|string} utcDate - UTC 시간
 * @returns {Date} 한국 시간 Date 객체
 */
export const convertToKST = (utcDate) => {
  const date = new Date(utcDate);
  return new Date(date.toLocaleString("en-US", {timeZone: KST_TIMEZONE}));
};

/**
 * 한국 시간으로 포맷팅
 * @param {Date|string} date - 날짜
 * @param {string} format - 포맷 옵션 ('time', 'date', 'datetime')
 * @returns {string} 포맷된 시간 문자열
 */
export const formatKST = (date, format = 'datetime') => {
  const kstDate = convertToKST(date);
  
  switch (format) {
    case 'time':
      return kstDate.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: KST_TIMEZONE
      });
    case 'date':
      return kstDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: KST_TIMEZONE
      });
    case 'datetime':
    default:
      return kstDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: KST_TIMEZONE
      });
  }
};

/**
 * 상대적 시간 표시 (예: "3분 전", "1시간 전")
 * @param {Date|string} date - 날짜
 * @returns {string} 상대적 시간 문자열
 */
export const getRelativeTime = (date) => {
  const kstDate = convertToKST(date);
  const now = getKSTNow();
  const diffInSeconds = Math.floor((now - kstDate) / 1000);
  
  if (diffInSeconds < 60) {
    return '방금 전';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }
  
  return formatKST(date, 'date');
};

/**
 * 채팅 메시지용 시간 포맷
 * @param {Date|string} date - 날짜
 * @returns {string} 채팅용 시간 문자열
 */
export const formatChatTime = (date) => {
  const kstDate = convertToKST(date);
  const now = getKSTNow();
  
  // 오늘인지 확인
  const isToday = kstDate.toDateString() === now.toDateString();
  
  if (isToday) {
    return kstDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: KST_TIMEZONE
    });
  } else {
    return kstDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: KST_TIMEZONE
    });
  }
}; 