// These are the Runtime Values that are Created form
// the Program Body -> Runtime

export type ValueType = "null" | "number" | "boolean" | "object";

// All the values are inherited from the Runtime Val which
// only have a type attribute
//

export interface RuntimeVal {
  type: ValueType;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

// Macros that will return RuntimeValues
export function MK_NULL() {
  return { type: "null", value: null } as NullVal;
}

export function MK_BOOL(val = true) {
  return { type: "boolean", value: val } as BooleanVal;
}

export function MK_NUM(val: number) {
  return { type: "number", value: val } as NumberVal;
}
