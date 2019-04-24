import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';


@Injectable()
export class ParametersService{

  private obj;

  constructor(public httpClient: HttpClient) {
  }

  init() {
    return new Promise((resolve, reject)=>{
      this.httpClient.get("assets/parameters.json").subscribe(data => {
        this.obj = data;
        resolve();
      }, err => {
        reject();
      });
    });
  }

  get parameters() {
    if(typeof this.obj !== 'undefined'){
      return this.obj;
    }
  }

}
