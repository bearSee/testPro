<template>
  <ul class="images" style="display:none">
    <li v-for="(url, index) in images" :key="index" :data-index="index">
      <img :src="`${markString}${url}`">
    </li>
  </ul>
</template>

<script type="text/javascript">
import $ from 'jquery';
/* eslint-disable */
import viewer from 'imageviewer';
/* eslint-ensable */
import 'imageviewer/dist/viewer.min.css';
// https://github.com/fengyuanchen/viewer/blob/v0.5.1/README.md
export default {
  name: 'imageviewer',
  props: {
    images: {
      type: Array,
      default: () => ([]),
    },
    markString: {
      type: String,
      default: '/erssys',
    },
    isShow: {
      type: Boolean,
      default: false,
    },
    defaultIndex: {
      type: Number,
      default: 0,
    },
    // Enable inline mode.
    inline: {
      type: Boolean,
      default: false,
    },
    // Show the button on the top-right of the viewer.
    button: {
      type: Boolean,
      default: true,
    },
    // Specify the visibility of the navbar.
    navbar: {
      type: Boolean,
      default: true,
    },
    // Specify the visibility of the title (the current image's name and dimensions).
    title: {
      type: Boolean,
      default: true,
    },
    // Specify the visibility of the toolbar.
    toolbar: {
      type: Boolean,
      default: true,
    },
    // Show the tooltip with image ratio (percentage) when zoom in or zoom out
    isTooltip: {
      type: Boolean,
      default: true,
    },
    // Enable to move the image.
    movable: {
      type: Boolean,
      default: true,
    },
    // Enable to zoom the image.
    zoomable: {
      type: Boolean,
      default: true,
    },
    // Enable to rotate the image.
    rotatable: {
      type: Boolean,
      default: true,
    },
    // Enable to scale the image.
    scalable: {
      type: Boolean,
      default: true,
    },
    // Enable CSS3 Transition for some special elements.
    transition: {
      type: Boolean,
      default: false,
    },
    // Enable to request full screen when play.
    fullscreen: {
      type: Boolean,
      default: true,
    },
    // Enable keyboard support.
    keyboard: {
      type: Boolean,
      default: true,
    },
    // Define interval of each image when playing.
    interval: {
      type: Number,
      default: 5000,
    },
    // Define the ratio when zoom the image by wheeling mouse.
    zoomRatio: {
      type: Number,
      default: 0.1,
    },
    // Define the min ratio of the image when zoom out.
    minZoomRatio: {
      type: Number,
      default: 0.01,
    },
    // Define the max ratio of the image when zoom in.
    maxZoomRatio: {
      type: Number,
      default: 100,
    },
    // Define the CSS z-index value of viewer in modal mode.
    zIndex: {
      type: Number,
      default: 1999,
    },
    // Define the CSS z-index value of viewer in inline mode.
    zIndexInline: {
      type: Number,
      default: 2017,
    },
    // Define the CSS z-index value of viewer in inline mode.
    url: {
      type: String,
      default: 'src',
    },
    // A shortcut of the "build.viewer" event.
    build: {
      type: Function,
      default: null,
    },
    // A shortcut of the "built.viewer" event.
    built: {
      type: Function,
      default: null,
    },
    // A shortcut of the "show.viewer" event.
    beforeShow: {
      type: Function,
      default: null,
    },
    // A shortcut of the "shown.viewer" event.
    shown: {
      type: Function,
      default: null,
    },
    // A shortcut of the "hide.viewer" event.
    beforeHide: {
      type: Function,
      default: null,
    },
    // A shortcut of the "hidden.viewer" event.
    hidden: {
      type: Function,
      default: null,
    },
    // A shortcut of the "view.viewer" event.
    beforeView: {
      type: Function,
      default: null,
    },
    // A shortcut of the "viewed.viewer" event.
    viewed: {
      type: Function,
      default: null,
    },
    backdrop: {
      type: [Boolean, String],
      default: 'static',
    },
  },
  data() {
    return {
      isInit: false, // 避免初始化时候images传入为空的情况
      // 当图片变更时，标识是否重载imageviewer
      isReset: false,
      options: {
        inline: this.inline,
        button: this.button,
        navbar: this.navbar,
        title: this.title,
        toolbar: this.toolbar,
        tooltip: this.isTooltip,
        movable: this.movable,
        zoomable: this.zoomable,
        rotatable: this.rotatable,
        scalable: this.scalable,
        transition: this.transition,
        fullscreen: this.fullscreen,
        keyboard: this.keyboard,
        interval: this.interval,
        zoomRatio: this.zoomRatio,
        minZoomRatio: this.minZoomRatio,
        maxZoomRatio: this.maxZoomRatio,
        zIndex: this.zIndex,
        zIndexInline: this.zIndexInline,
        url: this.url,
        build: this.build,
        built: this.built,
        show: this.beforeShow,
        shown: this.shown,
        hide: this.beforeHide,
        hidden: this.hidden,
        view: this.beforeView,
        viewed: this.viewed,
        backdrop: this.backdrop,
      },
    };
  },
  created() {
    if (this.images.length && this.isShow) {
      this.show();
    }
  },
  watch: {
    isShow(isShow) {
      if (isShow) {
        if(this.isInit) {
          this.update();
        }
        this.show();
      } else {
        this.hide();
      }
    },
    images() {
      if (this.isInit) {
        this.update();
        this.isReset = false;
      }
    },
  },
  updated() {
    if (!this.isReset) {
      this.hide();
      this.destroy();
      this.isInit = false;
      if (this.isShow) {
        this.show();
      }
      this.isReset = true;
    }
  },
  methods: {
    init() {
      $(this.$el)
      .viewer(this.options)
      .on('hidden.viewer', () => {
        this.$emit('hide');
      })
      .on('shown.viewer', () => {
        this.view(this.defaultIndex);
      })
      .on('viewed.viewer', () => {
        // this.zoomTo(1);
        // this.moveTo(0, 0);
        // this.moveTo(0, '10%');
        // this.move(-125, -20);
      })
      .on('view.viewer', (event) => {
        this.$emit('change', event.detail.index);
      });
      this.isInit = true;
    },
    destroy() {
      $(this.$el).viewer('destroy');
    },
    // Show the viewer.
    show() {
      if (!this.images.length) {
        return;
      }
      if (!this.isInit) {
        this.init();
      }
      $(this.$el).viewer('show');
    },
    // hide the viewer.
    hide() {
      $(this.$el).viewer('hide');
    },
    // View one of the images with image's index.
    view(index = 0) {
      $(this.$el).viewer('view', index);
    },
    // View the previous image.
    prev() {
      this.$emit('prev');
      $(this.$el).viewer('prev');
    },
    // View the next image.
    next() {
      this.$emit('next');
      $(this.$el).viewer('next');
    },
    // Move the image with relative offsets.
    move(offsetX, offsetY = undefined) {
      if (offsetY || offsetY === 0) {
        $(this.$el).viewer('move', offsetX, offsetY);
      } else {
        $(this.$el).viewer('move', offsetX);
      }
    },
    // Move the image to an absolute point.
    moveTo(x, y = undefined) {
      if (y || y === 0) {
        $(this.$el).viewer('moveTo', x, y);
      } else {
        $(this.$el).viewer('moveTo', x);
      }
    },
    // Zoom the image with a relative ratio
    zoom(ratio, hasTooltip = false) {
      $(this.$el).viewer('zoom', ratio, hasTooltip);
      this.moveTo(0, 0);
    },
    // Zoom the image to an absolute ratio.
    zoomTo(ratio, hasTooltip = false) {
      $(this.$el).viewer('zoomTo', ratio, hasTooltip);
      this.moveTo(0, 0);
    },
    // Rotate the image with a relative degree.
    rotate(degree) {
      $(this.$el).viewer('rotate', degree);
    },
    // Rotate the image to an absolute degree.
    rotateTo(degree) {
      $(this.$el).viewer('rotateTo', degree);
    },
    // Scale the image.
    scale(scaleX = 1, scaleY = undefined) {
      if (scaleY || scaleY === 0) {
        $(this.$el).viewer('scale', scaleX, scaleY);
      } else {
        $(this.$el).viewer('scale', scaleX);
      }
    },
    // Scale the abscissa of the image.
    scaleX(scaleX = 1) {
      $(this.$el).viewer('scaleX', scaleX);
    },
    // Scale the ordinate of the image.
    scaleY(scaleY = 1) {
      $(this.$el).viewer('scaleY', scaleY);
    },
    // Play the images.
    play() {
      $(this.$el).viewer('play');
    },
    // Stop play.
    stop() {
      $(this.$el).viewer('stop');
    },
    // Enter modal mode.
    full() {
      $(this.$el).viewer('full');
    },
    // Exit modal mode.
    exit() {
      $(this.$el).viewer('exit');
    },
    // Show the current ratio of the image with percentage.
    tooltip() {
      $(this.$el).viewer('tooltip');
    },
    // Toggle the image size between its natural size and initial size.
    toggle() {
      $(this.$el).viewer('toggle');
    },
    // Reset the image to its initial state.
    reset() {
      $(this.$el).viewer('reset');
    },
    // Update the viewer when images changed.
    update() {
      $(this.$el).viewer('update');
    },
  },
  destroyed() {
    $(this.$el).off().viewer('destroy');
  },
};
</script>
