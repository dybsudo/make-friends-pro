function pad(value) {
	return String(value).padStart(2, '0');
}

export function formatDate(value) {
	if (!value) {
		return '--';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateTime(value) {
	if (!value) {
		return '--';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatRelativeTime(value) {
	if (!value) {
		return '--';
	}

	const target = new Date(value).getTime();
	if (Number.isNaN(target)) {
		return value;
	}

	const diff = Date.now() - target;
	const abs = Math.abs(diff);
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (abs < hour) {
		const minutes = Math.max(1, Math.round(abs / minute));
		return diff >= 0 ? `${minutes} 分钟前` : `${minutes} 分钟后`;
	}

	if (abs < day) {
		const hours = Math.max(1, Math.round(abs / hour));
		return diff >= 0 ? `${hours} 小时前` : `${hours} 小时后`;
	}

	const days = Math.max(1, Math.round(abs / day));
	return diff >= 0 ? `${days} 天前` : `${days} 天后`;
}

export function toOpenAtString(datetimeValue) {
	if (!datetimeValue) {
		return '';
	}

	return `${datetimeValue}:00+08:00`;
}
