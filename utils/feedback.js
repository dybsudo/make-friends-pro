const CONTENT_SECURITY_CODES = new Set([
	'CONTENT_SECURITY_RISKY',
	'CONTENT_SECURITY_REVIEW'
]);

function getErrorCode(error) {
	if (!error || !error.response || typeof error.response !== 'object') {
		return '';
	}

	return typeof error.response.code === 'string' ? error.response.code : '';
}

function getErrorMessage(error, fallbackMessage) {
	const message = String((error && error.message) || '').trim();
	return message || fallbackMessage;
}

export function showRequestError(error, fallbackMessage = '操作失败，请稍后再试') {
	const code = getErrorCode(error);
	const message = getErrorMessage(error, fallbackMessage);

	if (CONTENT_SECURITY_CODES.has(code)) {
		uni.showModal({
			title: '内容提示',
			content: message,
			showCancel: false,
			confirmText: '我知道了'
		});
		return;
	}

	uni.showToast({
		title: message,
		icon: 'none'
	});
}
