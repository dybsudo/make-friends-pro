import { request } from '../utils/request';

export function createThought(payload) {
	return request({
		url: '/api/capsules',
		method: 'POST',
		data: payload
	});
}

export function fetchMyThoughts() {
	return request({
		url: '/api/capsules/my'
	});
}

export function fetchFavoriteThoughts(params = {}) {
	return request({
		url: '/api/capsules/favorites',
		data: params
	});
}

export function fetchThoughtDetail(id) {
	return request({
		url: `/api/capsules/${id}`
	});
}

export function deleteThought(id) {
	return request({
		url: `/api/capsules/${id}`,
		method: 'DELETE'
	});
}

export function fetchSquareFeed(params = {}) {
	return request({
		url: '/api/plaza/feed',
		data: params
	});
}

export function fetchTodayTopics() {
	return request({
		url: '/api/plaza/topics/today'
	});
}

export function toggleThoughtFavorite(id) {
	return request({
		url: `/api/capsules/${id}/favorite`,
		method: 'POST'
	});
}

export function toggleThoughtResonance(id) {
	return request({
		url: `/api/capsules/${id}/resonance`,
		method: 'POST'
	});
}

export function createThoughtComment(id, content, payload = {}) {
	return request({
		url: `/api/capsules/${id}/comments`,
		method: 'POST',
		data: { ...payload, content }
	});
}

export function createThoughtExpansion(id, payload) {
	return request({
		url: `/api/capsules/${id}/expansions`,
		method: 'POST',
		data: payload
	});
}

export function createThoughtReport(id, payload) {
	return request({
		url: `/api/capsules/${id}/reports`,
		method: 'POST',
		data: payload
	});
}
