import { Injectable, EventEmitter } from '@angular/core';
import { InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import 'rxjs/add/operator/map';


@Injectable()
/**
 * Service to manage the alert this.popups
 */
export class InBrowserBrowser{
  /**
   * Opens a URL in a new InAppBrowser instance, the current browser instance, or the system browser.
   * @param  url {string}     The URL to load.
   * @param  target {string}  The target in which to load the URL, an optional parameter that defaults to _self.
   * @param  options {string} Options for the InAppBrowser. Optional, defaulting to: location=yes.
   *                 The options string must not contain any blank space, and each feature's
   *                 name/value pairs must be separated by a comma. Feature names are case insensitive.
   * @returns {InAppBrowserObject}
   */
  create(url: string, target?: string, options?: string | InAppBrowserOptions): InBrowserBrowserObject {
    return new InBrowserBrowserObject(url, target, options);
  }
}

export interface InBrowserBrowserEvent {
  /** the eventname, either loadstart, loadstop, loaderror, or exit. */
  type: string;
  /** the URL that was loaded. */
  url: string;
  /** the error code, only in the case of loaderror. */
  code: number;
  /** the error message, only in the case of loaderror. */
  message: string;
}

export class InBrowserBrowserObject{
	browserWrap: any;
	popup: any;

	private _events: {[name:string]: EventEmitter<any>} = {};

	constructor(url: string, target?: string, options?: string | InAppBrowserOptions) {
		if (options && typeof options !== 'string') {
			options = Object.keys(options).map((key: string) => `${key}=${(<InAppBrowserOptions>options)[key]}`).join(',');
		}

		this._open(url, target, options.toString())
	}

	private _open(url: string, target: string, options: string):void {
		let me = this;
        if (target === "_self" || !target) {
            window.location.assign(url);
        } else if (target === "_system") {
            window.open(url, "_blank");
        } else {
            // "_blank" or anything else
            if (!this.browserWrap) {
                this.browserWrap = document.createElement("div");
                this.browserWrap.style.position = "absolute";
                this.browserWrap.style.top = "0";
                this.browserWrap.style.left = "0";
                this.browserWrap.style.boxSizing = "border-box";
                this.browserWrap.style.borderWidth = "40px";
                this.browserWrap.style.width = "100vw";
                this.browserWrap.style.height = "100vh";
                this.browserWrap.style.borderStyle = "solid";
                this.browserWrap.style.borderColor = "rgba(0,0,0,0.25)";

                this.browserWrap.onclick = function () {
                    setTimeout(function () {
                        this.close();
                    }, 0);
                };

                document.body.appendChild(this.browserWrap);
            }

            if (options.indexOf("hidden=yes") !== -1) {
                this.browserWrap.style.display = "none";
            }

            this.popup = document.createElement("iframe");
            this.popup.style.borderWidth = "0px";
            this.popup.style.width = "100%";

            this.browserWrap.appendChild(this.popup);

            if (options.indexOf("location=yes") !== -1 || options.indexOf("location") === -1) {
                this.popup.style.height = "calc(100% - 60px)";
                this.popup.style.marginBottom = "-4px";

                let navigationButtonsDiv = document.createElement("div");
                navigationButtonsDiv.style.height = "60px";
                navigationButtonsDiv.style.backgroundColor = "#404040";
                navigationButtonsDiv.style.zIndex = "999";
                navigationButtonsDiv.onclick = function (e) {
                    e.cancelBubble = true;
                };

                let navigationButtonsDivInner = document.createElement("div");
                navigationButtonsDivInner.style.paddingTop = "10px";
                navigationButtonsDivInner.style.height = "50px";
                navigationButtonsDivInner.style.width = "160px";
                navigationButtonsDivInner.style.margin = "0 auto";
                navigationButtonsDivInner.style.backgroundColor = "#404040";
                navigationButtonsDivInner.style.zIndex = "999";
                navigationButtonsDivInner.onclick = function (e) {
                    e.cancelBubble = true;
                };


                let backButton = document.createElement("button");
                backButton.style.width = "40px";
                backButton.style.height = "40px";
                backButton.style.borderRadius = "40px";

                backButton.innerHTML = "←";
                backButton.addEventListener("click", function (e) {
                    if (me.popup.canGoBack)
                        me.popup.goBack();
                });

                let forwardButton = document.createElement("button");
                forwardButton.style.marginLeft = "20px";
                forwardButton.style.width = "40px";
                forwardButton.style.height = "40px";
                forwardButton.style.borderRadius = "40px";

                forwardButton.innerHTML = "→";
                forwardButton.addEventListener("click", function (e) {
                    if (me.popup.canGoForward)
                        me.popup.goForward();
                });

                let closeButton = document.createElement("button");
                closeButton.style.marginLeft = "20px";
                closeButton.style.width = "40px";
                closeButton.style.height = "40px";
                closeButton.style.borderRadius = "40px";

                closeButton.innerHTML = "✖";
                closeButton.addEventListener("click", function (e) {
                    setTimeout(function () {
                        this.close();
                    }, 0);
                });

                // iframe navigation is not yet supported
                backButton.disabled = true;
                forwardButton.disabled = true;

                navigationButtonsDivInner.appendChild(backButton);
                navigationButtonsDivInner.appendChild(forwardButton);
                navigationButtonsDivInner.appendChild(closeButton);
                navigationButtonsDiv.appendChild(navigationButtonsDivInner);

                this.browserWrap.appendChild(navigationButtonsDiv);
            } else {
                this.popup.style.height = "100%";
            }

            // start listening for navigation events
            let onError = function () {
            	if(me.popup)
		        	me._handleEvent("loaderror", this.contentWindow.location.href);
		    };

		    this.popup.addEventListener("load", function () {
		    	if(me.popup)
		        	me._handleEvent("loadstart", this.contentWindow.location.href);
		    });

		    this.popup.addEventListener("load", function () {
		    	if(me.popup)
		        	me._handleEvent("loadstop", this.contentWindow.location.href);
		    });

		    this.popup.addEventListener("error", onError);
		    this.popup.addEventListener("abort", onError);
            this.popup.src = url;
        }
	}

	private _handleEvent(name: string, url: any, code?: number, message?:string): void {

		this._getEvent(name).emit({type: name, url: url, code: code, message: message});
	}

	private _getEvent(name: string): EventEmitter<InBrowserBrowserEvent>{
		let event = this._events[name];

        if (event) {
            return event;
        }

        event = new EventEmitter<InBrowserBrowserEvent>();
        this._events[name] = event;
        return event;
	}

	private _addEventListener(name: string, callback: any): void {
		this._getEvent(name).subscribe(callback);
	}

	private _removeEventListener(name: string, callback: any): void {
		return;
	}

	  /**
   * Displays an InAppBrowser window that was opened hidden. Calling this has no effect
   * if the InAppBrowser was already visible.
   */
  show(): void {
	if (this.browserWrap) {
        this.browserWrap.style.display = "block";
    }
  }

  /**
   * Closes the InAppBrowser window.
   */
  close(): void {
	if (this.browserWrap) {
        this.browserWrap.parentNode.removeChild(this.browserWrap);
        this.browserWrap = null;
        this.popup = null;
    }
  }

  /**
   * Hides an InAppBrowser window that is currently shown. Calling this has no effect
   * if the InAppBrowser was already hidden.
   */
  hide(): void { }

  /**
   * Injects JavaScript code into the InAppBrowser window.
   * @param script {Object} Details of the script to run, specifying either a file or code key.
   * @returns {Promise<any>}
   */
  executeScript(script: { file?: string, code?: string }): Promise<any> { return; }

  /**
   * Injects CSS into the InAppBrowser window.
   * @param css {Object} Details of the script to run, specifying either a file or code key.
   * @returns {Promise<any>}
   */
  insertCSS(css: { file?: string, code?: string }): Promise<any> { return; }

  /**
   * A method that allows you to listen to events happening in the browser.
   * @param event {string} Name of the event
   * @returns {Observable<InBrowserBrowserEvent>} Returns back an observable that will listen to the event on subscribe, and will stop listening to the event on unsubscribe.
   */
  on(event: string): Observable<InBrowserBrowserEvent> {
    return new Observable<InBrowserBrowserEvent>((observer: Observer<InBrowserBrowserEvent>) => {
      this._addEventListener(event, observer.next.bind(observer));
      return () => this._removeEventListener(event, observer.next.bind(observer));
    });
  }
}
