import {
  enableDemoData,
  disableDemoData,
  demoDataStatus,
} from "../../db/demo-data.js";

export const demoService = {
  enable: enableDemoData,
  disable: disableDemoData,
  status: demoDataStatus,
};
