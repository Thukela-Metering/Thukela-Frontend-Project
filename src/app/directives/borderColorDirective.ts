import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBorderColor]'
})
export class BorderColorDirective implements OnChanges {
  @Input() appBorderColor: string;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(): void {
    const inputElement = this.el.nativeElement.querySelector('.mat-input-element');
    if (inputElement) {
      if (this.appBorderColor === 'green') {
        this.renderer.setStyle(inputElement, 'border', '2px solid green');
      } else if (this.appBorderColor === 'red') {
        this.renderer.setStyle(inputElement, 'border', '2px solid red');
      }
    }
  }
}
