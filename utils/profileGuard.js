import { fetchCurrentUser } from '../api/user';
import { ensureSession, getCurrentUser, refreshCachedUser } from './auth';
import { isCommunityMode } from './appMode';

const COMPLETE_PAGE = '/pages/profileComplete/index';

function getCurrentRoute() {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
	const current = pages[pages.length - 1];
	if (!current || !current.route) {
		return '';
	}

	const options = current.options || {};
	const query = Object.keys(options)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(options[key])}`)
		.join('&');

	return `/${current.route}${query ? `?${query}` : ''}`;
}

function applyPendingProfile(user = {}) {
	const audit = user.pendingProfileAudit || user.audit || null;
	if (!audit || !['pending', 'review'].includes(audit.status)) {
		return user;
	}

	return {
		...user,
		nickname: audit.nickname || user.nickname,
		avatarUrl: audit.avatarUrl || user.avatarUrl
	};
}

export function isProfileCompleted(rawUser = {}) {
	const user = applyPendingProfile(rawUser);
	if (isCommunityMode()) {
		return Boolean(user.nickname && user.avatarUrl);
	}

	if (user.profileCompleted) {
		return true;
	}

	return Boolean(
		user.nickname &&
			user.avatarUrl &&
			user.gender &&
			user.birthDate &&
			Number(user.age || 0) > 0 &&
			user.city
	);
}

function openCompletePage() {
	const currentRoute = getCurrentRoute();
	if (currentRoute.startsWith(COMPLETE_PAGE)) {
		return;
	}

	const redirect = currentRoute ? `?redirect=${encodeURIComponent(currentRoute)}` : '';
	uni.navigateTo({
		url: `${COMPLETE_PAGE}${redirect}`
	});
}

export async function ensureProfileCompleted(options = {}) {
	const actionText = options.actionText || '继续';

	try {
		await ensureSession();
		let user = applyPendingProfile(getCurrentUser() || {});

		if (!isProfileCompleted(user)) {
			const latest = applyPendingProfile(await fetchCurrentUser());
			user = refreshCachedUser({
				...latest,
				profileCompleted: isProfileCompleted(latest)
			});
		}

		if (isProfileCompleted(user)) {
			return true;
		}

		uni.showToast({
			title: `先补充资料再${actionText}`,
			icon: 'none'
		});
		setTimeout(openCompletePage, 450);
		return false;
	} catch (error) {
		uni.showToast({
			title: '请先登录并补充资料',
			icon: 'none'
		});
		setTimeout(openCompletePage, 450);
		return false;
	}
}

export default {
	ensureProfileCompleted,
	isProfileCompleted
};
