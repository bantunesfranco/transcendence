import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFriendsFoesComponent } from './user-friends-foes.component';

describe('UserFriendsFoesComponent', () => {
  let component: UserFriendsFoesComponent;
  let fixture: ComponentFixture<UserFriendsFoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFriendsFoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserFriendsFoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
