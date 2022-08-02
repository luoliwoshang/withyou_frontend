import server from '../utils/server'

export default class Purchased {


  static list(params){
    return server({
      url:"/purchased/list",
      method:"get",    
      params  
    })
  }
  static take_down(data){
    return server({
      url:"/good/confirm_receipt",
      method:"post",    
      data 
    })
  }
 
}