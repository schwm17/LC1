import { AlertController, App } from 'ionic-angular';
import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

export interface ConfirmOpt {
    title?: string;
    message?: string;
    okText?: string;
    cancelText?: string;
    disableCancel?: boolean;
}

/**
 * A service to present often used modals/popups to the user.
 *
 * Note: Ionic defines 'modals' as something like a full-screen slide-in
 * dialog window. This service, however, is more general than that and
 * modal is used because of how the term is used in jquery ui etc.
 */
@Injectable()
export class ModalService {
	leaving = false;

    constructor(private alertCtrl: AlertController,
    	private translateService: TranslateService,
    	private app: App) {
        window['modal'] = this;
    }

    leaveConfirm(show:boolean, opt: ConfirmOpt, onLeave = () => {}){
    	if (!this.leaving && show) {
            this.confirm(opt).then(yes => {
                if(yes){
                	this.leaving = true;
                	this.app.getActiveNav().pop();
                }
            })
            return false;
        } else {
        	this.leaving = false;
        	onLeave();
            return true;
        }
    }

    /**
     * Present the user with a modal that offers two buttons for confirming
     * some action or for declining some action. If the user confirms the action
     * the wrapped boolean will be true, otherwise false.
     * @param opt Options to specify the content of the dialog.
     * @returns {Promise<boolean>} What the user chose
     */
    confirm(opt: ConfirmOpt): Promise<boolean> {
        // TODO: Localization
        return new Promise((resolve, reject) => {
        	this.translateService.get(['YES', 'CANCEL']).subscribe((trans) => {
	            let okText = opt.okText || trans['YES'];
	            let cancelText = opt.cancelText || trans['CANCEL'];

                let buttons = []
                if(opt.disableCancel !== true){
                    buttons.push({
                        text: cancelText,
                        handler: () => {
                            resolve(false);
                        }
                    })
                }

                buttons.push({
                    text: okText,
                    handler: () => {
                        resolve(true);
                    }
                })

	            let modal = this.alertCtrl.create({
	                title: opt.title,
	                message: opt.message,
	                buttons: buttons
	            });
	            modal.present();
	        })
        });
    }

    /**
     * Produce an alert screen that simply has an OK button that is used
     * to dismiss the dialog.
     * @param message The main text to display
     * @param title An optional title
     */
    alert(message: string, title: string = '') {
    	this.translateService.get(['OK']).subscribe((trans) => {
	        this.alertCtrl.create({
	            title: title,
	            message: message,
	            buttons: [trans['OK']]
	        }).present();
	    })
    }

    error(message: string) {
        this.alert(message)
    }

    // TODO: translate those sentances
    showNoInternet(){
    	this.translateService.get(['NO.INTERNET.TITLE', 'NO.INTERNET.TEXT']).subscribe((trans) => {
    		this.alert(trans['NO.INTERNET.TEXT'], trans['NO.INTERNET.TITLE']);
    	})
    }

}
