import { Component, Host, HostListener, ViewChild } from '@angular/core';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { GameComponent } from '../game/game.component';

export interface Theme {
  ball: string;
  paddle: string;
  background: string;
  accent: string;
  viewValue: string;
}

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrl: './drop-down.component.css',
})
export class DropDownComponent {
  constructor(@Host() parent: GameComponent) {
    this.game = parent;
  }
  selectedValue: Theme;
  game: GameComponent;
  @ViewChild('select') select!: MatSelect;

  onSelectionChange(event: MatSelectChange): void {
    const selectedValue = event.value;
    this.game.menuCallBack(selectedValue);
    this.select.close();
  }

  themes: Theme[] = [
    {
      ball: 'assets/ball.png',
      paddle: 'assets/paddle_green.png',
      background: '#0000ff',
      accent: '#ffffff',
      viewValue: 'default'
    },
    {
      ball: 'assets/ball_green.png',
      paddle: 'assets/paddle_purple.png',
      background: '#ff8800',
      accent: '#ff0000',
      viewValue: 'crazy'
    },
    {
      ball: 'assets/ball_gradient.png',
      paddle: 'assets/paddle_yellow.png',
      background: '#b89849',
      accent: '#59689c',
      viewValue: 'slick'
    }
  ];
}
