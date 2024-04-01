import { Injectable } from '@nestjs/common';

@Injectable()
export class SpriteService {
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected direction: Array<number> = [0, 0];

  setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setDim(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setX(x: number): void {
    this.x = x;
  }

  setY(y: number): void {
    this.y = y;
  }

  setDir(x: number, y: number): void {
    this.direction[0] = x;
    this.direction[1] = y;
  }

  getWidth(): number {
    return (this.width);
  }

  getHeight(): number {
    return (this.height);
  }

  getX(): number {
    return (this.x);
  }

  getY(): number {
    return (this.y);
  }

  getDirX(): number {
    return (this.direction[0]);
  }

  getDirY(): number {
    return (this.direction[1]);
  }

  movePlayer(amount: number, xFactor: number, yFactor: number, boardHeight: number): void {
    let new_x = this.x + amount * this.direction[0] * xFactor;
    let new_y = this.y + amount * this.direction[1] * yFactor;
    if (new_y < 0 || new_y + this.height > boardHeight)
      return;
    this.x = new_x;
    this.y = new_y;
  }

  moveBall(amount: number, xFactor: number, yFactor: number): void {
    this.x += amount * this.direction[0] * xFactor;
    this.y += amount * this.direction[1] * yFactor;
  }
}
