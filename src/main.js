import App from './App.vue';
import 'element-plus/dist/index.css';
import './common/elementui/reset.less';
import * as ELIcons from '@element-plus/icons-vue'
import './style/index.less' // global css
import router from './router/index';
// import store from './store'
// import directives from './directives'
import {
    initApp
} from './common/index';
import {
    renderWithQiankun,
    qiankunWindow
} from 'vite-plugin-qiankun/dist/helper';

let app = null;

function render(dom) {
    app = initApp(App, router);
    // app.use(store);
    for (let iconName in ELIcons) {
        if (!app._context.components[iconName]) {
            app.component(iconName, ELIcons[iconName])
        }
    }
    app.mount(dom);
}
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    render('#app');
}

renderWithQiankun({
    mount(props) {
        console.log('order app mount', props);
        props.onGlobalStateChange(state => {
            // 获取用户信息及权限
            console.log('order app onGlobalStateChange', state);
            if (!app) {
                render(props.container);
            }
        }, true);
    },
    bootstrap() {
        console.log('order app bootstrap');
    },
    unmount(props) {
        console.log('order app unmount');
        app.unmount();
        app = null;
        console.log(props);
        // props.offGlobalStateChange();
    }
});
