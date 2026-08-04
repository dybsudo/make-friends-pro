<template>
	<view class="review-tab-bar">
		<view class="review-tab-item" :class="{ active: active === 'square' }" @click="openSquare">
			<image :src="active === 'square' ? '/static/tab/home-active.png' : '/static/tab/home.png'" mode="aspectFit" />
			<text>广场</text>
		</view>
		<view class="review-tab-item" :class="{ active: active === 'profile' }" @click="openProfile">
			<image :src="active === 'profile' ? '/static/tab/mine-active.png' : '/static/tab/mine.png'" mode="aspectFit" />
			<text>我的</text>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		active: {
			type: String,
			default: 'square'
		}
	},
	methods: {
		openSquare() {
			if (this.active === 'square') return;
			uni.switchTab({ url: '/pages/square/index' });
		},
		openProfile() {
			if (this.active === 'profile') return;
			uni.switchTab({ url: '/pages/profile/index' });
		}
	}
};
</script>

<style scoped>
.review-tab-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 90;
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	height: calc(104rpx + env(safe-area-inset-bottom));
	padding: 10rpx 18rpx env(safe-area-inset-bottom);
	border-top: 1rpx solid #f0e7eb;
	background: rgba(255, 255, 255, 0.98);
	box-sizing: border-box;
}

.review-tab-item {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 5rpx;
	color: #999999;
	font-size: 20rpx;
}

.review-tab-item image {
	width: 42rpx;
	height: 42rpx;
}

.review-tab-item.active {
	color: #d4688a;
}
</style>
