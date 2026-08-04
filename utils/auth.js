import { API_BASE_URL, WECHAT_APP_ID } from '../config/index';
import { httpRequest } from './http';

const TOKEN_STORAGE_KEY = 'thought-auth-token';
const USER_STORAGE_KEY = 'thought-auth-user';
const PENDING_INVITER_STORAGE_KEY = 'thought-pending-inviter';

let cachedToken = '';
let cachedUser = null;
let authPromise = null;

function readToken() {
	if (cachedToken) {
		return cachedToken;
	}

	try {
		cachedToken = uni.getStorageSync(TOKEN_STORAGE_KEY) || '';
	} catch (error) {
		cachedToken = '';
	}

	return cachedToken;
}

function readUser() {
	if (cachedUser) {
		return cachedUser;
	}

	try {
		cachedUser = uni.getStorageSync(USER_STORAGE_KEY) || null;
	} catch (error) {
		cachedUser = null;
	}

	return cachedUser;
}

function writeSession(token, user) {
	cachedToken = token || '';
	cachedUser = user || null;

	try {
		if (token) {
			uni.setStorageSync(TOKEN_STORAGE_KEY, token);
		} else {
			uni.removeStorageSync(TOKEN_STORAGE_KEY);
		}

		if (user) {
			uni.setStorageSync(USER_STORAGE_KEY, user);
		} else {
			uni.removeStorageSync(USER_STORAGE_KEY);
		}
	} catch (error) {}
}

function getWechatLoginCode() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.login({
			provider: 'weixin',
			success: (response) => {
				if (response && response.code) {
					resolve(response.code);
					return;
				}

				reject(new Error('未获取到有效的微信登录 code。'));
			},
			fail: (error) => {
				reject(new Error((error && error.errMsg) || '微信登录失败，请稍后再试。'));
			}
		});
		return;
		// #endif

		// #ifndef MP-WEIXIN
		reject(new Error('请在微信小程序环境下使用静默登录。'));
		// #endif
	});
}

async function loginSilently() {
	const code = await getWechatLoginCode();
	const session = await httpRequest({
		url: `${API_BASE_URL}/api/auth/login`,
		method: 'POST',
		data: {
			code,
			appId: WECHAT_APP_ID,
			inviterId: getPendingInviter()
		},
		header: {
			'content-type': 'application/json'
		}
	});

	writeSession(session.token, session.user);
	clearPendingInviter();
	return session.user;
}

export function getAuthToken() {
	return readToken();
}

export function getCurrentUser() {
	return readUser();
}

export function clearSession() {
	writeSession('', null);
}

export function setPendingInviter(userId) {
	const inviterId = String(userId || '').trim();
	if (!inviterId) return;
	try { uni.setStorageSync(PENDING_INVITER_STORAGE_KEY, inviterId); } catch (error) {}
}

function getPendingInviter() {
	try { return String(uni.getStorageSync(PENDING_INVITER_STORAGE_KEY) || '').trim(); } catch (error) { return ''; }
}

function clearPendingInviter() {
	try { uni.removeStorageSync(PENDING_INVITER_STORAGE_KEY); } catch (error) {}
}

export function getAuthHeaders(includeJson = true) {
	const headers = {};
	const token = getAuthToken();

	if (token) {
		headers.authorization = `Bearer ${token}`;
	}

	if (includeJson) {
		headers['content-type'] = 'application/json';
	}

	return headers;
}

export function refreshCachedUser(updates) {
	const current = readUser() || {};
	const updated = { ...current, ...updates };
	writeSession(readToken(), updated);
	return updated;
}

export async function ensureSession(options = {}) {
	const force = Boolean(options.force);

	if (force) {
		clearSession();
	}

	if (!force && getAuthToken()) {
		return getCurrentUser();
	}

	if (authPromise) {
		return authPromise;
	}

	authPromise = loginSilently().finally(() => {
		authPromise = null;
	});

	return authPromise;
}
