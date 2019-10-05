<template>
  <div class="image-view">
    <!-- 顶部操作栏 -->
    <el-header class="button-list not-print" height="40px">
      <el-dropdown class="button download">
        <span class="el-dropdown-link">
          <svg-icon iconClass="download"></svg-icon>
          {{$t('下载')}}
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handlerDownload">{{$t('下载当前')}}</el-dropdown-item>
          <el-dropdown-item @click.native="handlerDownloadAll">{{$t('下载全部')}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown class="button print">
        <span class="el-dropdown-link">
          <svg-icon iconClass="print"></svg-icon>
          {{$t('打印')}}
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handlerPrintCurrent">{{$t('打印当前')}}</el-dropdown-item>
          <el-dropdown-item @click.native="handlerPrintAll">{{$t('打印全部')}}</el-dropdown-item>
          <el-dropdown-item v-if="!leftCustom" @click.native="handlerPrintChecked">{{$t('打印所选')}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="button original" @click="handlerZoomOriginal">
        <svg-icon iconClass="fullscreen"></svg-icon>
        {{$t('原始尺寸')}}
      </div>
      <div class="button percent">
        <svg-icon class="icon" iconClass="add" @click.native="addPercent"></svg-icon>
        <el-select
          v-model="percent">
          <el-option
            v-for="item of percentList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <svg-icon class="icon" iconClass="div" @click.native="divPercent"></svg-icon>
      </div>
      <div class="button rotate">
        <svg-icon class="icon" iconClass="rotate-left" @click.native="handlerRotate(-90)"></svg-icon>
      </div>
      <div class="button rotate">
        <svg-icon class="icon" iconClass="rotate-right" @click.native="handlerRotate(90)"></svg-icon>
      </div>
      <div class="button audit" @click="openAuditDialog" v-if="audit">
        <svg-icon iconClass="audit"></svg-icon>
        {{$t('影像审核')}}
      </div>
      <div class="button history" @click="openApprasieDialog" v-if="historyVisible">
        <svg-icon iconClass="history"></svg-icon>
        {{$t('历史记录')}}
      </div>
    </el-header>
    <el-container class="not-print">
      <!-- 左侧预览 -->
      <el-aside v-if="leftCustom" class="preview" width="290px">
        <slot name="leftCustom"></slot>
      </el-aside>
      <el-aside v-else class="preview" width="260px">
        <div class="operate">
          <svg-icon iconClass="prev-up" class="icon" @click.native="toPrev"></svg-icon>
          <span class="content">
            <el-input v-model="currentIndex" @blur="handlerIndexChange"></el-input>/{{imageList.length}}
          </span>
          <svg-icon iconClass="next-down" class="icon" @click.native="toNext"></svg-icon>
        </div>
        <div class="image-list">
          <div
            class="image"
            :class="{ selected: index + 1 === currentIndex }"
            v-for="(item, index) of imageList"
            :key="index"
            @click="viewImage(index)">
            <img :src="`${markString}${item.iconUrl}`" />
            <div class="name">{{item.imageName}}</div>
            <el-checkbox class="check" v-model="item.checked" @click.stop></el-checkbox>
          </div>
        </div>
      </el-aside>
      <!-- 右侧组件 -->
      <el-main class="image-content">
        <!-- <div class="title">
          <span class="image-number">{{$t('影像编号')}}:{{imageNumber}}</span>
          <span class="current-index">{{$t('当前影像')}}:{{currentIndex}}/{{imageList.length}}</span>
        </div> -->
          <!-- <svg-icon iconClass="prev-left" class="icon left" @click.native="toPrev"></svg-icon>
          <svg-icon iconClass="next-right" class="icon right" @click.native="toNext"></svg-icon> -->
          <div :class="[{ 'nonePic': currentIndex === 1 }, 'icon left']" @click="toPrev"></div>
          <div :class="[{ 'nonePic': currentIndex + 1 > imageList.length }, 'icon right']" @click="toNext"></div>
        <imageviewer
          ref="imageViewer"
          :fullscreen="false"
          :title="false"
          :navbar="false"
          :toolbar="false"
          :isShow="true"
          :markString="markString"
          :default-index="0"
          :images="showImageList"
          @change="imageChange">
        </imageviewer>
      </el-main>
    </el-container>
    <div class="print-content">
      <img
        v-for="(item, index) of imageList"
        :key="index"
        class="image"
        :class="{
          'print-all': printAll,
          'print-current': printCurrent && index === currentIndex - 1,
          'print-checked': printChecked && item.checked,
        }"
        :src="`${markString}${item.imageUrl}`"
        alt="">
    </div>

    <el-dialog
      class="audit-dialog"
      :title="$t('影像审核')"
      :visible.sync="auditVisible">
      <zte-form
        size="mini"
        ref="auditForm"
        class="audit-form"
        :item-info="itemInfo"
        :form="form"
        :is-cancel="false"
        @submit="handlerSubmit">
        <template slot="appraiseNode" slot-scope="{ info, form }">
          <el-radio-group v-model="form.appraiseNode" @change="handlerNodeChange">
            <el-radio
              v-for="item of info.options"
              :key="item.value"
              :label="item.value">
              {{ $t(item.label) }}
            </el-radio>
          </el-radio-group>
        </template>
      </zte-form>
    </el-dialog>

    <el-dialog
      width="70%"
      v-if="historyVisible"
      :title="$t('评价记录')"
      :visible.sync="apprasieVisible">
      <zte-table
        :request-url="HistoryTableUrl"
        :table-column="apprasietTableColumn"
        :params="apprasietPamams">
      </zte-table>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import downloadFile from '@/es/download';
import qs from 'qs';
import imageviewer from '../../modules/imageviewer';

export default {
  name: 'imageView',
  components: {
    imageviewer,
  },
  props: {
    audit: {
      type: Boolean,
      default: false,
    },
    leftCustom: {
      type: Boolean,
      default: false,
    },
    // 请求图片列表url
    imageListUrl: {
      type: String,
      default: '',
    },
    // 下载全部图片地址
    downloadAllUrl: {
      type: String,
      default: '',
    },
    // 下载全部图片附加参数
    downLoadParams: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    const minPercent = 0.5;
    const maxPercent = 2;
    const quarter = 0.5;
    const percentList = [];
    for (let i = minPercent; i <= maxPercent; i += quarter) {
      percentList.push({
        label: `${i * 100}%`,
        value: i,
      });
    }
    return {
      percent: 1, // 当前图像百分比
      minPercent, // 最小百分比
      maxPercent, // 最大百分比
      quarter, // 缩放最小刻度
      percentList, // 缩放选择列表
      currentIndex: 0,
      imageNumber: '',
      imageInfoId: '',
      imageList: [],
      printAll: false,
      printCurrent: false,
      printChecked: false,
      // 审批弹窗 历史记录弹窗
      historyVisible: true,
      HistoryTableUrl: '',
      markString: '/erssys',
      auditVisible: false,
      itemInfo: [
        {
          label: '影像编号',
          code: 'imageNumber',
          type: 'label',
          required: true,
        },
        {
          label: '评价节点',
          code: 'appraiseNode',
          type: 'temp',
          options: [
            {
              label: '影像重扫',
              value: 'HEAVY_AND',
            },
            {
              label: '影像补扫',
              value: 'COMPLEMENT',
            },
            {
              label: '影像作废',
              value: 'DEL',
            },
          ],
          required: true,
        },
        {
          label: '评价类型',
          code: 'appraiseType',
          type: 'select',
          options: [],
          fastCode: '',
          required: true,
        },
        {
          label: '评价描述',
          code: 'appraiseDesc',
          type: 'textarea',
          required: true,
        },
      ],
      form: {},
      apprasieVisible: false,
      apprasietTableColumn: [
        {
          code: 'employeeName',
          label: '评价人',
        },
        {
          code: 'appraiseDate',
          label: '评价时间',
        },
        {
          code: 'appraiseNode',
          label: '评价节点',
        },
        {
          code: 'appraiseTypeName',
          label: '评价类型',
        },
        {
          code: 'appraiseDesc',
          label: '评价描述',
        },
        {
          code: 'imageStatusName',
          label: '影像状态',
        },
      ],
    };
  },
  created() {
    if (!this.leftCustom) {
      this.getImageList();
    }
  },
  watch: {
    percent(zoom) {
      this.handlerZoom(zoom);
    },
    downLoadParams() {
      this.getImageList();
    },
  },
  computed: {
    showImageList() {
      const list = this.imageList.map(img => img.imageUrl);
      return list;
    },
    apprasietPamams() {
      const params = {
        imageInfoId: this.imageInfoId,
        imageNumber: this.imageNumber,
      };
      return params;
    },
    baseUrl() {
      return `${window.location.protocol}//${window.location.host}${this.markString}`;
    },
  },
  methods: {
    getImageList() {
      let path;
      let params = qs.parse(window.location.hash.split('?')[1]);
      this.imageInfoId = params.imageInfoId;
      this.imageNumber = params.imageNumber;
      if (params.type === 'COVER' || params.type === 'none' || params.voucherStatus === 'UNMATCH') {
        this.historyVisible = false;
      }
      this.HistoryTableUrl = '/imageQuery/selectappraiseListByImgId';
      if (params.source === 'imageAudit' || params.source === 'imageQurey') { // --影像查询/影像巡检
        // this.markString = '/evssys';
        path = `${this.baseUrl}/imageQuery/view`;
        this.HistoryTableUrl = `${this.baseUrl}/imageInspection/selectappraiseListByImgId`;
      } else if (params.source === 'voucherMatching') { // --凭证图片查看
        path = '/voucherMatch/view';
      } else {
        path = this.imageListUrl;// --作为组件调用
        this.historyVisible = false;
        params = {
          voucherId: this.downLoadParams.voucherIds,
          imageNumber: this.downLoadParams.barCode,
          type: '',
        };
        this.imageNumber = this.downLoadParams.barCode;
      }
      this.$http.post(path, params).then(
        (res) => {
          res = res.data;
          if (res.list) {
            this.imageList = res.list.map(img => (
              {
                checked: false,
                ...img,
              }
            )) || [];
          }
        },
        () => {},
      );
    },
    // 手动点击, 查看图片
    viewImage(index) {
      this.$refs.imageViewer.view(index);
      this.percent = 1;
    },
    // 查看上一张
    toPrev() {
      let index = this.currentIndex - 1;
      if (index < 1) {
        index = 1;
        this.$message.warning('已经是第一张');
      }
      this.viewImage(index - 1);
    },
    // 查看下一张
    toNext() {
      let index = this.currentIndex + 1;
      if (index > this.imageList.length) {
        index = this.imageList.length;
        this.$message.warning('已经是最后一张');
      }
      this.viewImage(index - 1);
    },
    handlerIndexChange() {
      this.viewImage(this.currentIndex - 1);
    },
    // 图片查看回调
    imageChange(index) {
      this.currentIndex = index + 1;
    },
    // 缩放图片
    handlerZoom(zoom) {
      this.$refs.imageViewer.zoomTo(zoom);
    },
    handlerZoomOriginal() {
      this.$refs.imageViewer.zoomTo(1);
      this.percent = 1;
    },
    addPercent() {
      this.percent = Math.min(this.maxPercent, this.percent + this.quarter);
    },
    divPercent() {
      this.percent = Math.max(this.minPercent, this.percent - this.quarter);
    },
    // 旋转图片
    handlerRotate(deg) {
      this.$refs.imageViewer.rotate(deg);
    },
    // 打印当前
    handlerPrintCurrent() {
      this.printAll = false;
      this.printCurrent = true;
      this.printChecked = false;
      this.$nextTick(() => {
        window.print();
      });
    },
    // 打印全部
    handlerPrintAll() {
      this.printAll = true;
      this.printCurrent = false;
      this.printChecked = false;
      this.$nextTick(() => {
        window.print();
      });
    },
    // 打印所选
    handlerPrintChecked() {
      if (!this.imageList.filter(item => item.checked).length) {
        this.$message.warning('至少勾选一张图像');
        return;
      }
      this.printAll = false;
      this.printCurrent = false;
      this.printChecked = true;
      this.$nextTick(() => {
        window.print();
      });
    },
    // 下载当前
    handlerDownload() {
      const url = this.imageList[this.currentIndex - 1].imageUrl;
      const fileName = this.imageList[this.currentIndex - 1].imageName;
      const content = `${this.markString}${url}`;
      downloadFile(fileName, content);
    },
    // 下载全部
    handlerDownloadAll() {
      if (this.downLoadParams && Object.keys(this.downLoadParams).length) {
        this.$http.get(this.downloadAllUrl, {
          params: this.downLoadParams,
          responseType: 'blob',
        }).then(
          (res) => {
            const fileName = res.headers['content-disposition'] ? res.headers['content-disposition'].split('=')[1] : `${this.downLoadParams.voucherIds}.zip`;
            downloadFile(fileName, res.data);
          },
          () => {},
        );
      } else {
        const params = {
          imageNumber: this.imageNumber,
          Authorization: window.localStorage.getItem('Authorization'),
        };
        this.$http.get(`${this.baseUrl}/imageQuery/download`, {
          params,
          responseType: 'blob',
        }).then(
          (res) => {
            const fileName = res.headers['content-disposition'] ? res.headers['content-disposition'].split('=')[1] : `${this.imageNumber}.zip`;
            downloadFile(fileName, res.data);
          },
          () => {
          },
        );
      }
    },
    // 影像审核
    openAuditDialog() {
      this.form = {
        imageInfoId: this.imageInfoId,
        imageNumber: this.imageNumber,
      };
      this.auditVisible = true;
    },
    // 修改节点类型
    handlerNodeChange(val) {
      const configObj = {
        HEAVY_AND: 'IMAGE_RESCAN', // 影像重扫
        COMPLEMENT: 'IMAGE_APPEND', // 影像补扫
        DEL: 'IMAGE_DEPRECATED', // 影像作废
      };
      const fastCode = configObj[val];
      this.itemInfo.forEach((item) => {
        if (item.code === 'appraiseType') {
          item.fastCode = fastCode;
          this.$refs.auditForm.getOptions(item);
        }
      });
    },
    handlerSubmit(form) {
      this.$http.post(`${this.baseUrl}/imageInspection/appraiseImageInfo`, form).then(
        () => {
          this.auditVisible = false;
          this.$message({
            type: 'success',
            message: this.$t('提交成功'),
          });
          this.$cookies.set('myPage_cookies', 'true', '1d', '/');
          setTimeout(() => {
            window.close();
          }, 2000);
        },
        () => {
          this.$message({
            type: 'info',
            message: '提交失败',
          });
        },
      );
    },
    // 历史记录
    openApprasieDialog() {
      this.apprasieVisible = true;
    },
  },
};
</script>
<style lang="scss">
@import '../../../assets/scss/theme.scss';
@media print {
  .not-print {
    display: none;
  }
  .image-view .print-content {
    overflow: visible !important;
  }
  .el-popper {
    display: none;
  }
  .viewer-container {
    display: none;
  }
  .viewer-open {
    overflow: visible !important;
  }
}
.image-view {
  height: 100%;
  .not-print {
    // display: none;
  }
  .changeBtn {
    border: 0;
    color: #ffffff;
    font-size: 16px;
    background: $theme;
  }

  .el-header.button-list {
    background: $theme;
    height: 40px;
    line-height: 40px;
    color: #fff;
    padding: 0;

    .button {
      padding: 0 20px;
      cursor: pointer;
    }
    .percent {
      .el-select {
        width: 90px;
        .el-input {
          input {
            height: 30px;
            line-height: 30px;
            margin-top: 5px;
            margin-bottom: 5px;
          }
        }
      }
    }
    .print,.download {
      span {
        color: #fff;
        font-size: 16px;
      }
    }
  }

  .el-main.image-content {
    padding: 0;
    position: relative;
    .title {
      height: 40px;
      line-height: 40px;
      background-color: #f3f3f3;
    }
    .icon {
      cursor: pointer;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2001;
      color: $theme;
      width: 30px;
      height: 40px;
      // background-color: rgba(0, 0, 0, .6);

      &.left {
        left: 23px;
        width: 43px;
        height: 63px;
        background: rgba(11, 126, 215, .8);
        border-radius: 24px;
        color: #fff;
      }
      &.left:before {
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border-width: 0 0 3px 3px;
        border-color: #fff;
        border-style: solid;
        -webkit-transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0);
        transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0) translate(-50%, -50%);
        position: absolute;
        top: 55%;
        right: 24%;
      }
      &.right {
        right: 23px;
        width: 43px;
        height: 63px;
        background: rgba(11, 126, 215, .8);
        border-radius: 24px;
        color: #fff;
      }
      &.right:before {
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border-width: 3px 3px 0 0;
        border-color: #fff;
        border-style: solid;
        -webkit-transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0);
        transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0) translate(-50%, -50%);
        position: absolute;
        top: 55%;
        right: 40%;
      }
      &.nonePic {
        background: rgba(11, 126, 215, .5);
      }
    }
  }

  .el-aside.preview {
    display: block;
    height: calc(100vh - 40px);
    overflow: hidden;

    .operate {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-around;
      align-items: center;
      height: 40px;
      line-height: 40px;
      background-color: #f3f3f3;
      color: $theme;

      .icon {
        cursor: pointer;
        font-size: 20px;
      }

      .content {
        width: 100px;
        text-align: center;
        .el-input {
          width: 50px;
          input {
            height: 24px;
            line-height: 24px;
            margin-top: 8px;
            margin-bottom: 8px;
          }
        }
      }
    }
    .image-list {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      padding-bottom: 10px;
      overflow: auto;
      background: #EFEFEF;
      border-right: 1px solid #e5e5e5;
      height: calc(100% - 40px);
      .image {
        width: 230px;
        border: 4px solid #F8F8F8;
        margin: 6px 4px;
        background-color: #F8F8F8;
        text-align: center;
        box-sizing: content-box;
        cursor: pointer;
        position: relative;
        box-shadow: 0px 1px 0px 0px rgba(0,0,0,0.07);

        .check {
          position: absolute;
          right: 6px;
          top: 6px;
          transform: scale(1.5);
          .el-checkbox__inner {
            width: 12px;
            height: 12px;
            position: initial;
          }
        }

        .name {
          font-size: 12px;
          color: #727272;
          width: 100%;
          line-height: 26px;
        }

        &:hover {
          box-shadow: 0 3px 3px 0 darken(#e7e7e7, 20%);
        }
        &.selected {
          border: 4px solid $theme;
          border-radius: 2px;
          .name {
            background: $theme;
            color: #fff;
          }
        }
        img {
          // flex: 0 1 auto;
          max-width: 230px;
          height: 160px;
          display: block;
          margin: 0 auto;
          padding: 7px 0;
          box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.06);
        }
      }
    }
  }

  .zte-form.audit-form {
    .button-list {
      .el-form-item__content {
        margin-left: 0 !important;
        width: 100%;
        text-align: center;
      }
      .submit {
        border-radius: 15px;
        padding: 8px 20px;
        width: 115px;
      }
    }
  }

  .print-content {
    .image {
      display: none;
      width: 100%;
      page-break-after:always;
      &.print-all {
        display: inline-block;
      }
      &.print-current {
        display: inline-block;
      }
      &.print-checked {
        display: inline-block;
      }
    }
  }

  .audit-dialog {
    .el-dialog__header {
      padding-top: 10px;
      border-bottom: 1px solid #eee;
      .el-dialog__headerbtn {
        top: 15px;
      }
    }
    .el-dialog__body {
      padding: 20px;

      .button-list {
        margin-bottom: 0;
        text-align: center;
      }
    }
  }
}

