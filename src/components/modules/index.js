import zteForm from './zte-form';
import zteTable from './zte-table';
import zteTableLocal from './zte-table-local';

const zteUI = {
  install(Vue) {
    Vue.component('zteForm', zteForm);
    Vue.component('zteTable', zteTable);
    Vue.component('zteTableLocal', zteTableLocal);
  },
};

export default zteUI;
