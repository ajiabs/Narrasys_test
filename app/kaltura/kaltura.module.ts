const npKalturaModule = angular.module('np.kaltura', []);

const components = [];
const services = [];

components.forEach((cmp: any) => {
  npKalturaModule.component(cmp.Name, new cmp());
});

services.forEach((svc: any) => {
  npKalturaModule.service(svc.Name, svc);
});

export default npKalturaModule;
