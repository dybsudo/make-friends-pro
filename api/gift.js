import { request } from '../utils/request';

export function fetchGifts() {
	return request({ url: '/api/gifts' });
}

export function fetchGiftGallery() {
	return request({ url: '/api/users/me/gift-gallery' });
}

export function sendGift(conversationId, payload) {
	return request({
		url: `/api/conversations/${conversationId}/gifts`,
		method: 'POST',
		data: payload
	});
}
