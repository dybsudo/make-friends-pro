import { request } from '../utils/request';

export function fetchMembership() {
	return request({ url: '/api/membership' });
}

export function createMembershipOrder(planType, options = {}) {
	return request({
		url: '/api/membership/orders',
		method: 'POST',
		data: {
			planType,
			recipientUserId: options.recipientUserId || '',
			conversationId: options.conversationId || ''
		}
	});
}

export function fetchMembershipOrder(orderId) {
	return request({ url: `/api/membership/orders/${encodeURIComponent(orderId || '')}` });
}
