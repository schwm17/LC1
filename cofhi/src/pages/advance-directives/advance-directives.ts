
import { Question } from './Objects/Question';
import { Group } from './Objects/Group';

import { Component } from '@angular/core';
import { IonicPage, ModalController } from 'ionic-angular';
import { HttpClient } from "@angular/common/http";
import { Answer } from "./Objects/Answer";
import { QuestionsPage } from "./QuestionsModal/questions";
import { TextAnswer } from "./Objects/AnswersType/TextAnswer";
import { RadioAnswer } from "./Objects/AnswersType/RadioAnswer";
import { CheckboxAnswer } from "./Objects/AnswersType/CheckboxAnswer";

@IonicPage()
@Component({
  selector: 'page-advance-directives',
  templateUrl: 'advance-directives.html',
})
export class AdvanceDirectivesPage {
  hideInability: boolean[] = [];
  hideDeath: boolean = true;
  hideAfterDeath: boolean = true;
  groups: Group[];
  jsonObj: any;
  constructor(public modalCtrl: ModalController, public httpClient: HttpClient) {
    
  }

  ionViewDidLoad() {
    if (typeof this.groups === 'undefined') {
      this.readJson().then(() => {
        this.getGroupsFromJson();
      }).catch(() => {

      });
    }
  }
  readJson() {
    return new Promise((resolve, reject) => {
      this.httpClient.get("assets/questions.json").subscribe(data => {
        this.jsonObj = data;
        resolve();
      }, err => {
        console.log(err)
        reject();
      });
    });
  }

  getGroupsFromJson() {
    this.groups = [];
    this.jsonObj.groups.forEach(group => {
      let questions: Question[] = [];
      group.questions.forEach(questionJson => {
        let answers: Answer[] = [];
        questionJson.answers.forEach(answerJson => {
          if (questionJson.inputType === 'text') {
            let answer: TextAnswer = new TextAnswer(answerJson.label);
            answers.push(answer);
          }
          else if (questionJson.inputType === 'radio') {
            let answer: RadioAnswer = new RadioAnswer(answerJson.label)
            let subAnswers: RadioAnswer[] = [];
            let subSubAnswers: RadioAnswer[] = [];
            if (!answerJson.subAnswers) {
              answers.push(answer);
            } else {
              answerJson.subAnswers.forEach(subAnswer => {
                if (!subAnswer.subAnswers) {
                  subAnswers.push(new RadioAnswer(subAnswer.label));
                } else {
                  subAnswer.subAnswers.forEach(subSubAnswer => {
                    subSubAnswers.push(new RadioAnswer(subSubAnswer.label));
                  });
                }
              });
              answer.subAnswers = subAnswers;
              answer.subSubAnswers = subSubAnswers;
              answers.push(answer);
            }
          }
          else if (questionJson.inputType === 'checkbox') {
            let answer: Answer = new CheckboxAnswer(answerJson.label);
            answers.push(answer);
          }
        });

        let question = new Question(questionJson.question, questionJson.inputType, answers)
        questions.push(question);
      });
      let gr = new Group(group.groupTitle, group.groupDescription, questions)
      this.groups.push(gr);
    });
  }
  inability(i) {
    this.hideInability[i] = !this.hideInability[i];
  }

  death() {
    this.hideDeath = !this.hideDeath;
  }

  afterDeath() {
    this.hideAfterDeath = !this.hideAfterDeath;
  }
  askQuestions() {
    let myModal = this.modalCtrl.create(QuestionsPage, { groups: this.groups }, { enableBackdropDismiss: false });
    myModal.onDidDismiss(data => {
      if (typeof data !== 'undefined') {
        this.groups = data.groups;
      }
    })
    myModal.present();
  }
}


