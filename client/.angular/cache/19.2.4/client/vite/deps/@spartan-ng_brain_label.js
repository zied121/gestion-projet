import {
  NgControl
} from "./chunk-FGTUKFKR.js";
import {
  isPlatformBrowser
} from "./chunk-YGLFF6RM.js";
import {
  Directive,
  ElementRef,
  NgModule,
  PLATFORM_ID,
  inject,
  input,
  setClassMetadata,
  signal,
  ɵɵclassProp,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵhostProperty
} from "./chunk-22FW4CBJ.js";
import "./chunk-PEBH6BBU.js";
import "./chunk-WPM5VTLQ.js";
import "./chunk-4S3KYZTJ.js";
import "./chunk-TXDUYLVM.js";

// node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-label.mjs
var nextId = 0;
var BrnLabelDirective = class _BrnLabelDirective {
  _ngControl = inject(NgControl, {
    optional: true
  });
  id = input(`brn-label-${nextId++}`);
  _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  _element = inject(ElementRef).nativeElement;
  _changes;
  _dataDisabled = signal("auto");
  dataDisabled = this._dataDisabled.asReadonly();
  ngOnInit() {
    if (!this._isBrowser) return;
    this._changes = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName !== "data-disabled") return;
        const state = mutation.target.attributes.getNamedItem(mutation.attributeName)?.value === "true";
        this._dataDisabled.set(state ?? "auto");
      });
    });
    this._changes?.observe(this._element, {
      attributes: true,
      childList: true,
      characterData: true
    });
  }
  /** @nocollapse */
  static ɵfac = function BrnLabelDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnLabelDirective)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnLabelDirective,
    selectors: [["", "brnLabel", ""]],
    hostVars: 9,
    hostBindings: function BrnLabelDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵhostProperty("id", ctx.id());
        ɵɵclassProp("ng-invalid", (ctx._ngControl == null ? null : ctx._ngControl.invalid) || null)("ng-dirty", (ctx._ngControl == null ? null : ctx._ngControl.dirty) || null)("ng-valid", (ctx._ngControl == null ? null : ctx._ngControl.valid) || null)("ng-touched", (ctx._ngControl == null ? null : ctx._ngControl.touched) || null);
      }
    },
    inputs: {
      id: [1, "id"]
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnLabelDirective, [{
    type: Directive,
    args: [{
      selector: "[brnLabel]",
      standalone: true,
      host: {
        "[id]": "id()",
        "[class.ng-invalid]": "this._ngControl?.invalid || null",
        "[class.ng-dirty]": "this._ngControl?.dirty || null",
        "[class.ng-valid]": "this._ngControl?.valid || null",
        "[class.ng-touched]": "this._ngControl?.touched || null"
      }
    }]
  }], null, null);
})();
var BrnLabelModule = class _BrnLabelModule {
  /** @nocollapse */
  static ɵfac = function BrnLabelModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnLabelModule)();
  };
  /** @nocollapse */
  static ɵmod = ɵɵdefineNgModule({
    type: _BrnLabelModule,
    imports: [BrnLabelDirective],
    exports: [BrnLabelDirective]
  });
  /** @nocollapse */
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnLabelModule, [{
    type: NgModule,
    args: [{
      imports: [BrnLabelDirective],
      exports: [BrnLabelDirective]
    }]
  }], null, null);
})();
export {
  BrnLabelDirective,
  BrnLabelModule
};
//# sourceMappingURL=@spartan-ng_brain_label.js.map
