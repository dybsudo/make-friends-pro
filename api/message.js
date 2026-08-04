import { request } from '../utils/request';

export function fetchConversations() {
	return request({
		url: '/api/conversations'
	});
}

export function ensurePrivateConversation(peerUserId) {
	return request({
		url: '/api/conversations/private',
		method: 'POST',
		data: { peerUserId }
	});
}

export function fetchConversationMessages(id, params = {}) {
	return request({
		url: `/api/conversations/${id}/messages`,
		data: params
	});
}

export function sendConversationMessage(id, payload) {
	return request({
		url: `/api/conversations/${id}/messages`,
		method: 'POST',
		data: payload
	});
}

export function markConversationRead(id) {
	return request({
		url: `/api/conversations/${id}/read`,
		method: 'POST'
	});
}

export function markMessageDelivered(conversationId, messageId) {
	return request({
		url: `/api/conversations/${conversationId}/messages/${messageId}/delivered`,
		method: 'POST'
	});
}
