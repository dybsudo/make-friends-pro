import { request } from '../utils/request';

export function fetchNotifications(params = {}) {
	return request({
		url: '/api/notifications',
		data: params
	});
}

export function fetchNotificationSummary() {
	return request({
		url: '/api/notifications/summary'
	});
}

export function markNotificationRead(id) {
	return request({
		url: `/api/notifications/${encodeURIComponent(id || '')}/read`,
		method: 'POST'
	});
}

export function markNotificationsReadAll(type = '') {
	return request({
		url: '/api/notifications/read-all',
		method: 'POST',
		data: { type }
	});
}
