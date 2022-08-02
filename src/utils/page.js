//mixins/page.js
import { reactive } from "vue"
const defaultPage = {
    from: 0,
    size: 10,
    total:10,
    sizes: [5, 10, 20, 50, 100, 200]
}
export default function ({ data_request, data_response, data_error, data_reset }) {
    // 接收请求数据的函数
    const stateData = reactive({
        pageProp: { ...defaultPage },
        loading: false,
        tableData: [],
    })
    let handleRequest = async () => {
        stateData.loading = true
        try {
            const data = await data_request()
            console.log(data)
            data_response(data)
        } catch (err) {
            data_error ? data_error(err) : console.log(err)
        } finally {
            stateData.loading = false
        }
    }
    let handleSizeChange = (val) => {
        stateData.pageProp.from = 0;
        stateData.pageProp.size = val;
        handleRequest()
    };
    let handleCurrentChange = (val = 1) => {
        stateData.pageProp.from = val;
        handleRequest()
    };
    let handleReset = () => {
        data_reset()

        // 响应式重置
        // stateData.pageProp = { ...defaultPage } 错误
        const keys = Object.keys(defaultPage)
        let obj = {};
        keys.forEach(item=>{
            obj[item]=defaultPage[item]
        })
        Object.assign(stateData.pageProp,obj)
        handleRequest()
    };
    return {
        stateData,
        handleSizeChange,
        handleCurrentChange,
        handleRequest,
        handleReset
    }
}