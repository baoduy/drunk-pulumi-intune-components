import {MacOSCompliancePolicy} from "@microsoft/microsoft-graph-types-beta";

export type MacDeviceCompliance = MacOSCompliancePolicy &{
  readonly '@odata.type': '#microsoft.graph.macOSCompliancePolicy';
};