// 图片查看器样式
.viewer-container.viewer-backdrop.viewer-fixed.viewer-fade.viewer-in {
  width: calc(100vw - 260px);
  height: calc(100vh - 40px);
  left: auto;
  right: 0;
  top: auto;
  bottom: 0;
  background-color: transparent;

  .viewer-button.viewer-close {
    display: none;
  }
  .viewer-prev,
  .viewer-next,
  .viewer-play.viewer-large {
    display: none;
  }
  .viewer-canvas {
    background: #F2F2F2;
    .viewer-move {
      // left: 50% !important;
      // top: 50% !important;
      // transform: translate(-50%, -50%) !important;
      // margin: 0 !important;
    }
  }
}
// .image-list::-webkit-scrollbar {
//   background: #FAFAFA;
  // border-left: 0.5px solid #e5e5e5;
  // border-right: 1px solid #e5e5e5;
//   width: 8px;
// }
// .image-list::-webkit-scrollbar-thumb {
//   background: #E1E1E1;
//   box-shadow: 1px 0px 0px 0px rgba(0,0,0,0.14),-1px 0px 0px 0px rgba(0,0,0,0.08);
//   border-radius: 20px;
// }
// .image-list::-webkit-scrollbar-track {
//   box-shadow: 1px 0px 0px 0px rgba(0,0,0,0.08),0px 0px 0px 0px rgba(0,0,0,0.08);
// }
/*滚动条样式*/
.image-list::-webkit-scrollbar {
  width: 4px;
  background: #FAFAFA;
}
.image-list::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    background: #E1E1E1;
}
.image-list::-webkit-scrollbar-track {/*滚动条里面轨道*/
    border-radius: 4px;
    background: #fff;
}
</style>
