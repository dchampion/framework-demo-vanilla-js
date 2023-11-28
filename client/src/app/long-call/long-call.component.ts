import { Component, OnInit } from '@angular/core';
import { LongCallService } from '../services/long-call.service';
import { ISubscription } from 'rxjs/Subscription';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

@Component({
  selector: 'app-long-call',
  templateUrl: './long-call.component.html',
  providers: [LongCallService]
})
export class LongCallComponent implements OnInit {

  protected urlPath: string;

  protected taskId: string;
  protected taskStatus: string;
  protected httpStatusCode: number;

  protected body: string[];
  protected timeout: number;

  protected progress: string;

  private submitSubscription: ISubscription;
  private pollSubscription: ISubscription;
  private timerSubscription: ISubscription;

  constructor(private longCallService: LongCallService) {
  }

  ngOnInit() {
    this.timeout = 10;
    this.resetVars();
  }

  resetVars() {
    this.urlPath = '';
    this.progress = '';
    this.httpStatusCode = -1;
    this.body = [];
  }

  onSubmit() {
    this.resetVars();

    this.urlPath = this.longCallService.getSubmitPath();

    this.submitSubscription = this.longCallService.submit({timeout: this.timeout}).subscribe(
      (response: HttpResponse<any>) => {
        this.submitSubscription.unsubscribe();

        this.httpStatusCode = response.status;
        this.taskStatus = response.headers.get('Task-Status');
        this.taskId = response.headers.get('Task-Id');

        this.timerSubscription = TimerObservable.create(2000, 2000).subscribe(() => this.poll());
      },
      (error: HttpErrorResponse) => {
        this.httpStatusCode = error.status;
        this.taskStatus = error.headers.get('Task-Status');

        this.unsubscribe();
      }
    );
  }

  onPollBadId() {
    this.resetVars();
    this.taskId = 'd2ab1fe6-73da-4ef7-a440-75181d22a591';
    this.poll();
  }

  poll() {
    this.urlPath = this.longCallService.getPollPath(this.taskId);

    this.pollSubscription = this.longCallService.poll(this.taskId).subscribe(
      (response: HttpResponse<string[]>) => {
        this.httpStatusCode = response.status;
        this.taskStatus = response.headers.get('Task-Status');
        if (this.taskStatus === 'pending') {
          this.progress += '.';
        } else {
          this.unsubscribe();

          if (this.taskStatus === 'complete') {
            this.body = response.body;
          }
          this.progress = '';
        }
      },
      (error: HttpErrorResponse) => {
        this.httpStatusCode = error.status;
        this.taskStatus = error.headers.get('Task-Status');
        this.unsubscribe();
        this.progress = '';
      }
    );
  }

  unsubscribe() {
    this.timerSubscription.unsubscribe();
    this.pollSubscription.unsubscribe();
  }
}
