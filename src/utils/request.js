import axios from 'axios'
import Qs from 'qs'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// 添加请求拦截器，在请求头中加token
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['token'] = getToken()
    }
    // 3. 根据请求方法，序列化传来的参数，根据后端需求是否序列化
    if (config.method === 'post') {
      config.data = Qs.stringify(config.data)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
// http response 拦截器
service.interceptors.response.use(
  response => {//成功获取连接，但是业务逻辑可能存在错误
    const res = response.data
    if(response.status&&response.status==200){
      if(res.code===500||res.code===401||res.code===403){
        Message.error({message:res.msg});
        return
      }
      if (res.code === 600) {
        MessageBox.confirm('登录过期，请重新登录', '确定重新登录', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
        })
      }
      //拦截器过了之后需要放行，将数据返回。
      return res
    }
    // if (res.code !== 200) {
    //   if (res.code === 600) {
    //     // to re-login
    //     MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
    //       confirmButtonText: 'Re-Login',
    //       cancelButtonText: 'Cancel',
    //       type: 'warning'
    //     }).then(() => {
    //       store.dispatch('user/resetToken').then(() => {
    //         location.reload()
    //       })
    //     })
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'))
    // } else { 
    //   return res;
    // }
  },
  error => { //与后端连接失败
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service