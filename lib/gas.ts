/**
 * VCEP: Google Apps Script (GAS) 연동 모듈 (2026)
 * Firebase를 대체하여 Google Sheets를 DB로 사용합니다.
 */

declare var process: {
  env: {
    NEXT_PUBLIC_GAS_URL?: string;
    NEXT_PUBLIC_GAS_SECRET?: string;
    [key: string]: string | undefined;
  };
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;
const GAS_SECRET = process.env.NEXT_PUBLIC_GAS_SECRET || 'vcep_secret_2026';

interface GASResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/**
 * GAS에서 데이터를 가져오는 유틸리티 (캐시 적용 가능)
 */
export async function fetchFromGAS<T>(action: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!GAS_URL) {
    console.error("GAS_URL이 설정되지 않았습니다.");
    return null;
  }

  const queryParams = new URLSearchParams({ action, secret: GAS_SECRET, ...params }).toString();
  const url = `${GAS_URL}?${queryParams}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result: GASResponse<T> = await response.json();
    if (result.status === 'success' && result.data) {
      return result.data;
    } else {
      console.warn(`GAS Error [${action}]:`, result.message);
      return null;
    }
  } catch (error) {
    console.error(`Fetch error [${action}]:`, error);
    return null;
  }
}

/**
 * GAS에 데이터를 저장하는 유틸리티
 */
export async function saveToGAS<T>(action: string, payload: any): Promise<boolean> {
  if (!GAS_URL) {
    console.error("GAS_URL이 설정되지 않았습니다.");
    return false;
  }

  try {
    // GAS doPost는 CORS 제약이 있을 수 있어 보통 GET 쿼리 스트링이나 
    // no-cors 모드를 사용하지만, JSON 전송을 위해 다음과 같이 구현합니다.
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // GAS 리디렉션 이슈 대응
      body: JSON.stringify({ action, secret: GAS_SECRET, ...payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 가정하거나 
    // 별도의 콜백 로직이 필요할 수 있습니다.
    return true;
  } catch (error) {
    console.error(`Save error [${action}]:`, error);
    return false;
  }
}
