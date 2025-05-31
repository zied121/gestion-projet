import { NgModule } from '@angular/core';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  imports: [NgxQRCodeModule],
  exports: [NgxQRCodeModule]
})
export class NgxQrcodeWrapperModule {} 