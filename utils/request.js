import { API_BASE_URL } from '../config/index';
import { clearSession, ensureSession, getAuthHeaders } from './auth';
import { handleFeatureDisabled } from './appMode';
import { httpRequest, httpUploadFile } from './http';

function normalizeUploadUrl(url) {
	if (!url) {
		return '';
	}

	return String(url).replace(/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?=\/uploads\/)/i, API_BASE_URL);
}

function normalizeUploadedFile(file) {
	if (!file) {
		return file;
	}

	return {
		...file,
		url: normalizeUploadUrl(file.url)
	};
}

async function performRequest(options, canRetry = true) {
	try {
		const method = String(options.method || 'GET').toUpperCase();
		const data = method === 'GET'
			? { ...(options.data || {}), _t: Date.now() }
			: options.data;
		const headers = getAuthHeaders(true);
		if (method === 'GET') {
			headers['cache-control'] = 'no-cache';
			headers.pragma = 'no-cache';
		}

		return await httpRequest({
			url: `${API_BASE_URL}${options.url}`,
			method,
			data,
			header: headers
		});
	} catch (error) {
		if (await handleFeatureDisabled(error)) {
			throw error;
		}
		if (canRetry && error && error.statusCode === 401) {
			clearSession();
			await ensureSession({ force: true });
			return performRequest(options, false);
		}

		throw error;
	}
}

async function performUpload({ url, filePath, defaultMessage }, canRetry = true) {
	try {
		const result = await httpUploadFile({
			url,
			filePath,
			name: 'file',
			header: getAuthHeaders(false),
			defaultMessage
		});

		return normalizeUploadedFile(result.file);
	} catch (error) {
		if (canRetry && error && error.statusCode === 401) {
			clearSession();
			await ensureSession({ force: true });
			return performUpload({ url, filePath, defaultMessage }, false);
		}

		throw error;
	}
}

export async function request({ url, method = 'GET', data }) {
	await ensureSession();
	return performRequest({ url, method, data });
}

export async function uploadImage(filePath) {
	await ensureSession();
	return performUpload({
		url: `${API_BASE_URL}/api/uploads/images`,
		filePath,
		defaultMessage: '图片上传失败。'
	});
}

export async function uploadAudio(filePath) {
	await ensureSession();
	return performUpload({
		url: `${API_BASE_URL}/api/uploads/audios`,
		filePath,
		defaultMessage: '语音上传失败。'
	});
}
