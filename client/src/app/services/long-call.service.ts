import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { TimeoutParameter } from '../models';

@Injectable()
export class LongCallService {
  private rootPath = 'long-call/';

  constructor(private http: HttpClient) {}

  getSubmitPath(): string {
    return this.rootPath.concat('submit');
  }

  getPollPath(taskId: string): string {
    return this.rootPath.concat('poll/').concat(taskId);
  }

  submit(body: TimeoutParameter): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(
      this.getSubmitPath(), body, {observe: 'response'});
  }

  poll(taskId: string): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>(
      this.getPollPath(taskId), {observe: 'response'});
  }
}
