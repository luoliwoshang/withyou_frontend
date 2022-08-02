import server from "../utils/server";

export default class Common {
  static delete_image(params) {
    return server({
      url: "/common/delete_image",
      method:"delete",
      params,
    });
  }
}
