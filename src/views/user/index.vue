<template>
  <div class="q-pa-md">
    <ZTable
      :dataResource="stateData.tableData"
      :pageProp="stateData.pageProp"
      :loading="stateData.loading"
      :columns="columns"
      @on-request="handleRequest"
      @on-resize="handleSizeChange"
      @on-page="handleCurrentChange"
      @on-reset="handleReset"
    >
      <template v-slot:cell="{ props }">
        <q-td :props="props">
          <template v-if="props.col.name == 'operate'">
            <q-btn
              label="购入商品"
              color="red"
              @click="
                () => {
                  to_purchased(props.value);
                }
              "
            />
            <q-btn
              class="q-ml-md"
              @click="
                () => {
                  to_good(props.value);
                }
              "
              label="商品管理"
              glossy
              color="pink"
            />
            <q-btn
              class="q-ml-md"
              @click="
                () => {
                  to_challenge(props.value);
                }
              "
              label="查看挑战"
              glossy
              color="primary"
            />
            <q-btn
              class="q-ml-md"
              @click="
                () => {
                  to_clockin(props.value);
                }
              "
              label="查看打卡"
              color="green"
            />
            <q-btn
              class="q-ml-md"
              label="打卡"
              @click="() => handleCreateClockin(props)"
            />
          </template>
          <template v-else-if="props.col.name == 'avatar'">
            <q-avatar>
              <img :src="props.value" />
            </q-avatar>
          </template>
          <template v-else>
            {{ props.value }}
          </template>
        </q-td>
      </template>
    </ZTable>

    <q-dialog v-model="create_clockin_show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">创建打卡</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            label="挑战"
            dense
            readonly
            v-model="create_clockin_form.challenge_name"
          >
            <template v-slot:append>
              <q-icon
                name="gps_not_fixed"
                class="cursor-pointer"
                @click="choose_challenge_show = true"
              />
            </template>
          </q-input>
          <q-input
            dense
            label="打卡心得/内容"
            :rules="[(val) => !!val || '必填']"
            v-model="create_clockin_form.content"
          />
          <q-uploader
            :factory="uploadFactory"
            @uploaded="handlerAddUploadList"
            @removed="handlerRemoveUploadList"
            auto-upload
            hide-upload-btn
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="创建" @click="CreateClockin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="choose_challenge_show">
      <ChallengeView
        popup
        :user_id="create_clockin_form.user_id"
        @handleChooseChallenge="handleChooseChallenge"
      ></ChallengeView>
    </q-dialog>
  </div>
</template>

<script setup>
import ChallengeView from "../../views/challenge";
import User from "../../apis/user.js";
import Common from "../../apis/common.js";
import Clockin from "../../apis/clockin.js";
import pageMix from "../../utils/page.js";
import { onMounted, reactive, ref, inject } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const global = inject("$global");
const create_clockin_show = ref(false);
const choose_challenge_show = ref(false);
const create_clockin_form = ref({
  user_id: "",
  challenge_name: "",
  challenge_id: "",
  title: "",
  content: "",
});
const clockin_images = ref([]);

const uploadFactory = () => {
  return {
    url: "/api/comment/clockin/upload",
    headers: [{ name: "token", value: localStorage.getItem("token") }],
    fieldName: "file",
    multiple: false,
  };
};
//完成上传添加到数组
const handlerAddUploadList = ({ files, xhr }) => {
  const filename = files[0].name;
  const image_loc = JSON.parse(xhr.responseText).data;
  clockin_images.value.push({ server_file: image_loc, local_name: filename });
};
// 从打卡列表图片中删除
const handlerRemoveUploadList = (files) => {
  let filename;
  clockin_images.value.forEach((item, index) => {
    if (item.local_name == files[0].name) {
      // 在此处删除并且更新响应式数组
      filename = item.server_file;
      clockin_images.value.splice(index, 1);
    }
  });
  Common.delete_image({
    loc: filename,
  }).then((res) => {
    console.log(res);
  });
};

//开始创建打卡
const handleCreateClockin = (data) => {
  console.log(data.row.id);
  create_clockin_form.value.user_id = data.row.id;
  create_clockin_show.value = true;
};
// 选择对应的挑战
const handleChooseChallenge = (data) => {
  const { title, id } = data.row;
  console.log(title, id);
  create_clockin_form.value.challenge_name = title;
  create_clockin_form.value.challenge_id = id;
  choose_challenge_show.value = false;
};
const CreateClockin = async () => {
  console.log(create_clockin_form.value);
  const {
    user_id,
    content,
    challenge_id: target_id,
  } = create_clockin_form.value;
  try {
    const result = await Clockin.create({
      user_id,
      target_id,
      content,
      images: clockin_images.value.map((item) => item.server_file),
    });
  } catch (err) {
    console.log(err);
  }
};
const show = (data) => {
  console.log(data);
};

const to_challenge = (path) => {
  router.push("/challenge?user_id=" + path);
};
const to_clockin = (path) => {
  router.push("/clockin?user_id=" + path);
};
const to_good = (path) => {
  router.push("/good?user_id=" + path);
};
const to_purchased = (path) => {
  router.push("/purchased?user_id=" + path);
};

const columns = [
  {
    name: "avatar",
    label: "头像",
    align: "left",
    field: (row) =>
      global.baseurl +
      "/common/download?name=" +
      (row.avatar ? row.avatar : "当不存在时name后面随便填写"),
  },
  {
    name: "username",
    required: true,
    label: "用户名",
    align: "left",
    field: "username",
  },
  {
    name: "score",
    required: true,
    label: "积分",
    align: "left",
    field: "score",
  },
  {
    name: "operate",
    required: true,
    label: "操作",
    align: "center",
    field: (row) => row.id,
  },
];

const data_request = () =>
  User.list({ from: stateData.pageProp.from, size: stateData.pageProp.size });

const data_response = (data) => {
  stateData.tableData = data.list;
  stateData.pageProp.total = data.page.total;
};
const data_error = (error) => {
  console.log("error", error);
};
const data_reset = () => {};

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
