import server from '../utils/server'

export default class User {

  static login(data) {
    return server({
      url: '/user/login',
      method: 'post',
      data,
    })
  }
  static list(params){
    return server({
      url:"/user/list",
      method:"get",    
      params  
    })
  }
}