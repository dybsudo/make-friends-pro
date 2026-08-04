import { request } from '../utils/request';

export function fetchCurrentUser() {
	return request({
		url: '/api/users/me'
	});
}

export function fetchCharmSummary() {
	return request({ url: '/api/users/me/charm' });
}

export function fetchInvitationSummary() {
	return request({ url: '/api/users/me/invitations' });
}

export function createInvitationCode() {
	return request({ url: '/api/users/me/invitation-code', method: 'POST' });
}

export function fetchMeetUsers(params = {}) {
	return request({
		url: '/api/users/meet',
		data: params
	});
}

export function fetchUserProfile(id) {
	return request({
		url: `/api/users/${encodeURIComponent(id || '')}/profile`
	});
}

export function updateProfile(payload) {
	return request({
		url: '/api/users/me',
		method: 'PATCH',
		data: payload
	});
}
