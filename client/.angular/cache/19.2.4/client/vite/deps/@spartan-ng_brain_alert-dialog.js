import {
  BrnDialogComponent,
  BrnDialogContentDirective,
  BrnDialogDescriptionDirective,
  BrnDialogOverlayComponent,
  BrnDialogTitleDirective,
  BrnDialogTriggerDirective,
  provideBrnDialogDefaultOptions
} from "./chunk-HXCZM4NY.js";
import {
  provideCustomClassSettableExisting,
  provideExposesStateProviderExisting
} from "./chunk-QYE6K6N3.js";
import "./chunk-H7QGH3RH.js";
import "./chunk-O2F34CCP.js";
import "./chunk-LGOP3LQF.js";
import "./chunk-YGLFF6RM.js";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  NgModule,
  ViewEncapsulation,
  effect,
  forwardRef,
  input,
  setClassMetadata,
  untracked,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵgetInheritedFactory,
  ɵɵhostProperty,
  ɵɵprojection,
  ɵɵprojectionDef
} from "./chunk-22FW4CBJ.js";
import "./chunk-PEBH6BBU.js";
import "./chunk-WPM5VTLQ.js";
import "./chunk-4S3KYZTJ.js";
import "./chunk-TXDUYLVM.js";

// node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-alert-dialog.mjs
var _c0 = ["*"];
var BrnAlertDialogContentDirective = class _BrnAlertDialogContentDirective extends BrnDialogContentDirective {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogContentDirective_BaseFactory;
    return function BrnAlertDialogContentDirective_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogContentDirective_BaseFactory || (ɵBrnAlertDialogContentDirective_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogContentDirective)))(__ngFactoryType__ || _BrnAlertDialogContentDirective);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogContentDirective,
    selectors: [["", "brnAlertDialogContent", ""]],
    features: [ɵɵProvidersFeature([provideExposesStateProviderExisting(() => _BrnAlertDialogContentDirective)]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogContentDirective, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogContent]",
      standalone: true,
      providers: [provideExposesStateProviderExisting(() => BrnAlertDialogContentDirective)]
    }]
  }], null, null);
})();
var BrnAlertDialogDescriptionDirective = class _BrnAlertDialogDescriptionDirective extends BrnDialogDescriptionDirective {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogDescriptionDirective_BaseFactory;
    return function BrnAlertDialogDescriptionDirective_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogDescriptionDirective_BaseFactory || (ɵBrnAlertDialogDescriptionDirective_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogDescriptionDirective)))(__ngFactoryType__ || _BrnAlertDialogDescriptionDirective);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogDescriptionDirective,
    selectors: [["", "brnAlertDialogDescription", ""]],
    hostVars: 1,
    hostBindings: function BrnAlertDialogDescriptionDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵhostProperty("id", ctx._id());
      }
    },
    features: [ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogDescriptionDirective, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogDescription]",
      standalone: true,
      host: {
        "[id]": "_id()"
      }
    }]
  }], null, null);
})();
var BrnAlertDialogOverlayComponent = class _BrnAlertDialogOverlayComponent extends BrnDialogOverlayComponent {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogOverlayComponent_BaseFactory;
    return function BrnAlertDialogOverlayComponent_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogOverlayComponent_BaseFactory || (ɵBrnAlertDialogOverlayComponent_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogOverlayComponent)))(__ngFactoryType__ || _BrnAlertDialogOverlayComponent);
    };
  })();
  /** @nocollapse */
  static ɵcmp = ɵɵdefineComponent({
    type: _BrnAlertDialogOverlayComponent,
    selectors: [["brn-alert-dialog-overlay"]],
    features: [ɵɵProvidersFeature([provideCustomClassSettableExisting(() => _BrnAlertDialogOverlayComponent)]), ɵɵInheritDefinitionFeature],
    decls: 0,
    vars: 0,
    template: function BrnAlertDialogOverlayComponent_Template(rf, ctx) {
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogOverlayComponent, [{
    type: Component,
    args: [{
      selector: "brn-alert-dialog-overlay",
      standalone: true,
      providers: [provideCustomClassSettableExisting(() => BrnAlertDialogOverlayComponent)],
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None
    }]
  }], null, null);
})();
var BrnAlertDialogTitleDirective = class _BrnAlertDialogTitleDirective extends BrnDialogTitleDirective {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogTitleDirective_BaseFactory;
    return function BrnAlertDialogTitleDirective_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogTitleDirective_BaseFactory || (ɵBrnAlertDialogTitleDirective_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogTitleDirective)))(__ngFactoryType__ || _BrnAlertDialogTitleDirective);
    };
  })();
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogTitleDirective,
    selectors: [["", "brnAlertDialogTitle", ""]],
    hostVars: 1,
    hostBindings: function BrnAlertDialogTitleDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵhostProperty("id", ctx._id());
      }
    },
    features: [ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogTitleDirective, [{
    type: Directive,
    args: [{
      selector: "[brnAlertDialogTitle]",
      standalone: true,
      host: {
        "[id]": "_id()"
      }
    }]
  }], null, null);
})();
var BrnAlertDialogTriggerDirective = class _BrnAlertDialogTriggerDirective extends BrnDialogTriggerDirective {
  brnAlertDialogTriggerFor = input();
  constructor() {
    super();
    effect(() => {
      const brnDialog = this.brnAlertDialogTriggerFor();
      untracked(() => {
        if (brnDialog) {
          this.mutableBrnDialogTriggerFor().set(brnDialog);
        }
      });
    });
  }
  /** @nocollapse */
  static ɵfac = function BrnAlertDialogTriggerDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnAlertDialogTriggerDirective)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnAlertDialogTriggerDirective,
    selectors: [["button", "brnAlertDialogTrigger", ""], ["button", "brnAlertDialogTriggerFor", ""]],
    hostAttrs: ["aria-haspopup", "dialog"],
    hostVars: 4,
    hostBindings: function BrnAlertDialogTriggerDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵhostProperty("id", ctx.id());
        ɵɵattribute("aria-expanded", ctx.state() === "open" ? "true" : "false")("data-state", ctx.state())("aria-controls", ctx.dialogId);
      }
    },
    inputs: {
      brnAlertDialogTriggerFor: [1, "brnAlertDialogTriggerFor"]
    },
    features: [ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogTriggerDirective, [{
    type: Directive,
    args: [{
      selector: "button[brnAlertDialogTrigger],button[brnAlertDialogTriggerFor]",
      standalone: true,
      host: {
        "[id]": "id()",
        "aria-haspopup": "dialog",
        "[attr.aria-expanded]": "state() === 'open' ? 'true': 'false'",
        "[attr.data-state]": "state()",
        "[attr.aria-controls]": "dialogId"
      }
    }]
  }], () => [], null);
})();
var BRN_ALERT_DIALOG_DEFAULT_OPTIONS = {
  closeOnBackdropClick: false,
  closeOnOutsidePointerEvents: false,
  role: "alertdialog"
};
var BrnAlertDialogComponent = class _BrnAlertDialogComponent extends BrnDialogComponent {
  /** @nocollapse */
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵBrnAlertDialogComponent_BaseFactory;
    return function BrnAlertDialogComponent_Factory(__ngFactoryType__) {
      return (ɵBrnAlertDialogComponent_BaseFactory || (ɵBrnAlertDialogComponent_BaseFactory = ɵɵgetInheritedFactory(_BrnAlertDialogComponent)))(__ngFactoryType__ || _BrnAlertDialogComponent);
    };
  })();
  /** @nocollapse */
  static ɵcmp = ɵɵdefineComponent({
    type: _BrnAlertDialogComponent,
    selectors: [["brn-alert-dialog"]],
    exportAs: ["brnAlertDialog"],
    features: [ɵɵProvidersFeature([{
      provide: BrnDialogComponent,
      useExisting: forwardRef(() => _BrnAlertDialogComponent)
    }, provideBrnDialogDefaultOptions(BRN_ALERT_DIALOG_DEFAULT_OPTIONS)]), ɵɵInheritDefinitionFeature],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function BrnAlertDialogComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogComponent, [{
    type: Component,
    args: [{
      selector: "brn-alert-dialog",
      standalone: true,
      template: `
		<ng-content />
	`,
      providers: [{
        provide: BrnDialogComponent,
        useExisting: forwardRef(() => BrnAlertDialogComponent)
      }, provideBrnDialogDefaultOptions(BRN_ALERT_DIALOG_DEFAULT_OPTIONS)],
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      exportAs: "brnAlertDialog"
    }]
  }], null, null);
})();
var BrnAlertDialogImports = [BrnAlertDialogComponent, BrnAlertDialogOverlayComponent, BrnAlertDialogTriggerDirective, BrnAlertDialogContentDirective, BrnAlertDialogTitleDirective, BrnAlertDialogDescriptionDirective];
var BrnAlertDialogModule = class _BrnAlertDialogModule {
  /** @nocollapse */
  static ɵfac = function BrnAlertDialogModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnAlertDialogModule)();
  };
  /** @nocollapse */
  static ɵmod = ɵɵdefineNgModule({
    type: _BrnAlertDialogModule,
    imports: [BrnAlertDialogComponent, BrnAlertDialogOverlayComponent, BrnAlertDialogTriggerDirective, BrnAlertDialogContentDirective, BrnAlertDialogTitleDirective, BrnAlertDialogDescriptionDirective],
    exports: [BrnAlertDialogComponent, BrnAlertDialogOverlayComponent, BrnAlertDialogTriggerDirective, BrnAlertDialogContentDirective, BrnAlertDialogTitleDirective, BrnAlertDialogDescriptionDirective]
  });
  /** @nocollapse */
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnAlertDialogModule, [{
    type: NgModule,
    args: [{
      imports: [...BrnAlertDialogImports],
      exports: [...BrnAlertDialogImports]
    }]
  }], null, null);
})();
export {
  BRN_ALERT_DIALOG_DEFAULT_OPTIONS,
  BrnAlertDialogComponent,
  BrnAlertDialogContentDirective,
  BrnAlertDialogDescriptionDirective,
  BrnAlertDialogImports,
  BrnAlertDialogModule,
  BrnAlertDialogOverlayComponent,
  BrnAlertDialogTitleDirective,
  BrnAlertDialogTriggerDirective
};
//# sourceMappingURL=@spartan-ng_brain_alert-dialog.js.map
