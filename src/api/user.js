import request from '@/utils/request'
export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/sysUser/getInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/api/sysUser/logout',
    method: 'post'
  })
}


export function getAuthMenu(token) {
  return request({
    url: '/api/sysUser/getMenuList?token='+token,
    method: 'get'
  })
}