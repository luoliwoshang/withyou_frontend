var baseUrl = "http://localhost:8080/api";
if (process.env.NODE_ENV == "development") {
  baseUrl = "http://localhost:8080/api";
}else if(process.env.NODE_ENV=="production"){
    baseUrl="http://localhost:8080/api"
}
export default baseUrl
