
import { Question } from '../advance-directives/Objects/Question';
import { Group } from '../advance-directives/Objects/Group';
import { Component } from '@angular/core';
import { IonicPage, ModalController } from 'ionic-angular';
import { HttpClient } from "@angular/common/http";
import { Answer } from "../advance-directives/Objects/Answer";
import { QuestionsPage } from "../advance-directives/QuestionsModal/questions";
import { TextAnswer } from "../advance-directives/Objects/AnswersType/TextAnswer";
import { RadioAnswer } from "../advance-directives/Objects/AnswersType/RadioAnswer";
import { CheckboxAnswer } from "../advance-directives/Objects/AnswersType/CheckboxAnswer";


@IonicPage()
@Component({
  selector: 'page-cofhi',
  templateUrl: 'cofhi.html'
})
export class CofhiPage {

  groups: Group[]; // Array that will contain all Groups, which themselve contain all the Questions of the Questionnaire.
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
      this.httpClient.get("assets/cofhiQuestions.json").subscribe(data => {
        this.jsonObj = data;
        resolve();
      }, err => {
        console.log(err)
        reject();
      });
    });
  }

  getGroupsFromJson() {

    // Very long and complicated Method that converts the JSON into a multidimensional array...



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
