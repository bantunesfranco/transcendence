import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { NewChatComponent } from 'src/app/components/chat/new-chat/new-chat.component';
import { PasswordDialogComponent } from './password/password.component';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  declarations: [ChatComponent, NewChatComponent, PasswordDialogComponent],
  providers: [PasswordDialogComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatGridListModule,
    MatDialogModule,

    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    NavigationComponent,
    MatSlideToggleModule,
    MatButtonModule,
    MatSidenavModule,

    AppRoutingModule,
    ReactiveFormsModule,

    BrowserModule,
    FormsModule,
  ],
  exports: [ChatComponent, NewChatComponent],
})
export class ChatModule {}
