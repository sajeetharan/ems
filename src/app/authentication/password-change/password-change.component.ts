import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  isLoading = false;
  private authStatusSub: Subscription;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;

  constructor(public authService: AuthenticationService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }

  onChangePassword(form: NgForm) {
    console.log(form);
    if (form.invalid) {
      return;
    }
    this.oldPassword = form.value.oldPassword;
    this.newPassword = form.value.newPassword;
    this.confirmPassword = form.value.confirmPassword;
    console.log('11111');
    if (form.value.newPassword !== form.value.confirmPassword) {
      return;
    }
    console.log('22222');
    this.isLoading = true;
    this.authService.changePassword(
      this.authService.getUserId(),
      this.oldPassword,
      this.newPassword);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
