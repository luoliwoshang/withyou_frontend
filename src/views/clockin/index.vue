<template>
  <div class="q-pa-md">
    <ZTable
      :dataResource="stateData.tableData"
      :pageProp="stateData.pageProp"
      :loading="stateData.loading"
      :columns="columns"
      :beforeMount="beforeMount"
      @on-request="handleRequest"
      @on-resize="handleSizeChange"
      @on-page="handleCurrentChange"
      @on-reset="handleReset"
    >
      <template v-slot:search>
        <q-input
          class="q-mr-md"
          outlined
          dense
          label="用户ID"
          v-model="query.user_id"
        />
        <q-input outlined dense label="挑战id" v-model="query.challenge_id" />
      </template>
      <template v-slot:cell="{ props }">
        <q-td :props="props">
          <template v-if="props.col.name == 'status'">
            <template v-if="props.value == 1">
              <q-badge color="blue" label="待操作" />
            </template>
            <template v-if="props.value == 2">
              <q-badge color="red" label="已拒绝" />
            </template>
            <template v-if="props.value == 3">
              <q-badge color="yellow" label="正在进行中" />
            </template>
          </template>
          <template v-else-if="props.col.name == 'operate'">
            <q-btn
              @click="
                () => {
                  to_challenge(props.value.challenge_id);
                }
              "
              label="查看挑战"
              glossy
              color="primary"
            ></q-btn>
            <q-btn
              class="q-ml-md"
              @click="
                () => {
                  show_clockin_image(props.row.images);
                }
              "
              :disabled="props.row.images.length == 0"
              label="打卡图片"
              glossy
              color="pink"
            ></q-btn>
          </template>

          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
    </ZTable>
    <q-dialog v-model="clockin_images_show">
      <q-carousel
        style="width: 400px"
        transition-prev="scale"
        transition-next="scale"
        swipeable
        animated
        control-color="white"
        navigation
        arrows
        height="300px"
        class="bg-primary text-white shadow-1 rounded-borders"
        v-model="slide"
      >
        <q-carousel-slide
          v-for="(item, index) in clockin_images"
          :key="item"
          :name="index"
        >
          <img :src="item" style="width: 100%; height: 100%" />
        </q-carousel-slide>
      </q-carousel>
    </q-dialog>
  </div>
</template>

<script setup>
import Clockin from "../../apis/clockin.js";
import pageMix from "../../utils/page.js";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Server from "../../utils/server.js";
const router = useRouter();
const show = (data) => {
  console.log(data);
  return data;
};
const beforeMount = () => {
  const route = useRoute(); // 第一步
  if (route.query.user_id) {
    query.value.user_id = route.query.user_id;
  }
  if (route.query.challenge_id) {
    query.value.challenge_id = route.query.challenge_id;
  }
};
const to_challenge = (path) => {
  router.push("/challenge?challenge_id=" + path);
};
const getImg = () => {
  Server.get(
    process.env.VUE_APP_API_BASE_URL +
      "/common/download?name=clock_in_images\\clock_in_images-1658648268905.png",
    {
      headers: {
        token: localStorage.getItem("token"),
      },
      //设定接收类型为blob,头部什么的自行添加
      responseType: "blob",
    }
  );
};
const clockin_images_show = ref(false);
const slide = ref(0);
const clockin_images = ref([]);

const show_clockin_image = (images) => {
  slide.value = 0;
  console.log(images);
  clockin_images_show.value = true;
  clockin_images.value = [];
  // getImg();
  clockin_images.value.push(
    ...images.map(
      (item) =>
        process.env.VUE_APP_API_BASE_URL + "/common/download?name=" + item
    )
  );
  console.log(clockin_images.value);
};

const columns = [
  {
    name: "content",
    required: true,
    label: "内容",
    align: "left",
    field: "content",
  },
  {
    name: "operate",
    required: true,
    label: "操作",
    align: "left",
    field: (row) => ({ user_id: row.user_id, challenge_id: row.target_id }),
  },
];
const query = ref({
  user_id: "",
  challenge_id: "",
});
const data_request = () => {
  const { user_id, challenge_id } = query.value;
  let _query = {
    from: stateData.pageProp.from,
    size: stateData.pageProp.size,
  };
  if (!!user_id) _query.user_id = user_id;
  if (!!challenge_id) _query.challenge_id = challenge_id;
  return Clockin.list({ ..._query });
};
const data_response = (data) => {
  console.log(data);
  stateData.tableData = data.list;
  stateData.pageProp.total = data.page.total;
};
const data_error = (error) => {
  console.log("error", error);
};
const data_reset = () => {
  query.value.challenge_id = "";
  query.value.user_id = "";
};

//mixin
const {
  stateData,
  handleSizeChange,
  handleCurrentChange,
  handleRequest,
  handleReset,
} = pageMix({
  data_request,
  data_response,
  data_error,
  data_reset,
});
</script>
