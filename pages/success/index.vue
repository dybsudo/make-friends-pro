<template>
	<view class="success-page">
		<image class="page-bg" src="/static/beijing.png" mode="aspectFill" />
		<view class="veil" />

		<view class="success-main">
			<view class="seal-wrap">
				<view class="seal-ring seal-ring-outer" />
				<view class="seal-ring seal-ring-inner" />
				<view class="seal-core">
					<text class="seal-mark">{{ review ? '待审核' : sealed ? '已封存' : '已安放' }}</text>
				</view>
			</view>

			<text class="success-title">{{ successTitle }}</text>
			<text class="success-copy">
				{{ successCopy }}
			</text>

			<view class="info-panel">
				<view class="info-row">
					<text class="info-label">存放方式</text>
					<text class="info-value">{{ review ? '安全检测中' : sealed ? '历史封存内容' : '公开展示身份' }}</text>
				</view>
				<view v-if="sealed" class="info-row">
					<text class="info-label">封存至</text>
					<text class="info-value">{{ openDateText }}</text>
				</view>
			</view>
		</view>

		<view class="success-actions">
			<view class="primary-action" @click="goMyRecords">
				<text>去我的记录</text>
			</view>
			<view class="secondary-actions">
				<view v-if="!review" class="secondary-action" @click="goSquare">
					<text>去广场看看</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			visibility: 'private',
			sealed: false,
			review: false,
			openDate: ''
		};
	},
	computed: {
		successTitle() {
			if (this.review) {
				return '这段想法已提交审核';
			}
			return this.sealed ? '这段想法已经进入封存' : '这段想法已经替你收好';
		},
		successCopy() {
			if (this.review) {
				return '它会先停在后台审核区，通过之后才会真正出现在广场。';
			}
			return this.sealed
				? '在约定的时间到来之前，它会被安静地藏起来，连你也不能提前打开。'
				: '它暂时不必被谁理解，只需要在一个安静的地方，被你自己随时看见。';
		},
		openDateText() {
			return this.openDate ? this.openDate.replace(/-/g, '.') : '未来某一天';
		}
	},
	onLoad(query = {}) {
		this.visibility = query.visibility || 'public_named';
		this.sealed = query.sealed === '1';
		this.review = query.review === '1';
		this.openDate = query.openDate || '';
	},
	methods: {
		goMyRecords() {
			uni.redirectTo({
				url: `/pages/myRecords/index?tab=${this.visibility === 'private' ? 'private' : 'public'}`
			});
		},
		goSquare() {
			uni.switchTab({
				url: '/pages/square/index'
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.success-page {
	position: relative;
	min-height: 100vh;
	overflow: hidden;
	background: #f8f1f5;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: calc(96rpx + env(safe-area-inset-top)) 42rpx calc(42rpx + env(safe-area-inset-bottom));
}

.page-bg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	opacity: 0.18;
}

.veil {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, rgba(255, 248, 252, 0.82) 0%, rgba(248, 236, 243, 0.96) 58%, #ffffff 100%);
}

.success-main {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.seal-wrap {
	position: relative;
	width: 260rpx;
	height: 260rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 36rpx;
	margin-bottom: 58rpx;
}

.seal-ring {
	position: absolute;
	border-radius: 50%;
}

.seal-ring-outer {
	width: 260rpx;
	height: 260rpx;
	border: 1rpx solid rgba(212, 104, 138, 0.22);
	background: rgba(255, 255, 255, 0.32);
}

.seal-ring-inner {
	width: 206rpx;
	height: 206rpx;
	border: 1rpx dashed rgba(202, 136, 159, 0.38);
}

.seal-core {
	position: relative;
	width: 150rpx;
	height: 150rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #e7b0c2 0%, #c97894 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 18rpx 42rpx rgba(202, 136, 159, 0.28);
}

.seal-mark {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
	letter-spacing: 4rpx;
}

.success-title {
	display: block;
	max-width: 560rpx;
	font-size: 42rpx;
	font-weight: 700;
	line-height: 1.45;
	color: #3a1c2a;
}

.success-copy {
	display: block;
	max-width: 570rpx;
	margin-top: 28rpx;
	font-size: 27rpx;
	line-height: 1.9;
	color: #8d6f7b;
}

.info-panel {
	width: 100%;
	margin-top: 58rpx;
	padding: 8rpx 30rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.74);
	box-shadow: 0 10rpx 30rpx rgba(80, 48, 80, 0.06);
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 84rpx;
	gap: 24rpx;
}

.info-row + .info-row {
	border-top: 1rpx solid rgba(218, 190, 202, 0.42);
}

.info-label {
	font-size: 25rpx;
	color: #b18d9d;
}

.info-value {
	font-size: 27rpx;
	font-weight: 600;
	color: #6f354d;
}

.success-actions {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.primary-action {
	height: 92rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #e1a8bb 0%, #ca889f 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 700;
	box-shadow: 0 14rpx 32rpx rgba(202, 136, 159, 0.26);
}

.secondary-actions {
	display: flex;
	gap: 18rpx;
}

.secondary-action {
	flex: 1;
	height: 78rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.74);
	border: 1rpx solid rgba(220, 188, 202, 0.58);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #9a7182;
	font-size: 26rpx;
}
</style>
