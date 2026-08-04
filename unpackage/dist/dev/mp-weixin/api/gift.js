"use strict";const t=require("../utils/request.js");function i(){return t.request({url:"/api/gifts"})}function s(){return t.request({url:"/api/users/me/gift-gallery"})}function u(e,r){return t.request({url:`/api/conversations/${e}/gifts`,method:"POST",data:r})}exports.fetchGiftGallery=s;exports.fetchGifts=i;exports.sendGift=u;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/gift.js.map
