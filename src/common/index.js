import {
    createApp
} from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import store from '../store/index'
import {
    Setting,
    // Search,
    CloseBold,
    ArrowDown,
    CirclePlus,
    Delete
} from '@element-plus/icons-vue' // 按需引入 Icon 图标 
import http from './extension/http';
import RpUI from './ui/index';

export const initApp = function (App, router, f) {
    // import * as ElIconModules from '@element-plus/icons' // 按需引入 Icon 图标 
    const app = createApp(App);
    // for (let iconName in ElIconModules) {
    //     app.component(iconName, ElIconModules[iconName])
    // }

    app.use(router);
    if (!f) {
        app.use(ElementPlus, {
            locale: zhCn
        });
    }
    // 全局注册 Icon 图标
    app.component('Setting', Setting)
    // app.component('Search', Search)
    app.component('CloseBold', CloseBold)
    app.component('ArrowDown', ArrowDown)
    app.component('CirclePlus', CirclePlus)
    app.component('Delete', Delete)
    app.use(http, router, {
        auth() {
            // 用户需要登录
            window.location.href = '/login?url=' + encodeURIComponent(window.location.href);
        }
    });
    app.use(RpUI, router, initApp);
    app.use(store)
    return app;
};
