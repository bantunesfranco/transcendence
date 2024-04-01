import { Injectable } from '@angular/core';

// class for rendering and moving sprites client side
@Injectable({
  providedIn: 'root'
})
export class SpriteService {
  private sprite: HTMLImageElement;
  private x: number;
  private y: number;

  setSource(src: string): void {
    this.sprite = new Image();
    this.sprite.src = src;
  }

  setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  getWidth(): number {
    return (this.sprite.width);
  }

  getHeight(): number {
    return (this.sprite.height);
  }

  complete(): boolean {
    return (this.sprite.complete);
  }

  addEventListener(mode: string, callBack: any): void {
    this.sprite.addEventListener(mode, callBack, false);
  }

  serialize(): object {
    return ({
      x: this.x,
      y: this.y,
      width: this.sprite.width,
      height: this.sprite.height
    });
  }

  drawToCanvas(context: CanvasRenderingContext2D): void {
    if (this.complete()) {
      context.drawImage(this.sprite, this.x, this.y);
    }
    else {
      this.sprite.addEventListener("load",
        () => {
          context.drawImage(this.sprite, this.x, this.y);
        },
        false,
      );
    }
  }
}
