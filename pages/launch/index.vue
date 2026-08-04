<template>
	<view class="launch-page">
		<view class="background-line line-left"></view>
		<view class="background-line line-right"></view>

		<view :key="stageKey" class="splash-stage">
			<view class="copy-rail">
				<view class="rail-progress"></view>
			</view>
			<view class="vertical-copy">
				<view class="copy-column">
					<text class="copy-character" style="animation-delay: 140ms">这</text>
					<text class="copy-character" style="animation-delay: 248ms">里</text>
					<text class="copy-character" style="animation-delay: 356ms">记</text>
					<text class="copy-character" style="animation-delay: 464ms">录</text>
					<text class="copy-character" style="animation-delay: 572ms">的</text>
					<text class="copy-character punctuation" style="animation-delay: 680ms">，</text>
				</view>
				<view class="copy-column">
					<text class="copy-character" style="animation-delay: 788ms">每</text>
					<text class="copy-character" style="animation-delay: 896ms">一</text>
					<text class="copy-character" style="animation-delay: 1004ms">份</text>
					<text class="copy-character" style="animation-delay: 1112ms">美</text>
					<text class="copy-character" style="animation-delay: 1220ms">好</text>
				</view>
			</view>
			<view class="closing-mark">
				<view class="mark-core"></view>
			</view>
		</view>

		<view v-if="hasError" class="retry-action" hover-class="retry-action-active" @click="retry">
			<text>↻</text>
		</view>
		<view v-else class="quiet-progress">
			<view class="quiet-progress-bar"></view>
		</view>
	</view>
</template>

<script>
import { ensureSession } from '../../utils/auth';
import { isCommunityMode, loadAppMode } from '../../utils/appMode';

const MIN_SPLASH_DURATION = 1820;

function wait(duration) {
	return new Promise((resolve) => setTimeout(resolve, duration));
}

export default {
	data() {
		return {
			booting: false,
			hasError: false,
			stageKey: 0
		};
	},
	onLoad() {
		this.boot();
	},
	methods: {
		async boot() {
			if (this.booting) return;
			const startedAt = Date.now();
			this.booting = true;
			this.hasError = false;
			try {
				await Promise.all([loadAppMode(), ensureSession()]);
				await wait(Math.max(0, MIN_SPLASH_DURATION - (Date.now() - startedAt)));
				uni.switchTab({
					url: isCommunityMode() ? '/pages/square/index' : '/pages/meet/index'
				});
			} catch (error) {
				this.hasError = true;
			} finally {
				this.booting = false;
			}
		},
		retry() {
			this.stageKey += 1;
			this.boot();
		}
	}
};
</script>

<style scoped>
.launch-page {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	overflow: hidden;
	background: #fffafb;
	box-sizing: border-box;
}

.background-line {
	position: absolute;
	top: 12vh;
	bottom: 10vh;
	width: 1rpx;
	background: rgba(103, 83, 93, 0.055);
}

.line-left {
	left: 14vw;
}

.line-right {
	right: 14vw;
}

.splash-stage {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 310rpx;
	min-height: 510rpx;
	padding: 28rpx 0 58rpx;
	box-sizing: border-box;
}

.vertical-copy {
	display: flex;
	align-items: flex-start;
	flex-direction: row-reverse;
	justify-content: center;
	gap: 38rpx;
}

.copy-column {
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 13rpx;
}

.copy-character {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 62rpx;
	height: 52rpx;
	color: #392e34;
	font-family: 'Songti SC', 'STSong', 'SimSun', serif;
	font-size: 46rpx;
	font-weight: 600;
	line-height: 1;
	letter-spacing: 0;
	opacity: 0;
	filter: blur(8rpx);
	transform: translateY(14rpx) scale(0.96);
	animation: character-reveal 560ms cubic-bezier(0.2, 0.72, 0.22, 1) forwards;
}

.copy-character.punctuation {
	height: 34rpx;
	color: #cc7f96;
	font-size: 34rpx;
	transform: translate(-9rpx, 8rpx) scale(0.9);
}

.copy-rail {
	position: absolute;
	left: 24rpx;
	top: 34rpx;
	bottom: 68rpx;
	width: 2rpx;
	overflow: hidden;
	background: #f0e6e9;
}

.rail-progress {
	width: 100%;
	height: 100%;
	background: #d78ba1;
	transform: translateY(-100%);
	animation: rail-draw 1480ms cubic-bezier(0.22, 0.78, 0.28, 1) 90ms forwards;
}

.closing-mark {
	position: absolute;
	left: 16rpx;
	bottom: 43rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18rpx;
	height: 18rpx;
	border: 1rpx solid rgba(190, 101, 127, 0.55);
	opacity: 0;
	transform: rotate(45deg) scale(0.3);
	animation: mark-arrive 420ms ease-out 1420ms forwards;
}

.mark-core {
	width: 6rpx;
	height: 6rpx;
	background: #c96f8a;
}

.quiet-progress {
	position: absolute;
	left: 50%;
	bottom: calc(58rpx + env(safe-area-inset-bottom));
	width: 84rpx;
	height: 2rpx;
	overflow: hidden;
	background: #eee5e8;
	transform: translateX(-50%);
}

.quiet-progress-bar {
	width: 34rpx;
	height: 100%;
	background: #cb7992;
	animation: progress-travel 1250ms ease-in-out infinite;
}

.retry-action {
	position: absolute;
	left: 50%;
	bottom: calc(42rpx + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	justify-content: center;
	width: 68rpx;
	height: 68rpx;
	border: 1rpx solid #e6d9de;
	border-radius: 50%;
	background: #ffffff;
	color: #a66579;
	font-size: 32rpx;
	transform: translateX(-50%);
	box-shadow: 0 8rpx 24rpx rgba(91, 63, 76, 0.07);
}

.retry-action-active {
	background: #fff3f6;
}

@keyframes character-reveal {
	0% {
		opacity: 0;
		filter: blur(8rpx);
		transform: translateY(14rpx) scale(0.96);
	}
	62% {
		opacity: 1;
		filter: blur(0);
	}
	100% {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0) scale(1);
	}
}

@keyframes rail-draw {
	to {
		transform: translateY(0);
	}
}

@keyframes mark-arrive {
	to {
		opacity: 1;
		transform: rotate(45deg) scale(1);
	}
}

@keyframes progress-travel {
	0% {
		transform: translateX(-38rpx);
	}
	50% {
		transform: translateX(88rpx);
	}
	100% {
		transform: translateX(-38rpx);
	}
}

@media (max-height: 650px) {
	.splash-stage {
		min-height: 470rpx;
		transform: scale(0.92);
	}
}
</style>
