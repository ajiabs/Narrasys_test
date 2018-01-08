import { ProjectsContainer } from './components/npProjectsContainer';

const npProjectsModule = angular.module('np.projects', []);

const components = [
  ProjectsContainer
];

components.forEach((cmp: any) => {
  npProjectsModule.component(cmp.Name, new cmp());
});

export default npProjectsModule;
