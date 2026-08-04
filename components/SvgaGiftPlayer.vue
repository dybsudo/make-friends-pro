<template>
	<view v-if="visible" class="svga-mask" @click.stop="close">
		<image v-if="fallback" class="svga-fallback" :src="staticImageUrl" mode="aspectFit" />
		<!-- #ifdef MP-WEIXIN -->
		<canvas v-show="!fallback" id="giftSvgaCanvas" class="svga-canvas" type="2d" />
		<!-- #endif -->
		<view v-if="loading && !fallback" class="svga-loading" aria-label="动画加载中">
			<view class="svga-loading-ring" />
		</view>
	</view>
</template>

<script>
// 顶层静态导入会被 uni-app 打包进微信小程序，不能改回方法内的 require。
// #ifdef MP-WEIXIN
import { Parser, Player } from 'svgaplayer-weapp';
// #endif

export default {
	props: {
		visible: { type: Boolean, default: false },
		animationUrl: { type: String, default: '' },
		staticImageUrl: { type: String, default: '' }
	},
	emits: ['close'],
	data() {
		return {
			fallback: false,
			loading: false,
			player: null,
			playToken: 0,
			timer: null
		};
	},
	watch: {
		visible(value) { if (value) this.$nextTick(() => this.play()); else this.stop(); }
	},
	beforeUnmount() { this.stop(); },
	methods: {
		async play() {
			this.stop();
			const token = this.playToken;
			this.fallback = false;
			this.loading = true;
			if (!this.animationUrl) {
				this.showFallback('未配置 SVGA 动画地址');
				return;
			}
			// #ifdef MP-WEIXIN
			try {
				const player = new Player();
				player.loops = 1;
				player.clearsAfterStop = false;
				await this.bindCanvas(player, token);
				if (token !== this.playToken) return;
				const video = await new Parser().load(this.animationUrl);
				if (token !== this.playToken) return;
				await player.setVideoItem(video);
				if (token !== this.playToken) return;
				player.setContentMode('AspectFill');
				player.onFinished(() => { this.timer = setTimeout(() => this.close(), 500); });
				this.player = player;
				this.loading = false;
				player.startAnimation();
				return;
			} catch (error) {
				console.error('[gift] SVGA 播放失败', error);
				if (token !== this.playToken) return;
			}
			// #endif
			this.showFallback('SVGA 动画加载失败');
		},
		async bindCanvas(player, token) {
			let lastError = null;
			for (let attempt = 0; attempt < 8; attempt += 1) {
				if (token !== this.playToken) throw new Error('play cancelled');
				try {
					// setCanvas 需要微信原生组件实例，Vue 组件代理 this 无法限定查询作用域。
					await player.setCanvas('#giftSvgaCanvas', this.$scope);
					return;
				} catch (error) {
					lastError = error;
					await new Promise((resolve) => setTimeout(resolve, 80));
				}
			}
			throw lastError || new Error('canvas not ready');
		},
		showFallback(message) {
			this.loading = false;
			this.fallback = true;
			console.error(`[gift] ${message}: ${this.animationUrl || '-'}`);
			this.timer = setTimeout(() => this.close(), 2000);
		},
		stop() {
			this.playToken += 1;
			if (this.timer) clearTimeout(this.timer);
			this.timer = null;
			if (this.player) {
				try { this.player.stopAnimation(true); } catch (error) {}
			}
			this.player = null;
			this.loading = false;
		},
		close() { this.stop(); this.$emit('close'); }
	}
};
</script>

<style scoped>
.svga-mask {
	position: fixed;
	inset: 0;
	z-index: 160;
	display: flex;
	width: 100vw;
	height: 100vh;
	align-items: center;
	justify-content: center;
	background: rgba(18, 15, 17, 0.2);
	overflow: hidden;
}

.svga-canvas {
	position: absolute;
	inset: 0;
	display: block;
	width: 100vw;
	height: 100vh;
}

.svga-fallback {
	width: 68vw;
	height: 68vw;
	max-height: 68vh;
}

.svga-loading {
	position: absolute;
	left: 50%;
	top: 50%;
	z-index: 2;
	display: flex;
	width: 58rpx;
	height: 58rpx;
	align-items: center;
	justify-content: center;
	transform: translate(-50%, -50%);
}

.svga-loading-ring {
	width: 34rpx;
	height: 34rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.38);
	border-right-color: #d4688a;
	border-radius: 50%;
	box-sizing: border-box;
	animation: svga-loading-spin 0.72s linear infinite;
}

@keyframes svga-loading-spin {
	to { transform: rotate(360deg); }
}
</style>
