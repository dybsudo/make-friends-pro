import { request } from '../utils/request';

export function followUser(id) {
	return request({
		url: `/api/users/${encodeURIComponent(id || '')}/follow`,
		method: 'POST'
	});
}

export function unfollowUser(id) {
	return request({
		url: `/api/users/${encodeURIComponent(id || '')}/follow`,
		method: 'DELETE'
	});
}

export function fetchFollowing(id = 'me') {
	return request({
		url: `/api/users/${encodeURIComponent(id || 'me')}/following`
	});
}

export function fetchFollowers(id = 'me') {
	return request({
		url: `/api/users/${encodeURIComponent(id || 'me')}/followers`
	});
}
