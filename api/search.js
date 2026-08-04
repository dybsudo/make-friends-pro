import { request } from '../utils/request';

export function searchContent(params = {}) {
	return request({ url: '/api/search', data: params });
}
