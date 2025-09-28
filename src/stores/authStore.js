import { ref, computed } from 'vue';

// 전역변수
const TOKEN_KEY = 'accessToken';
const accessToken = ref(localStorage.getItem(TOKEN_KEY));

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    
    // Base64를 UTF-8 문자열로 변환
    const base64UrlDecode = (str) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return jsonPayload;
    };
    
    const jsonPayload = base64UrlDecode(payload);
    const decodedPayload = JSON.parse(jsonPayload);
    
    return decodedPayload.nickname || '사용자'; 
  } catch (e) {
    console.error("토큰 디코딩 오류:", e);
    return null;
  }
};

// 로그인 여부 확인
export const isLoggedIn = computed(() => !!accessToken.value);

// 유저 닉네임
export const userNickname = computed(() => {
  if (isLoggedIn.value && accessToken.value) {
    return decodeToken(accessToken.value);
  }
  return null;
});

// AccessToken 획득
export const getAccessToken = () => {
    return accessToken.value;
};

// 로그인 (AccessToken 저장)
export const login = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  accessToken.value = token;
};

// 로그아웃 (AccessToken 제거)
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  accessToken.value = null;
};