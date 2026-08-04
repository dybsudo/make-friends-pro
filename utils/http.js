export function httpRequest({ url, method = 'GET', data, header = {}, timeout = 20000 }) {
	return new Promise((resolve, reject) => {
		uni.request({
			url,
			method,
			data,
			header,
			timeout,
			success: (response) => {
				const { statusCode, data: body } = response;

				if (statusCode >= 200 && statusCode < 300 && body && body.success !== false) {
					resolve(body.data);
					return;
				}

				const error = new Error((body && body.message) || '请求失败，请稍后再试。');
				error.statusCode = statusCode;
				error.response = body;
				reject(error);
			},
			fail: (error) => {
				reject(new Error(error.errMsg || '网络连接失败。'));
			}
		});
	});
}

export function httpUploadFile({ url, filePath, name = 'file', header = {}, defaultMessage }) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url,
			filePath,
			name,
			header,
			success: (response) => {
				let body = {};

				try {
					body = JSON.parse(response.data);
				} catch (error) {
					body = {};
				}

				if (response.statusCode >= 200 && response.statusCode < 300 && body.success !== false) {
					resolve(body.data);
					return;
				}

				const requestError = new Error(body.message || defaultMessage || '上传失败，请稍后再试。');
				requestError.statusCode = response.statusCode;
				requestError.response = body;
				reject(requestError);
			},
			fail: (error) => {
				reject(new Error(error.errMsg || defaultMessage || '上传失败，请稍后再试。'));
			}
		});
	});
}
