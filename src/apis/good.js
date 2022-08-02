import server from '../utils/server'

export default class Good {


  static list(params){
    return server({
      url:"/good/list",
      method:"get",    
      params  
    })
  }
  static take_down(data){
    return server({
      url:"/good/take_down",
      method:"post",    
      data 
    })
  }
  static start_sale(data){
    return server({
      url:"/good/start_sale",
      method:"post",    
      data 
    })
  }
}