import { request } from '../utils/request';

export const DEFAULT_DIAMOND_RECHARGE_PLANS = [
	{ type: 'diamonds_60', diamonds: 60, price: 6, label: '轻量补充' },
	{ type: 'diamonds_300', diamonds: 300, price: 30, label: '常用面额', recommended: true },
	{ type: 'diamonds_680', diamonds: 680, price: 68, label: '畅享面额' }
];

export function fetchDiamonds() {
	return request({ url: '/api/diamonds' });
}

export function completeBrowseTask() {
	return request({ url: '/api/diamonds/tasks/browse', method: 'POST' });
}

export function createDiamondOrder(planType) {
	return request({
		url: '/api/diamonds/orders',
		method: 'POST',
		data: { planType }
	});
}

export function fetchDiamondOrder(orderId) {
	return request({ url: `/api/diamonds/orders/${encodeURIComponent(orderId || '')}` });
}
