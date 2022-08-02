import server from '../utils/server'

export default class Challenge {


  static list(params){
    return server({
      url:"/comment/clockin/list",
      method:"get",    
      params  
    })
  }
  static create(data){
    return server({
      url:"/comment/clockin/create",
      method:"post",    
      data 
    })
  }
}