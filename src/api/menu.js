import request from '@/utils/request'
  export function getMenuInfo(){
    return request({
      url:'/api/menu/list',
      method:'get'
    })
  }
  export function deletMenu(id){
    return request({
      url:'/api/menu/'+id,
      method:'DELETE'
    })
  }
  export function getParent(){
      return request({
          url:'/api/menu/parent',
          method:'get'
      })
  }
  export function saveMenu(data){
    return request({
      url:'/api/menu',
      method:'post',
      data:JSON.stringify(data)
    })
  }
  