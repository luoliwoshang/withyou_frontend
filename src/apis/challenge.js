import server from '../utils/server'

export default class Challenge {


  static list(params){
    return server({
      url:"/challenge/list",
      method:"get",    
      params  
    })
  }
}