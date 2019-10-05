import qs from 'qs';

export default {
//   data() {
//     // 默认会计期间
//     const defaultPeriod = () => {
//       const date = new Date();
//       const year = date.getFullYear();
//       let month = date.getMonth();
//       if (month >= 1 && month <= 9) month = `0${month}`;
//       const val = month === 0 ? `${year - 1}12` : `${year}${month}`;
//       return val;
//     };
//   },
  methods: {
    openUrl(row, type, source = 'voucherMatching') {
      // 部分页面返回的字段叫id，另一部分叫voucherId
      const voucherId = row.voucherId || row.id;
      const voucherStatus = row.voucherStatus;
      const { barcode: imageNumber } = row;
      const url = `${window.location.pathname}#/imageView?${qs.stringify({ voucherId, imageNumber, voucherStatus, type, source })}`;
      window.open(url);
    },
    getNowPeriod() {
      const date = new Date();
      const year = date.getFullYear();
      let month = date.getMonth();
      if (month >= 1 && month <= 9) month = `0${month}`;
      const val = month === 0 ? `${year - 1}12` : `${year}${month}`;
      return val;
    },
  },
};
