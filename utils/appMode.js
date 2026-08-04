import { API_BASE_URL } from '../config/index';
import { httpRequest } from './http';

export const APP_MODE_FULL = 'full';
export const APP_MODE_COMMUNITY = 'community';

const COMMUNITY_HOME = '/pages/square/index';
const FULL_ONLY_ROUTES = [
	'/pages/meet/index',
	'/pages/messages/index',
	'/pages/chat/index',
	'/pages/drift/',
	'/pages/user/index',
	'/pages/follow/index',
	'/pages/notifications/index',
	'/pages/search/index',
	'/pages/diamonds/index',
	'/pages/charm/index',
	'/pages/giftGallery/index',
	'/pages/invite/index',
	'/pages/membership/',
	'/pages/tasks/index',
	'/pages/settings/privacy',
	'/pages/expand/index'
];

let currentMode = '';
let loadingPromise = null;
let navigationInterceptorsInstalled = false;
const listeners = new Set();

function normalizeMode(value) {
	return value === APP_MODE_FULL ? APP_MODE_FULL : APP_MODE_COMMUNITY;
}

function normalizeRoute(value) {
	const raw = String(value || '').trim();
	if (!raw) return '';
	const path = raw.split('?')[0];
	return path.startsWith('/') ? path : `/${path}`;
}

function getCurrentRoute() {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
	const current = pages[pages.length - 1];
	return normalizeRoute(current && current.route);
}

function emitModeChanged(mode) {
	listeners.forEach((listener) => {
		try {
			listener(mode);
		} catch (error) {}
	});
}

export async function loadAppMode(options = {}) {
	const force = Boolean(options.force);
	if (!force && currentMode) return currentMode;
	if (loadingPromise) return loadingPromise;

	loadingPromise = httpRequest({
		url: `${API_BASE_URL}/api/app/bootstrap`,
		method: 'GET',
		data: { _t: Date.now() },
		header: {
			'cache-control': 'no-cache',
			pragma: 'no-cache'
		}
	})
		.then((config = {}) => {
			const nextMode = normalizeMode(config.mode);
			const changed = currentMode !== nextMode;
			currentMode = nextMode;
			if (changed) emitModeChanged(nextMode);
			return currentMode;
		})
		.finally(() => {
			loadingPromise = null;
		});

	return loadingPromise;
}

export function getAppMode() {
	return currentMode;
}

export function isFullMode() {
	return currentMode === APP_MODE_FULL;
}

export function isCommunityMode() {
	return currentMode !== APP_MODE_FULL;
}

export function subscribeAppMode(listener) {
	if (typeof listener !== 'function') return () => {};
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function isFullOnlyRoute(value) {
	const route = normalizeRoute(value);
	return FULL_ONLY_ROUTES.some((item) => (
		item.endsWith('/') ? route.startsWith(item) : route === item
	));
}

export function syncTabBarVisibility() {
	try {
		if (isCommunityMode()) {
			uni.hideTabBar({ animation: false, fail: () => {} });
			return;
		}
		uni.showTabBar({ animation: false, fail: () => {} });
	} catch (error) {}
}

export function goCommunityHome(options = {}) {
	if (options.toast !== false) {
		uni.showToast({ title: '当前仅开放社区功能', icon: 'none' });
	}
	syncTabBarVisibility();
	setTimeout(() => {
		uni.switchTab({
			url: COMMUNITY_HOME,
			fail: () => uni.reLaunch({ url: COMMUNITY_HOME })
		});
	}, options.immediate ? 0 : 120);
}

export async function guardCurrentPage(routeValue = '') {
	const route = normalizeRoute(routeValue) || getCurrentRoute();
	const needsMask = !currentMode && isFullOnlyRoute(route);
	if (needsMask) {
		uni.showLoading({ title: '正在加载', mask: true });
	}

	try {
		await loadAppMode();
	} finally {
		if (needsMask) uni.hideLoading();
	}

	if (isCommunityMode() && isFullOnlyRoute(route)) {
		goCommunityHome({ immediate: true });
		return false;
	}
	return true;
}

export async function handleFeatureDisabled(error) {
	if (!error || !error.response || error.response.code !== 'FEATURE_DISABLED') return false;
	try {
		await loadAppMode({ force: true });
	} catch (refreshError) {
		currentMode = APP_MODE_COMMUNITY;
	}
	goCommunityHome();
	return true;
}

export function installNavigationInterceptors() {
	if (navigationInterceptorsInstalled || !uni.addInterceptor) return;
	navigationInterceptorsInstalled = true;

	['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'].forEach((method) => {
		uni.addInterceptor(method, {
			invoke(args = {}) {
				if (!isCommunityMode() || !isFullOnlyRoute(args.url)) return true;
				goCommunityHome();
				return false;
			}
		});
	});
}
