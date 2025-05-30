import {
  Directive,
  setClassMetadata,
  signal,
  ɵɵdefineDirective
} from "./chunk-22FW4CBJ.js";
import "./chunk-PEBH6BBU.js";
import "./chunk-WPM5VTLQ.js";
import "./chunk-4S3KYZTJ.js";
import "./chunk-TXDUYLVM.js";

// node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-form-field.mjs
var BrnFormFieldControl = class _BrnFormFieldControl {
  /** Gets the AbstractControlDirective for this control. */
  ngControl = null;
  /** Whether the control is in an error state. */
  errorState = signal(false);
  /** @nocollapse */
  static ɵfac = function BrnFormFieldControl_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnFormFieldControl)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnFormFieldControl
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnFormFieldControl, [{
    type: Directive
  }], null, null);
})();
export {
  BrnFormFieldControl
};
//# sourceMappingURL=@spartan-ng_brain_form-field.js.map
