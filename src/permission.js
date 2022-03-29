/* eslint-disable prefer-const */
import router, { asyncRoutes } from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
import { getToken } from '@/utils/auth' // 从cookie获取令牌
import store from '@/store'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)
  console.log("token="+getToken());
  //如果存在token，即存在已登陆的令牌
  if (getToken()) {
  //如果用户存在令牌的情况请求登录页面，就让用户直接跳转到首页，避免存在重复登录的情况
    if (to.path === '/login'){
      // 直接跳转到首页，当然取决于你的路由重定向到哪里
      next({ path: '/' })
      //一定要关闭进度条
      NProgress.done()
    }else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log("hasRoles:"+hasRoles);
      if (hasRoles) {
        next() //当有用户权限的时候，说明所有可访问路由已生成 如访问没权限的全面会自动进入404页面
      } else {
          console.log("无用户信息")
          store.dispatch('user/getInfo').then(res => { // 拉取info
          const {roles}=res;
          store.dispatch('permission/generateRoutes',roles).then((res) => { // 生成可访问的路由表
            router.addRoutes(store.getters.permission_routes) // 动态添加可访问路由表
            //动态路由配置404页面（一定要将任意匹配规则置于最底部）
            router.addRoutes([
              {
                path: '/404',
                component:()=>import('@/views/404')
              },
              { path: '*', redirect: '/404', hidden: true }
            ])
            next({ ...to,replace: true})   //hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          })
        }).catch(err => {
            // 删除token，进入登录页面重新登录
              store.dispatch('user/resetToken');
              next('/login');
              NProgress.done();
        });
      }
    }
  } else {
    //这里是没有令牌的情况
    //还记得上面的白名单吗，现在起作用了
    //whiteList.indexOf(to.path) !== -1)判断用户请求的路由是否在白名单里
    if (whiteList.indexOf(to.path) !== -1) {
      // 不是-1就证明存在白名单里，不管你有没有令牌，都直接去到白名单路由对应的页面
      next()
    } else {
      next('/login');
      //关闭进度条
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
