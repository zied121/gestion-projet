import { type OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as i0 from "@angular/core";
export declare class BrnLabelDirective implements OnInit {
    protected readonly _ngControl: NgControl | null;
    readonly id: import("@angular/core").InputSignal<string>;
    private readonly _isBrowser;
    private readonly _element;
    private _changes?;
    private readonly _dataDisabled;
    readonly dataDisabled: import("@angular/core").Signal<boolean | "auto">;
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BrnLabelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BrnLabelDirective, "[brnLabel]", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
