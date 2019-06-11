
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Slides, ViewController, Alert, AlertController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { Group } from "../Objects/Group";
import { TextAnswer } from "../Objects/AnswersType/TextAnswer";
import { RadioAnswer } from "../Objects/AnswersType/RadioAnswer";
import { CheckboxAnswer } from "../Objects/AnswersType/CheckboxAnswer";
import { Answer } from "../Objects/Answer";
import { Question } from "../Objects/Question";

import { Resource, QuestionnaireResponse, QUESTIONNAIRERESPONSESTATUS } from 'Midata';
import { MidataService } from '../../../services/MidataService';


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
              public keyboard: Keyboard, 
              public alertCtrl: AlertController,
              public midataConnectionService: MidataService) {
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
      let indexOfAnswer :number;
      let answerWasAlreadyToggled :boolean = false;  
      for (let i = 0; i < question.answerValue.length; i++) {
        const element = question.answerValue[i];
        if(answer === element){
          answerWasAlreadyToggled = true;
          indexOfAnswer = i;
          break;
        }
      }
      if(answerWasAlreadyToggled){
        question.answerValue.splice(indexOfAnswer, 1);
      } else {
        question.addAnswerValue(answer);
      }
      
    }
  }

  sendAnswers(){    
    let questionnaireResponse = new QuestionnaireResponse(this.formatDate(new Date()), QUESTIONNAIRERESPONSESTATUS.completed);
   
    this.groups.forEach(element => {
      let item = [];
      element.questions.forEach(element => {     
        var question = {
          "text": element.label,
          "answer": []
        }        
        element.answerValue.forEach(element => {  
          if(element instanceof TextAnswer){
            question.answer.push({"valueString": element.value});
          }
          if(element instanceof RadioAnswer){
            question.answer.push({"valueString": element.label});
          } 
          if(element instanceof CheckboxAnswer){
            question.answer.push({"valueString": element.label});
          }   
        });  
        item.push(question);      
      });
      questionnaireResponse.addProperty("item", item);
    });
    this.save(questionnaireResponse);
    this.dismiss();
  }


  private formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate()
        

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    
}

  private save(resource: Resource): void {
     this.midataConnectionService.save(resource)
    .then(result => {
      let alert :Alert = this.alertCtrl.create({
        title: "Datenübertragung",
        message: "Ihre Daten wurden erfolgreich gespeichert.",
        buttons: [
          {
            text: "Weiter",
            handler: data => {
              alert.dismiss();
            }
          }
        ]
      });
      alert.present();
    })
    .catch(error => console.log(error));
    
  };
}
