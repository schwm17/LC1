
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Slides, ViewController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { Group } from "../Objects/Group";
import { TextAnswer } from "../Objects/AnswersType/TextAnswer";
import { RadioAnswer } from "../Objects/AnswersType/RadioAnswer";
import { CheckboxAnswer } from "../Objects/AnswersType/CheckboxAnswer";
import { Answer } from "../Objects/Answer";
import { Question } from "../Objects/Question";

@IonicPage()
@Component({
  selector: 'page-questions',
  templateUrl: 'questions.html',
})
export class QuestionsPage {
  @ViewChild(Slides) slides: Slides;

  radioAnswer: any;
  radioSubAnswer: any;
  jsonObj: any;
  groups: Group[];
  constructor(public navParams: NavParams, 
              public viewCtrl: ViewController,
              public keyboard: Keyboard) {
    let groups = this.navParams.get('groups');
    this.groups = groups;
  }

  ionViewDidEnter() {
    this.slides.centeredSlides = false;
  }

  dismiss() {
    let data = { groups: this.groups };
    this.viewCtrl.dismiss(data);
  }


  next() {
    this.radioAnswer = false;
    this.slides.slideNext(1000);
  }

  previous() {
    this.slides.slidePrev(1000);
  }

  close(){
    this.dismiss();
  }
  
  changeAnswer(question: Question, answer: Answer, textValue?: string, subAnswer?: Answer, subSubAnswer?: Answer) {
    if (answer instanceof TextAnswer) {
      if (textValue !== '' && typeof textValue !== 'undefined') {
        answer.value = textValue;
        question.addAnswerValue(answer);
      } else {
        question.deleteAnswerValue(answer);
      }
    } else if (answer instanceof RadioAnswer) {
      question.deleteAnswers();
      if (subAnswer && subSubAnswer) {
        question.addAnswerValue(answer);
        question.addAnswerValue(subAnswer);
        question.addSubAnswerValue(subSubAnswer);
      } else if (subAnswer && !subSubAnswer) {
        question.addAnswerValue(answer);
        question.addSubAnswerValue(subAnswer);
      } else {
        question.addAnswerValue(answer);
      }
    } else if (answer instanceof CheckboxAnswer) {
      question.addAnswerValue(answer);
    }
  }
}
