import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';
import { DropDownComponent } from './components/drop-down/drop-down.component';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ProfileComponent } from './components/profile/profile.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { MatchHistoryComponent } from './components/match-history/match-history.component';
import { TwoFaComponent } from './components/two-fa/two-fa.component';
import { TwoFaAuthComponent } from './components/two-fa/two-fa-auth/two-fa-auth.component';
import { OnlyNumber } from './directives/only-number.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ChipsComponent } from './components/shared/chips/chips.component';
import { AvatarUploadComponent } from './components/profile/avatar-upload/avatar-upload.component';
import { UserDetailsComponent } from './components/profile/user-details/user-details.component';
import { UserFriendsFoesComponent } from './components/profile/user-friends-foes/user-friends-foes.component';
import { UserStatisticsComponent } from './components/profile/user-statistics/user-statistics.component';
import { NavigationComponent } from './components/shared/navigation/navigation.component';

import { ChatModule } from './components/chat/chat.module';

import { SocketIoModule } from 'ngx-socket-io';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    DropDownComponent,
    ProfileComponent,
    TwoFaComponent,
    TwoFaAuthComponent,
    MatchHistoryComponent,
    OnlyNumber,
    AvatarUploadComponent,
    UserListComponent,
    UserDetailsComponent,
    UserFriendsFoesComponent,
    UserStatisticsComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NavigationComponent,
    ChipsComponent,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    ChatModule,
    SocketIoModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
