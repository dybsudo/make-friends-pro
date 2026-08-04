<template>
	<view class="vip-name" :class="{ member: isMember }">
		<text class="vip-name-text">{{ name }}</text>
		<image v-if="isMember" class="vip-name-icon" src="/static/img/vip.png" mode="aspectFit" />
	</view>
</template>

<script>
export default {
	name: 'VipName',
	props: {
		name: { type: String, default: '' },
		isMember: { type: Boolean, default: false }
	}
};
</script>

<style scoped>
.vip-name {
	display: flex;
	align-items: center;
	min-width: 0;
	max-width: 100%;
	gap: 7rpx;
	color: inherit;
	font-size: inherit;
	font-weight: inherit;
	line-height: inherit;
}

.vip-name-text {
	min-width: 0;
	overflow: hidden;
	color: inherit;
	font: inherit;
	line-height: inherit;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.vip-name.member .vip-name-text {
	color: #d94b64;
}

.vip-name-icon {
	width: 34rpx;
	height: 24rpx;
	flex-shrink: 0;
}
</style>
