/**
 * VCEP: Backend Google Apps Script (2026)
 * 구글 스프레드시트를 데이터베이스로 사용하는 고성능 API
 * 
 * [설치 방법]
 * 1. 구글 스프레드시트 생성
 * 2. 'resources' 시트와 'institutions' 시트 생성
 * 3. 확장 프로그램 > Apps Script 클릭
 * 4. 이 코드를 붙여넣고 '배포' > '새 배포' > '웹 앱'으로 배포
 */

const SPREADSHEET_ID = '여러분의_스프레드시트_ID_여기에_입력';
const CACHE_TTL = 3600; // 1시간 캐시
const API_SECRET_KEY = PropertiesService.getScriptProperties().getProperty('API_SECRET_KEY') || 'vcep_secret_2026'; // 앱스 스크립트 속성에서 읽어오거나 기본값 사용

/**
 * 초기 설정 및 데이터 요청 처리
 */
function doGet(e) {
  const secret = e.parameter.secret;
  if (secret !== API_SECRET_KEY) {
    return createResponse('error', null, 'Unauthorized API Access');
  }

  const action = e.parameter.action;
  const userId = e.parameter.userId || "guest";
  
  try {
    let result;
    switch (action) {
      case 'setup':
        result = initSpreadsheet();
        break;
      case 'getInstitutions':
        result = getSheetData('institutions');
        break;
      case 'getResources':
        result = getSheetData('resources');
        break;
      case 'getActivities':
        result = getSheetData('activities');
        break;
      case 'adminLogin':
        result = checkAdminLogin(e.parameter.username, e.parameter.password);
        break;
      default:
        return createResponse('error', 'Invalid action');
    }
    return createResponse('success', result);
  } catch (error) {
    return createResponse('error', error.toString());
  }
}

/**
 * 관리자 로그인 확인
 */
function checkAdminLogin(username, password) {
  const data = getSheetData('관리자');
  const user = data.find(row => row.username == username && row.password == password);
  if (user) {
    return { success: true, user: { username: user.username, role: 'admin' } };
  } else {
    return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); 
    
    const contents = JSON.parse(e.postData.contents);
    const secret = contents.secret;
    
    if (secret !== API_SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Unauthorized API Access'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = contents.action;
    const payload = contents.payload;
    
    let result;
    switch (action) {
      case 'addInstitution':
        result = saveToSheet('institutions', { ...payload, id: Utilities.getUuid(), createdAt: new Date() });
        break;
      case 'updateInstitution':
        result = updateSheetRow('institutions', payload.id, payload);
        break;
      case 'deleteInstitution':
        result = deleteFromSheet('institutions', payload.id);
        break;
      case 'addResource':
        result = saveToSheet('resources', { ...payload, id: Utilities.getUuid(), createdAt: new Date(), views: 0 });
        break;
      case 'updateResource':
        result = updateSheetRow('resources', payload.id, payload);
        break;
      case 'deleteResource':
        result = deleteFromSheet('resources', payload.id);
        break;
      case 'saveActivity':
        result = saveToSheet('activities', payload);
        break;
      default:
        result = { status: 'error', message: 'Invalid post action' };
    }
    
    // 캐시 초기화
    const cache = CacheService.getScriptCache();
    cache.remove("vcep_institutions");
    cache.remove("vcep_resources");

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * 시트에서 특정 ID의 행 삭제
 */
function deleteFromSheet(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  const idIndex = values[0].indexOf('id');
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'ID not found' };
}

/**
 * 시트의 특정 ID 행 업데이트
 */
function updateSheetRow(sheetName, id, payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      const rowNum = i + 1;
      headers.forEach((header, colIndex) => {
        if (payload[header] !== undefined) {
          sheet.getRange(rowNum, colIndex + 1).setValue(payload[header]);
        }
      });
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'ID not found' };
}

/**
 * 스프레드시트 초기 환경 설정 (시트 생성 및 헤더 스타일 적용)
 */
function initSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetsInfo = [
    { name: '관리자', headers: ['username', 'password'], defaultData: ['admin', '1234'] },
    { name: 'institutions', headers: ['id', 'name', 'type', 'createdAt'] },
    { name: 'resources', headers: ['id', 'title', 'description', 'institutionId', 'guideUrl', 'thumbnailUrl', 'password', 'isPasswordProtected', 'updatedAt', 'views'] },
    { name: 'activities', headers: ['resourceId', 'resourceTitle', 'institutionName', 'timestamp', 'type'] }
  ];

  sheetsInfo.forEach(info => {
    let sheet = ss.getSheetByName(info.name);
    if (!sheet) {
      sheet = ss.insertSheet(info.name);
    } else {
      sheet.clear(); // 기존 내용 초기화 (주의: 운영 중에는 주의 필요)
    }

    // 헤더 삽입
    sheet.getRange(1, 1, 1, info.headers.length).setValues([info.headers]);

    // 헤더 스타일 적용
    const headerRange = sheet.getRange(1, 1, 1, info.headers.length);
    headerRange.setBackground('#cfe2f3') // 연한 하늘색
               .setFontWeight('bold')    // 굵게
               .setHorizontalAlignment('center') // 가운데 정렬
               .setBorder(true, true, true, true, true, true, '#999999', SpreadsheetApp.BorderStyle.SOLID);
    
    // 기본 데이터 삽입 (관리자 시트의 경우)
    if (info.defaultData) {
      sheet.getRange(2, 1, 1, info.defaultData.length).setValues([info.defaultData]);
    }

    // 열 너비 자동 조정
    sheet.autoResizeColumns(1, info.headers.length);
  });

  return { status: 'success', message: '스프레드시트 환경 설정이 완료되었습니다. (관리자 계정: admin / 1234)' };
}

/**
 * 시트 데이터를 JSON 배열로 변환 (캐시 서비스 활용)
 */
function getSheetData(sheetName) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("vcep_" + sheetName);
  if (cached) return JSON.parse(cached);

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const data = values.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  cache.put("vcep_" + sheetName, JSON.stringify(data), CACHE_TTL);
  return data;
}

/**
 * 데이터를 시트에 저장
 */
function saveToSheet(sheetName, payload) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    // 시트가 없으면 헤더와 함께 생성
    const newSheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(sheetName);
    const headers = Object.keys(payload);
    newSheet.appendRow(headers);
  }
  
  const targetSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const headers = targetSheet.getDataRange().getValues()[0];
  const row = headers.map(header => payload[header] || "");
  targetSheet.appendRow(row);
  
  return { status: 'success' };
}

function createResponse(status, data) {
  const output = JSON.stringify({ status: status, data: data });
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}
