import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';
import { MatchHistoryComponent } from './components/match-history/match-history.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TwoFaComponent } from './components/two-fa/two-fa.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { AuthGuard } from './guards/auth.guard';
import { TwoFaAuthComponent } from './components/two-fa/two-fa-auth/two-fa-auth.component';
import { TwoFaAuthGuard } from './guards/two-fa-auth.guard';
import { AvatarUploadComponent } from './components/profile/avatar-upload/avatar-upload.component';
import { ChatComponent } from './components/chat/chat.component';
import { NewChatComponent } from './components/chat/new-chat/new-chat.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: mapToCanActivate([AuthGuard]),
  },
  {
    path: 'chat',
    canActivate: mapToCanActivate([AuthGuard]),
    children: [
      {
        path: '',
        component: ChatComponent,
      },
      {
        path: 'new',
        component: NewChatComponent,
      },
    ],
  },
  {
    path: 'game',
    canActivate: mapToCanActivate([AuthGuard]),
    children: [
      { path: '', component: GameComponent },
      { path: ':queueID', component: GameComponent },
    ],
  },
  {
    path: 'user-list',
    component: UserListComponent,
    canActivate: mapToCanActivate([AuthGuard]),
  },
  {
    path: 'profile',
    canActivate: mapToCanActivate([AuthGuard]),
    children: [
      {
        path: '',
        component: ProfileComponent,
      },
      {
        path: 'two-fa-enable',
        component: TwoFaComponent,
      },
      {
        path: ':userId',
        component: ProfileComponent,
      },
    ],
  },
  {
    path: 'game-record',
    component: MatchHistoryComponent,
    canActivate: mapToCanActivate([AuthGuard]),
  },
  {
    path: 'two-fa-auth',
    canActivate: mapToCanActivate([TwoFaAuthGuard]),
    component: TwoFaAuthComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
