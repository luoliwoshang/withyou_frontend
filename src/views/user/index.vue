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
            <q-btn
              class="q-ml-md"
              label="创建商品"
              @click="() => handleCreateGood(props)"
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
      <q-card>
        <q-card-section>
          <div class="text-h6">创建打卡</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form
            ref="ClockinForm"
            @submit="onClockinSubmit"
            class="q-gutter-xs"
          >
            <q-input
              label="挑战"
              filled
              readonly
              v-model="create_clockin_form.challenge_name"
              :rules="[form_not_null]"
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
              filled
              label="打卡心得/内容"
              :rules="[form_not_null]"
              v-model="create_clockin_form.content"
            />
            <q-uploader
              :factory="() => uploadFactory('comment/clockin')"
              @uploaded="handlerAddClockinUploadList"
              @removed="handlerRemoveClockinUploadList"
              auto-upload
              hide-upload-btn
            />
            <div class="q-mt-md">
              <q-btn label="打卡" type="submit" color="primary" />
              <q-btn
                label="取消"
                color="primary"
                flat
                class="q-ml-sm"
                v-close-popup
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="create_good_show">
      <q-card>
        <q-card-section>
          <div class="text-h6">创建商品</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="GoodForm" @submit="onGoodSubmit" class="q-gutter-xs">
            <q-input
              filled
              v-model="create_good_form.title"
              label="商品标题"
              :rules="[form_not_null]"
            />
            <q-input
              filled
              v-model="create_good_form.desc"
              label="商品描述"
              lazy-rules
              :rules="[form_not_null]"
            />
            <q-input
              type="number"
              filled
              v-model="create_good_form.total_count"
              label="总量"
              :rules="[form_not_null, over_zero]"
            />
            <q-input
              type="number"
              filled
              v-model="create_good_form.price"
              label="价格"
              :rules="[form_not_null, over_zero]"
            />
            <q-uploader
              :factory="() => uploadFactory('good')"
              @uploaded="handlerAddGoodUploadList"
              @removed="handlerRemoveGoodUploadList"
              auto-upload
              hide-upload-btn
            />
            <div>
              <q-btn label="添加" type="submit" color="primary" />
              <q-btn
                label="取消"
                color="primary"
                flat
                class="q-ml-sm"
                v-close-popup
              />
            </div>
          </q-form>
        </q-card-section>
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
import Good from "../../apis/good.js";
import Common from "../../apis/common.js";
import Clockin from "../../apis/clockin.js";
import pageMix from "../../utils/page.js";
import { reset_obj } from "@/utils/tool.js";
import { onMounted, reactive, ref, inject } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
const $q = useQuasar();
const router = useRouter();
const global = inject("$global");

const form_not_null = (val) => (val && val.length > 0) || "该数值不能为空";
const over_zero = (val) => val > 0 || "该数值必须大于0";

const create_clockin_form = ref({
  user_id: "",
  challenge_name: "",
  challenge_id: "",
  title: "",
  content: "",
});

//上传图片构造函数
const uploadFactory = (path) => {
  return {
    url: `/api/${path}/upload`,
    headers: [{ name: "token", value: localStorage.getItem("token") }],
    fieldName: "file",
    multiple: false,
  };
};
// 添加图片
const AddUploadList = (files, xhr, img_map) => {
  const filename = files[0].name;
  const image_loc = JSON.parse(xhr.responseText).data;
  img_map.value.push({ server_file: image_loc, local_name: filename });
};
// 删除指定图片
const RemoveUploadList = (files, img_map) => {
  let filename;
  img_map.value.forEach((item, index) => {
    if (item.local_name == files[0].name) {
      // 在此处删除并且更新响应式数组
      filename = item.server_file;
      img_map.value.splice(index, 1);
    }
  });
  Common.delete_image({
    loc: filename,
  }).then((res) => {
    console.log(res);
  });
};

/** 打卡挑战 **/
// 添加图片
const handlerAddClockinUploadList = ({ files, xhr }) => {
  AddUploadList(files, xhr, clockin_images);
};
// 从打卡列表图片中删除
const handlerRemoveClockinUploadList = (files) => {
  RemoveUploadList(files, clockin_images);
};
const choose_challenge_show = ref(false);
const create_clockin_show = ref(false);
const ClockinForm = ref(null);
const clockin_images = ref([]);
const handleCreateClockin = (data) => {
  create_clockin_form.value.user_id = data.row.id;
  create_clockin_show.value = true;
};
const handleChooseChallenge = (data) => {
  const { title, id } = data.row;
  console.log(title, id);
  create_clockin_form.value.challenge_name = title;
  create_clockin_form.value.challenge_id = id;
  choose_challenge_show.value = false;
};

const onClockinSubmit = async () => {
  ClockinForm.value.validate().then(async (success) => {
    console.log(clockin_images.value);
    if (clockin_images.value.length == 0) {
      $q.notify("打卡图片起码有一张");
    } else {
      if (success) {
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
          }).then((res) => {
            create_clockin_show.value = false;
            this.handleRequest();
          });
        } catch (err) {
          console.log(err);
        } finally {
          reset_obj(create_clockin_form.value, default_good_form);
          clockin_images.value.length = 0;
          clockin_images.value = [];
        }
      }
    }
  });
};
/** 打卡挑战 **/

/** 创建商品 **/
const create_good_show = ref(false);
const GoodForm = ref(null);
const default_good_form = {
  owner_id: "",
  total_count: 0,
  images: [],
  title: "",
  desc: "",
  price: 0,
};
const create_good_form = ref({ ...default_good_form });

const good_images = ref([]);
const handlerAddGoodUploadList = ({ files, xhr }) => {
  AddUploadList(files, xhr, good_images);
};
const handlerRemoveGoodUploadList = (files) => {
  RemoveUploadList(files, good_images);
};
const handleCreateGood = (data) => {
  create_good_form.value.owner_id = data.row.id;
  create_good_show.value = true;
};
const onGoodSubmit = async () => {
  GoodForm.value.validate().then(async (success) => {
    if (good_images.value.length == 0) {
      $q.notify("打卡图片起码有一张");
    } else {
      if (success) {
        const { owner_id, title, desc, total_count, price } =
          create_good_form.value;
        try {
          const result = await Good.create({
            owner_id,
            title,
            desc,
            total_count,
            price,
            images: good_images.value.map((item) => item.server_file),
          }).then((res) => {
            create_good_show.value = false;
            this.handleRequest();
          });
        } catch (err) {
          console.log(err);
        } finally {
          reset_obj(create_good_form.value, default_good_form);
          good_images.value.length = 0;
          good_images.value = [];
        }
      }
    }
  });
};

/** 创建商品 **/

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
