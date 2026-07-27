var app = {
	launchpadBaseUrl: "https://188b143btrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f",
	defaultHash: "#Shell-home",
	topicName: "BTB",
	notificationChannels: [
		{
			id: "btb_super_goal_v1",
			name: "BTB Super Kupon",
			description: "Super kupon gol ve stadyum bildirimleri",
			sound: "btb_super_goal"
		},
		{
			id: "btb_general_whistle_v1",
			name: "BTB Genel",
			description: "Toto, oran ve diğer BTB bildirimleri",
			sound: "btb_referee_whistle"
		}
	],
	legacyNotificationChannelIds: ["btb_alerts_v1"],
	retryDelays: [2000, 5000, 15000, 30000],
	browserCloseDelay: 300,
	resumeProbeDelay: 1200,
	resumeHardRefreshAfter: 30000,

	relaunchTimer: null,
	restoreTimer: null,
	resumeProbeTimer: null,
	waitingBackPressedOnce: false,
	retryAttempt: 0,
	pendingLaunchUrl: null,
	pausedAt: 0,

	browserRef: null,
	backHandler: null,
	firebaseMessageHandlerRegistered: false,
	widgetListenerRegistered: false,

	initialize: function () {
		this.backHandler = this.onBackButton.bind(this);

		document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
	},

	onDeviceReady: function () {
		this.bindRetryButton();
		this.registerWidget();
		this.registerFirebase();
		this.enableCustomBack();
		this.registerNetworkHandlers();
		this.registerLifecycleHandlers();
		this.startApp(this.pendingLaunchUrl || undefined);
	},

	bindRetryButton: function () {
		var retryButton = document.getElementById("retryButton");
		if (!retryButton) {
			return;
		}

		retryButton.addEventListener("click", this.retryNow.bind(this), false);
	},

	enableCustomBack: function () {
		document.removeEventListener("backbutton", this.backHandler, false);
		document.addEventListener("backbutton", this.backHandler, false);
	},

	disableCustomBack: function () {
		document.removeEventListener("backbutton", this.backHandler, false);
	},

	getFirebaseMessaging: function () {
		return window.FirebasexMessaging || window.FirebasePlugin || null;
	},

	getWidgetBridge: function () {
		return typeof window !== "undefined" && window.BtbWidget ? window.BtbWidget : null;
	},

	openNotificationSettings: function () {
		var widget = this.getWidgetBridge();

		if (!widget || typeof widget.openNotificationSettings !== "function") {
			return false;
		}

		widget.openNotificationSettings(function () {
			console.log("BTB notification settings opened");
		}, function (error) {
			console.error("BTB notification settings error:", error);
		});
		return true;
	},

	openBilyonerHome: function () {
		var widget = this.getWidgetBridge();
		var self = this;

		if (!widget || typeof widget.openBilyoner !== "function") {
			return this.openSystemUrl("https://www.bilyoner.com/");
		}

		widget.openBilyoner(function () {
			console.log("Bilyoner opened");
		}, function (error) {
			console.error("Bilyoner launch error:", error);
			self.openSystemUrl("https://www.bilyoner.com/");
		});
		return true;
	},

	handleBrowserMessage: function (event) {
		var data = event && event.data;

		if (typeof data === "string") {
			try {
				data = JSON.parse(data);
			} catch (error) {
				return false;
			}
		}

		if (!data) {
			return false;
		}

		if (data.action === "openNotificationSettings") {
			return this.openNotificationSettings();
		}

		if (data.action === "navigateLaunchpad") {
			return this.navigateLaunchpadRoute(data.route);
		}

		if (data.action === "openBilyoner") {
			return this.openBilyonerHome();
		}

		return false;
	},

	navigateLaunchpadRoute: function (route) {
		var normalizedRoute = String(route || "").toLowerCase();
		var browser = this.browserRef;
		var labels = {
			btb: "BTB",
			super: "Super Log",
			toto: "Toto"
		};

		if (!labels[normalizedRoute]) {
			return false;
		}

		var targetUrl = this.getRouteUrl(normalizedRoute);
		this.pendingLaunchUrl = targetUrl;
		this.retryAttempt = 0;

		if (!browser || typeof browser.executeScript !== "function") {
			this.startApp(targetUrl, { immediate: true });
			return true;
		}

		var code = [
			"(function(){",
			"var old=document.getElementById('btb-mobile-route-splash');",
			"if(old){old.remove();}",
			"var overlay=document.createElement('div');",
			"overlay.id='btb-mobile-route-splash';",
			"overlay.setAttribute('role','status');",
			"overlay.setAttribute('aria-live','polite');",
			"overlay.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,11,22,.88);z-index:2147483647;backdrop-filter:blur(2px);transition:opacity .2s ease;';",
			"var card=document.createElement('div');",
			"card.style.cssText='min-width:150px;padding:20px 24px;border:1px solid rgba(21,151,229,.55);border-radius:20px;background:#061525;color:#fff;box-shadow:0 10px 35px rgba(0,0,0,.45);text-align:center;font:600 15px Arial,sans-serif;';",
			"var ball=document.createElement('div');",
			"ball.innerHTML='&#9917;';",
			"ball.style.cssText='font-size:34px;line-height:42px;animation:btbRouteBall .75s ease-in-out infinite alternate;';",
			"var text=document.createElement('div');",
			"text.textContent=" + JSON.stringify(labels[normalizedRoute] + " yukleniyor...") + ";",
			"var style=document.createElement('style');",
			"style.textContent='@keyframes btbRouteBall{from{transform:translateY(0) rotate(-8deg)}to{transform:translateY(-7px) rotate(8deg)}}';",
			"card.appendChild(ball);card.appendChild(text);overlay.appendChild(style);overlay.appendChild(card);document.body.appendChild(overlay);",
			"setTimeout(function(){window.location.href=" + JSON.stringify(targetUrl) + ";},180);",
			"setTimeout(function(){if(overlay&&overlay.parentNode){overlay.style.opacity='0';setTimeout(function(){if(overlay.parentNode){overlay.remove();}},220);}},1600);",
			"})();"
		].join("");

		try {
			browser.executeScript({ code: code });
		} catch (error) {
			console.error("Launchpad quick navigation error:", error);
			this.startApp(targetUrl, { immediate: true });
		}

		return true;
	},

	enforceMobileTouchDensity: function (browser) {
		if (!browser || typeof browser.executeScript !== "function") {
			return false;
		}

		var code = [
			"(function(){",
			"var observerKey='__btbMobileDensityObserver';",
			"var listenersKey='__btbMobileDensityListeners';",
			"var intervalKey='__btbMobileDensityInterval';",
			"var timersKey='__btbMobileDensityTimers';",
			"var frameHandlerKey='__btbMobileDensityLoadHandler';",
			"var stateKey='__btbMobileDensityState';",
			"var shareListenerKey='__btbMobileShareActionListener';",
			"function normalizeElement(element,ownerDocument){",
			"if(!element||element.nodeType!==1||!element.classList){return;}",
			"var isRoot=element===ownerDocument.documentElement||element===ownerDocument.body;",
			"var hasCompact=element.classList.contains('sapUiSizeCompact');",
			"var hasCondensed=element.classList.contains('sapUiSizeCondensed');",
			"var needsCozy=isRoot||hasCompact||hasCondensed;",
			"if(!needsCozy){return;}",
			"if(hasCompact){element.classList.remove('sapUiSizeCompact');}",
			"if(hasCondensed){element.classList.remove('sapUiSizeCondensed');}",
			"if(!element.classList.contains('sapUiSizeCozy')){element.classList.add('sapUiSizeCozy');}",
			"}",
			"function normalizeDocument(ownerDocument){",
			"if(!ownerDocument||!ownerDocument.documentElement){return;}",
			"normalizeElement(ownerDocument.documentElement,ownerDocument);",
			"normalizeElement(ownerDocument.body,ownerDocument);",
			"if(typeof ownerDocument.querySelectorAll==='function'){",
			"Array.prototype.forEach.call(ownerDocument.querySelectorAll('.sapUiSizeCompact,.sapUiSizeCondensed'),function(element){normalizeElement(element,ownerDocument);});",
			"}",
			"if(ownerDocument.body&&ownerDocument.body.getAttribute('data-btb-mobile-density')!=='cozy'){ownerDocument.body.setAttribute('data-btb-mobile-density','cozy');}",
			"}",
			"function isShareActionLabel(value){",
			"var label=String(value||'').replace(/\\s+/g,' ').trim().toLowerCase();",
			"return label==='share'||label==='share menu'||label==='paylaş'||label==='paylaş menüsü';",
			"}",
			"function isShareActionId(value){",
			"var id=String(value||'');",
			"return /(^|[:_\\-])share(button|menu)?($|[:_\\-])/i.test(id)||/fe::share/i.test(id)||/template::share/i.test(id);",
			"}",
			"function hideShareActions(ownerDocument){",
			"if(!ownerDocument||typeof ownerDocument.querySelectorAll!=='function'){return 0;}",
			"var ownerWindow=ownerDocument.defaultView;",
			"var hidden=0;",
			"var selector='button,[role=\"button\"]';",
			"Array.prototype.forEach.call(ownerDocument.querySelectorAll(selector),function(candidate){",
			"if(!candidate||!candidate.style){return;}",
			"var label=(candidate.getAttribute&&candidate.getAttribute('aria-label'))||(candidate.getAttribute&&candidate.getAttribute('title'))||candidate.textContent;",
			"var controlNode=typeof candidate.closest==='function'?candidate.closest('[data-sap-ui]'):null;",
			"var controlId=controlNode&&controlNode.id?controlNode.id:candidate.id;",
			"if(!isShareActionLabel(label)&&!isShareActionId(controlId)){return;}",
			"var hideTarget=controlNode&&controlNode.style?controlNode:candidate;",
			"try{",
			"var core=ownerWindow&&ownerWindow.sap&&ownerWindow.sap.ui&&ownerWindow.sap.ui.getCore?ownerWindow.sap.ui.getCore():null;",
			"var control=core&&controlId?core.byId(controlId):null;",
			"if(control&&typeof control.setVisible==='function'){control.setVisible(false);}",
			"}catch(ignore){}",
			"hideTarget.style.setProperty('display','none','important');",
			"hideTarget.setAttribute('aria-hidden','true');",
			"hideTarget.setAttribute('data-btb-mobile-hidden','share');",
			"hideTarget.setAttribute('tabindex','-1');",
			"hidden+=1;",
			"});",
			"return hidden;",
			"}",
			"function ensureShareSuppression(ownerDocument){",
			"if(!ownerDocument||ownerDocument[shareListenerKey]||typeof ownerDocument.addEventListener!=='function'){return;}",
			"var ownerWindow=ownerDocument.defaultView||window;",
			"var handler=function(){",
			"[40,180,420].forEach(function(delay){ownerWindow.setTimeout(function(){hideShareActions(ownerDocument);},delay);});",
			"};",
			"ownerDocument.addEventListener('click',handler,true);",
			"ownerDocument[shareListenerKey]=handler;",
			"}",
			"function ensureDocumentObserver(ownerDocument){",
			"if(!ownerDocument||!ownerDocument.documentElement||ownerDocument[observerKey]){return;}",
			"var ownerWindow=ownerDocument.defaultView;",
			"var Observer=(ownerWindow&&ownerWindow.MutationObserver)||window.MutationObserver;",
			"if(typeof Observer!=='function'){return;}",
			"var observer=new Observer(function(records){",
			"records.forEach(function(record){if(record.type==='attributes'){normalizeElement(record.target,ownerDocument);}});",
			"});",
			"observer.observe(ownerDocument.documentElement,{attributes:true,attributeFilter:['class'],subtree:true});",
			"ownerDocument[observerKey]=observer;",
			"}",
			"var reapply;",
			"function bindFrame(frame){",
			"if(!frame||frame[frameHandlerKey]||typeof frame.addEventListener!=='function'){return;}",
			"var handler=function(){if(reapply){reapply();}};",
			"frame.addEventListener('load',handler);",
			"frame[frameHandlerKey]=handler;",
			"}",
			"function collectDocuments(){",
			"var documents=[document];",
			"var accessibleFrames=0;",
			"var blockedFrames=0;",
			"if(typeof document.querySelectorAll==='function'){",
			"Array.prototype.forEach.call(document.querySelectorAll('iframe'),function(frame){",
			"bindFrame(frame);",
			"try{",
			"var frameDocument=frame.contentDocument||(frame.contentWindow&&frame.contentWindow.document);",
			"if(frameDocument&&frameDocument.documentElement){documents.push(frameDocument);accessibleFrames+=1;}",
			"}catch(error){blockedFrames+=1;}",
			"});",
			"}",
			"window[stateKey]={documents:documents.length,accessibleFrames:accessibleFrames,blockedFrames:blockedFrames,lastApplied:Date.now()};",
			"return documents;",
			"}",
			"function applyCozyDensity(){",
			"collectDocuments().forEach(function(ownerDocument){normalizeDocument(ownerDocument);ensureDocumentObserver(ownerDocument);ensureShareSuppression(ownerDocument);hideShareActions(ownerDocument);});",
			"}",
			"if(window[observerKey]&&typeof window[observerKey].disconnect==='function'){window[observerKey].disconnect();}",
			"window[observerKey]=null;",
			"var oldListeners=window[listenersKey];",
			"if(oldListeners){window.removeEventListener('pageshow',oldListeners.reapply);window.removeEventListener('hashchange',oldListeners.reapply);window.removeEventListener('popstate',oldListeners.reapply);}",
			"if(window[intervalKey]){window.clearInterval(window[intervalKey]);window[intervalKey]=null;}",
			"var oldTimers=window[timersKey]||[];",
			"oldTimers.forEach(function(timer){window.clearTimeout(timer);});",
			"window[timersKey]=[];",
			"applyCozyDensity();",
			"var scheduleApply=function(delay){var timer=window.setTimeout(function(){applyCozyDensity();},delay);window[timersKey].push(timer);};",
			"reapply=function(){",
			"window[timersKey].forEach(function(timer){window.clearTimeout(timer);});",
			"window[timersKey]=[];",
			"applyCozyDensity();",
			"if(window.requestAnimationFrame){window.requestAnimationFrame(applyCozyDensity);}",
			"[120,500,1500].forEach(scheduleApply);",
			"};",
			"window.addEventListener('pageshow',reapply);",
			"window.addEventListener('hashchange',reapply);",
			"window.addEventListener('popstate',reapply);",
			"window[listenersKey]={reapply:reapply};",
			"window[intervalKey]=window.setInterval(function(){if(!document.hidden){applyCozyDensity();}},1500);",
			"})();"
		].join("");

		browser.executeScript({ code: code });
		return true;
	},

	enableMobileAutoHideShell: function (browser) {
		if (!browser || typeof browser.executeScript !== "function") {
			return false;
		}

		var code = [
			"(function(){",
			"var styleId='btb-mobile-shell-focus-style';",
			"var revealId='btb-mobile-shell-reveal';",
			"var timerKey='__btbMobileShellHideTimer';",
			"var listenersKey='__btbMobileShellListeners';",
			"var stateKey='__btbMobileShellState';",
			"var requestedKey='__btbMobileShellRequestedVisible';",
			"var controlKey='__btbMobileSetShellVisible';",
			"function updateState(hidden,supported){",
			"window[stateKey]={hidden:hidden,supported:supported,requestedVisible:window[requestedKey]===true,lastAction:Date.now()};",
			"if(document.body){document.body.classList.toggle('btb-mobile-shell-hidden',hidden&&supported);}",
			"}",
			"function useRenderer(visible,renderer){",
			"if(!renderer||typeof renderer.setHeaderVisibility!=='function'){updateState(false,false);return false;}",
			"renderer.setHeaderVisibility(visible,true);",
			"updateState(!visible,true);",
			"return true;",
			"}",
			"function setShellVisible(visible){",
			"try{",
			"var container=window.sap&&window.sap.ushell&&window.sap.ushell.Container;",
			"if(!container||typeof container.getRenderer!=='function'){updateState(false,false);return false;}",
			"var renderer=container.getRenderer('fiori2');",
			"if(renderer&&typeof renderer.then==='function'){renderer.then(function(resolved){useRenderer(visible,resolved);},function(){updateState(false,false);});return true;}",
			"return useRenderer(visible,renderer);",
			"}catch(error){updateState(false,false);return false;}",
			"}",
			"function clearHideTimer(){if(window[timerKey]){window.clearTimeout(window[timerKey]);window[timerKey]=null;}}",
			"function applyRequested(){return setShellVisible(window[requestedKey]===true);}",
			"function requestShell(visible){window[requestedKey]=visible===true;clearHideTimer();return applyRequested();}",
			"var oldListeners=window[listenersKey];",
			"if(oldListeners){if(oldListeners.pointerDown){document.removeEventListener('pointerdown',oldListeners.pointerDown,true);}if(oldListeners.keyDown){document.removeEventListener('keydown',oldListeners.keyDown,true);}if(oldListeners.routeChange){window.removeEventListener('hashchange',oldListeners.routeChange);window.removeEventListener('pageshow',oldListeners.routeChange);}if(oldListeners.visibilityChange){document.removeEventListener('visibilitychange',oldListeners.visibilityChange);}}",
			"clearHideTimer();",
			"var oldStyle=document.getElementById(styleId);if(oldStyle){oldStyle.remove();}",
			"var reveal=document.getElementById(revealId);if(reveal){reveal.remove();}",
			"var routeChange=function(){window.setTimeout(applyRequested,0);window.setTimeout(applyRequested,400);};",
			"var visibilityChange=function(){if(!document.hidden){applyRequested();}};",
			"window.addEventListener('hashchange',routeChange);",
			"window.addEventListener('pageshow',routeChange);",
			"document.addEventListener('visibilitychange',visibilityChange);",
			"window[listenersKey]={routeChange:routeChange,visibilityChange:visibilityChange};",
			"window[controlKey]=requestShell;",
			"var quickNav=document.getElementById('btb-mobile-quick-nav');",
			"window[requestedKey]=Boolean(quickNav&&quickNav.classList.contains('btb-open'));",
			"applyRequested();",
			"window.setTimeout(applyRequested,400);",
			"window.setTimeout(applyRequested,1200);",
			"})();"
		].join("");

		browser.executeScript({ code: code });
		return true;
	},

	injectMobileControls: function (browser) {
		if (!browser || typeof browser.executeScript !== "function") {
			return false;
		}

		var code = [
			"(function(){",
			"if(document.getElementById('btb-mobile-controls-style')){return;}",
			"var style=document.createElement('style');",
			"style.id='btb-mobile-controls-style';",
			"style.textContent=" + JSON.stringify([
				"#btb-mobile-quick-toggle,.btb-mobile-quick-button{width:42px;height:42px;border-radius:21px;border:1px solid #1597E5;background:#061525;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.3);font:700 17px/38px Arial,sans-serif;padding:0;opacity:.9;touch-action:none;user-select:none;-webkit-user-select:none;}",
				"#btb-mobile-quick-nav{position:fixed;left:14px;bottom:82px;z-index:2147483647;font-family:Arial,sans-serif;}",
				"#btb-mobile-quick-toggle{position:relative;z-index:2;font-size:20px;overflow:visible;transition:transform .2s ease,background .2s ease;}",
				".btb-mobile-ball-pet{position:relative;display:block;width:36px;height:36px;margin:1px auto;pointer-events:none;line-height:1;transform-origin:50% 78%;will-change:transform;animation:btbBallPetIdle 4.8s ease-in-out infinite;}",
				".btb-mobile-mascot-ball{position:absolute;left:2px;top:1px;width:30px;height:30px;border:2px solid #56c8ff;border-radius:50%;background:radial-gradient(circle at 50% 38%,#fff 0,#eef9fd 58%,#b9e4f4 100%);z-index:2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));transition:background .25s ease,transform .25s ease;}",
				".btb-mobile-mascot-ball:before,.btb-mobile-mascot-ball:after{content:'';position:absolute;top:20px;width:5px;height:3px;border-radius:50%;background:rgba(21,151,229,.25);opacity:0;transition:opacity .2s ease}",
				".btb-mobile-mascot-ball:before{left:4px}.btb-mobile-mascot-ball:after{right:4px}",
				".btb-mobile-mascot-eye{position:absolute;top:8px;width:5px;height:6px;border-radius:50%;background:#061525;transform-origin:center;animation:btbMascotBlink 4.8s ease-in-out infinite;z-index:3;transition:all .22s ease;}",
				".btb-mobile-mascot-eye-left{left:6px}.btb-mobile-mascot-eye-right{right:6px}",
				".btb-mobile-mascot-eyebrow{position:absolute;top:5px;width:8px;height:2px;border-radius:2px;background:#061525;opacity:0;z-index:4;transition:all .2s ease}",
				".btb-mobile-mascot-eyebrow-left{left:4px}.btb-mobile-mascot-eyebrow-right{right:4px}",
				".btb-mobile-mascot-mouth{position:absolute;left:10px;top:17px;width:10px;height:5px;border:0;border-bottom:1.8px solid #061525;border-radius:0 0 10px 10px;z-index:3;transition:all .22s ease;}",
				".btb-mobile-mascot-limb{position:absolute;height:1.5px;width:7px;border-radius:4px;background:#56c8ff;box-shadow:0 0 2px rgba(86,200,255,.7);z-index:1;will-change:transform;}",
				".btb-mobile-mascot-leg-left{left:10px;top:30px;transform-origin:right center;transform:rotate(-55deg)}",
				".btb-mobile-mascot-leg-right{right:10px;top:30px;transform-origin:left center;transform:rotate(55deg)}",
				".btb-emotion-happy .btb-mobile-mascot-ball{background:radial-gradient(circle at 50% 38%,#fff 0,#e8fbf5 58%,#9ee5cf 100%);transform:scale(1.04)}",
				".btb-emotion-happy .btb-mobile-mascot-ball:before,.btb-emotion-happy .btb-mobile-mascot-ball:after{opacity:1}",
				".btb-emotion-happy .btb-mobile-mascot-eye{top:9px;height:4px;transform:scaleY(.72)}",
				".btb-emotion-happy .btb-mobile-mascot-mouth{left:7px;top:15px;width:16px;height:9px;border-bottom-width:2px}",
				".btb-emotion-bored .btb-mobile-mascot-ball{background:radial-gradient(circle at 50% 38%,#fff 0,#f4f5f6 58%,#cbd5dc 100%)}",
				".btb-emotion-bored .btb-mobile-mascot-eye{top:11px;height:2px;border-radius:3px;animation:none}",
				".btb-emotion-bored .btb-mobile-mascot-mouth{left:12px;top:19px;width:6px;height:4px;border:1.5px solid #607382;border-radius:50%}",
				".btb-emotion-angry .btb-mobile-mascot-ball{background:radial-gradient(circle at 50% 38%,#fff 0,#ffeceb 58%,#ffaaa3 100%);animation:btbMascotAngryShake .34s ease 2}",
				".btb-emotion-angry .btb-mobile-mascot-eye{top:10px;height:5px;animation:none}",
				".btb-emotion-angry .btb-mobile-mascot-eyebrow{opacity:1}",
				".btb-emotion-angry .btb-mobile-mascot-eyebrow-left{transform:rotate(20deg)}.btb-emotion-angry .btb-mobile-mascot-eyebrow-right{transform:rotate(-20deg)}",
				".btb-emotion-angry .btb-mobile-mascot-mouth{left:8px;top:20px;width:14px;height:6px;border:0;border-top:2px solid #061525;border-radius:10px 10px 0 0}",
				".btb-mobile-ball-pet:after{content:'✦';position:absolute;right:-2px;top:-5px;color:#56c8ff;font-size:10px;line-height:1;opacity:0;filter:drop-shadow(0 0 3px rgba(86,200,255,.8));animation:btbBallPetSpark 4.8s ease-in-out infinite;}",
				"#btb-mobile-mascot-greeting{position:absolute;left:50px;top:2px;min-width:34px;padding:6px 9px;border:1px solid rgba(86,200,255,.65);border-radius:12px;background:#fff;color:#061525;box-shadow:0 4px 14px rgba(0,0,0,.24);font:700 13px/16px Arial,sans-serif;text-align:center;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(4px) scale(.82);transform-origin:left center;animation:btbMascotHello 2.7s ease forwards;}",
				"#btb-mobile-mascot-greeting:before{content:'';position:absolute;left:-6px;top:11px;width:10px;height:10px;border-left:1px solid rgba(86,200,255,.65);border-bottom:1px solid rgba(86,200,255,.65);background:#fff;transform:rotate(45deg)}",
				"#btb-mobile-quick-nav.btb-right #btb-mobile-mascot-greeting{left:auto;right:50px;transform-origin:right center}",
				"#btb-mobile-quick-nav.btb-right #btb-mobile-mascot-greeting:before{left:auto;right:-6px;border-left:0;border-bottom:0;border-right:1px solid rgba(86,200,255,.65);border-top:1px solid rgba(86,200,255,.65)}",
				"#btb-mobile-quick-nav.btb-open #btb-mobile-quick-toggle{transform:rotate(30deg);background:#0c3750;}",
				"#btb-mobile-quick-nav.btb-open .btb-mobile-ball-pet{animation:btbBallPetHappy .58s cubic-bezier(.2,.8,.25,1.25) both;}",
				"#btb-mobile-quick-menu{position:absolute;left:0;display:flex;flex-direction:column;gap:8px;pointer-events:none;}",
				"#btb-mobile-quick-nav.btb-open #btb-mobile-quick-menu{pointer-events:auto;}",
				"#btb-mobile-quick-nav.btb-menu-up #btb-mobile-quick-menu{top:auto;bottom:52px;}",
				"#btb-mobile-quick-nav.btb-menu-down #btb-mobile-quick-menu{top:52px;bottom:auto;}",
				"#btb-mobile-quick-nav.btb-right #btb-mobile-quick-menu{left:auto;right:0;}",
				".btb-mobile-quick-item{display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(10px) scale(.9);pointer-events:none;transition:opacity .18s ease,transform .18s ease;}",
				"#btb-mobile-quick-nav.btb-right .btb-mobile-quick-item{flex-direction:row-reverse;}",
				"#btb-mobile-quick-nav.btb-open .btb-mobile-quick-item{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}",
				".btb-mobile-quick-label{padding:6px 9px;border-radius:12px;background:rgba(6,21,37,.94);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:12px;font-weight:700;white-space:nowrap;}",
				".btb-mobile-quick-button{flex:0 0 42px;font-size:19px;}",
				".btb-mobile-bilyoner-button{background:#0a4d2e;border-color:#55cb7d;}",
				".btb-mobile-refresh-button{width:36px;height:36px;flex-basis:36px;border-radius:18px;background:#0b3b57;border-color:#56c8ff;font-size:18px;line-height:32px;}",
				"#btb-mobile-notification-settings{background:#433407;border-color:#e7b522;}",
				"#btb-mobile-quick-toggle:active,.btb-mobile-quick-button:active{transform:scale(.92);}",
				"#btb-mobile-quick-nav.btb-dragging #btb-mobile-quick-toggle{opacity:1;transform:scale(1.08)!important;border-color:#56c8ff;box-shadow:0 0 0 4px rgba(21,151,229,.22),0 8px 22px rgba(0,0,0,.45);}",
				"#btb-mobile-quick-nav.btb-dragging .btb-mobile-ball-pet,#btb-mobile-quick-nav.btb-dragging .btb-mobile-ball-pet *{animation-play-state:paused!important;}",
				"@keyframes btbBallPetIdle{0%,62%,100%{transform:translateY(0) rotate(0) scale(1)}66%{transform:translateY(-3px) rotate(-8deg) scale(1.04)}70%{transform:translateY(0) rotate(7deg) scale(.98)}74%{transform:translateY(-1px) rotate(-4deg) scale(1.02)}78%{transform:translateY(0) rotate(0) scale(1)}}",
				"@keyframes btbBallPetHappy{0%{transform:translateY(0) rotate(0) scale(1)}35%{transform:translateY(-7px) rotate(-14deg) scale(1.12)}68%{transform:translateY(1px) rotate(12deg) scale(.94)}100%{transform:translateY(0) rotate(0) scale(1)}}",
				"@keyframes btbBallPetSpark{0%,61%,80%,100%{opacity:0;transform:scale(.4) rotate(0)}67%{opacity:1;transform:scale(1.15) rotate(35deg)}74%{opacity:.35;transform:scale(.75) rotate(70deg)}}",
				"@keyframes btbMascotBlink{0%,54%,58%,100%{transform:scaleY(1)}56%{transform:scaleY(.12)}}",
				"@keyframes btbMascotAngryShake{0%,100%{transform:translateX(0)}35%{transform:translateX(-1.5px) rotate(-2deg)}70%{transform:translateX(1.5px) rotate(2deg)}}",
				"@keyframes btbMascotHello{0%{opacity:0;transform:translateY(4px) scale(.82)}12%,76%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-2px) scale(.96)}}",
				"@keyframes btbMascotHelloReduced{0%,8%{opacity:0;transform:none}12%,78%{opacity:1;transform:none}100%{opacity:0;transform:none}}",
				"@media (prefers-reduced-motion:reduce){.btb-mobile-ball-pet,.btb-mobile-ball-pet:after,.btb-mobile-ball-pet *{animation:none!important}.btb-mobile-quick-item{transition:none}#btb-mobile-mascot-greeting{animation:btbMascotHelloReduced 2.7s linear forwards}}"
			].join("")) + ";",
			"document.head.appendChild(style);",
			"var nav=document.createElement('div');",
			"nav.id='btb-mobile-quick-nav';",
			"var menu=document.createElement('div');",
			"menu.id='btb-mobile-quick-menu';",
			"function syncShell(visible){var control=window.__btbMobileSetShellVisible;if(typeof control==='function'){control(visible===true);}}",
			"function closeQuickMenu(){nav.classList.remove('btb-open');toggle.setAttribute('aria-expanded','false');syncShell(false);}",
			"var items=[{action:'refreshLaunchpad',label:'Yenile',icon:'&#8635;',id:'btb-mobile-refresh',className:'btb-mobile-refresh-button'},{route:'btb',label:'BTB',icon:'&#9889;'},{route:'super',label:'Super Log',icon:'&#9733;'},{route:'toto',label:'Toto',icon:'&#9678;'},{action:'openBilyoner',label:'Bilyoner',icon:'&#128095;',className:'btb-mobile-bilyoner-button'},{action:'openNotificationSettings',label:'Bildirim Ayarları',icon:'&#128276;',id:'btb-mobile-notification-settings'}];",
			"items.forEach(function(item){",
			"var row=document.createElement('div');row.className='btb-mobile-quick-item';",
			"var appButton=document.createElement('button');appButton.type='button';appButton.className='btb-mobile-quick-button'+(item.className?' '+item.className:'');if(item.id){appButton.id=item.id;}appButton.innerHTML=item.icon;appButton.title=item.label;appButton.setAttribute('aria-label',item.label);",
			"var label=document.createElement('span');label.className='btb-mobile-quick-label';label.textContent=item.label;",
			"appButton.addEventListener('click',function(event){event.stopPropagation();closeQuickMenu();if(item.action==='refreshLaunchpad'){window.setTimeout(function(){window.location.reload();},80);return;}if(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.cordova_iab){var payload=item.route?{action:'navigateLaunchpad',route:item.route}:{action:item.action};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify(payload));}});",
			"row.appendChild(appButton);row.appendChild(label);menu.appendChild(row);",
			"});",
			"var toggle=document.createElement('button');",
			"toggle.id='btb-mobile-quick-toggle';toggle.type='button';toggle.innerHTML='<span class=\"btb-mobile-ball-pet\" aria-hidden=\"true\"><i class=\"btb-mobile-mascot-limb btb-mobile-mascot-leg-left\"></i><i class=\"btb-mobile-mascot-limb btb-mobile-mascot-leg-right\"></i><span class=\"btb-mobile-mascot-ball\"><i class=\"btb-mobile-mascot-eyebrow btb-mobile-mascot-eyebrow-left\"></i><i class=\"btb-mobile-mascot-eyebrow btb-mobile-mascot-eyebrow-right\"></i><i class=\"btb-mobile-mascot-eye btb-mobile-mascot-eye-left\"></i><i class=\"btb-mobile-mascot-eye btb-mobile-mascot-eye-right\"></i><i class=\"btb-mobile-mascot-mouth\"></i></span></span>';toggle.title='Hızlı geçiş - taşımak için basılı tutun';toggle.setAttribute('aria-label','BTB maskotu - hızlı uygulama geçişi');toggle.setAttribute('aria-expanded','false');",
			"var mascot=toggle.querySelector('.btb-mobile-ball-pet');var emotionClasses=['btb-emotion-happy','btb-emotion-bored','btb-emotion-angry'];var emotionTimer=null;var emotionResetTimer=null;var lastEmotion=-1;",
			"function clearMascotEmotion(){emotionClasses.forEach(function(className){mascot.classList.remove(className);});toggle.setAttribute('aria-label','BTB maskotu - hızlı uygulama geçişi');}",
			"function setMascotEmotion(name,duration){if(emotionResetTimer){clearTimeout(emotionResetTimer);}clearMascotEmotion();mascot.classList.add('btb-emotion-'+name);toggle.setAttribute('aria-label','BTB maskotu '+name+' - hızlı uygulama geçişi');emotionResetTimer=setTimeout(function(){emotionResetTimer=null;clearMascotEmotion();},duration||1800);}",
			"function scheduleMascotEmotion(){if(emotionTimer){clearTimeout(emotionTimer);}var delay=5000+Math.floor(Math.random()*5001);emotionTimer=setTimeout(function(){var index=Math.floor(Math.random()*emotionClasses.length);if(index===lastEmotion){index=(index+1)%emotionClasses.length;}lastEmotion=index;setMascotEmotion(emotionClasses[index].replace('btb-emotion-',''),1800);scheduleMascotEmotion();},delay);}",
			"toggle.addEventListener('click',function(event){event.stopPropagation();var open=nav.classList.toggle('btb-open');toggle.setAttribute('aria-expanded',String(open));syncShell(open);if(open){setMascotEmotion('happy',900);}});",
			"document.addEventListener('click',function(){closeQuickMenu();});",
			"nav.appendChild(menu);nav.appendChild(toggle);document.body.appendChild(nav);",
			"var greetingShown=false;try{greetingShown=window.sessionStorage.getItem('btb-mobile-mascot-greeting-v1')==='1';if(!greetingShown){window.sessionStorage.setItem('btb-mobile-mascot-greeting-v1','1');}}catch(ignore){}",
			"if(!greetingShown){var greeting=document.createElement('div');greeting.id='btb-mobile-mascot-greeting';greeting.setAttribute('role','status');greeting.setAttribute('aria-live','polite');greeting.textContent='Hi!';nav.appendChild(greeting);setTimeout(function(){if(greeting&&greeting.parentNode){greeting.remove();}},3000);}",
			"scheduleMascotEmotion();",
			"function updateMenuDirection(){var rect=nav.getBoundingClientRect();nav.classList.toggle('btb-menu-up',rect.top>window.innerHeight/2);nav.classList.toggle('btb-menu-down',rect.top<=window.innerHeight/2);nav.classList.toggle('btb-right',rect.left>window.innerWidth/2);}",
			"function makeDraggable(handle,movable,key,onPlaced,onDragStart){",
			"var holdTimer=null;var pointerId=null;var dragging=false;var suppressClick=false;var startX=0;var startY=0;var offsetX=0;var offsetY=0;",
			"function savePosition(left,top){try{window.localStorage.setItem(key,JSON.stringify({left:Math.round(left),top:Math.round(top)}));}catch(ignore){}}",
			"function place(left,top,save){var margin=8;var width=movable.offsetWidth||42;var height=movable.offsetHeight||42;var maxLeft=Math.max(margin,window.innerWidth-width-margin);var maxTop=Math.max(margin,window.innerHeight-height-margin);left=Math.min(maxLeft,Math.max(margin,left));top=Math.min(maxTop,Math.max(margin,top));movable.style.left=Math.round(left)+'px';movable.style.top=Math.round(top)+'px';movable.style.right='auto';movable.style.bottom='auto';if(save){savePosition(left,top);}if(onPlaced){onPlaced();}}",
			"function restore(){try{var saved=JSON.parse(window.localStorage.getItem(key)||'null');if(saved&&isFinite(saved.left)&&isFinite(saved.top)){place(Number(saved.left),Number(saved.top),false);return;}}catch(ignore){}if(onPlaced){onPlaced();}}",
			"function clearHold(){if(holdTimer){clearTimeout(holdTimer);holdTimer=null;}}",
			"function finish(event){clearHold();if(pointerId!==null&&event.pointerId!==pointerId){return;}if(dragging){event.preventDefault();var rect=movable.getBoundingClientRect();place(rect.left,rect.top,true);movable.classList.remove('btb-dragging');suppressClick=true;setTimeout(function(){suppressClick=false;},450);}dragging=false;pointerId=null;}",
			"handle.addEventListener('pointerdown',function(event){if(event.button!==undefined&&event.button!==0){return;}pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;var rect=movable.getBoundingClientRect();offsetX=event.clientX-rect.left;offsetY=event.clientY-rect.top;try{handle.setPointerCapture(pointerId);}catch(ignore){}clearHold();holdTimer=setTimeout(function(){dragging=true;suppressClick=true;movable.classList.add('btb-dragging');if(onDragStart){onDragStart();}if(window.navigator&&typeof window.navigator.vibrate==='function'){window.navigator.vibrate(24);}},380);});",
			"handle.addEventListener('pointermove',function(event){if(pointerId===null||event.pointerId!==pointerId){return;}if(!dragging){if(Math.abs(event.clientX-startX)>8||Math.abs(event.clientY-startY)>8){clearHold();}return;}event.preventDefault();place(event.clientX-offsetX,event.clientY-offsetY,false);});",
			"handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);handle.addEventListener('contextmenu',function(event){event.preventDefault();});",
			"handle.addEventListener('click',function(event){if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);",
			"restore();return{clamp:function(){var rect=movable.getBoundingClientRect();place(rect.left,rect.top,true);}};",
			"}",
			"var quickDrag=makeDraggable(toggle,nav,'btb-mobile-quick-position-v1',updateMenuDirection,function(){closeQuickMenu();});",
			"window.addEventListener('resize',function(){quickDrag.clamp();});",
			"})();"
		].join("");

		browser.executeScript({ code: code });
		return true;
	},

	registerWidget: function () {
		var widget = this.getWidgetBridge();

		if (
			this.widgetListenerRegistered ||
			!widget ||
			typeof widget.listen !== "function"
		) {
			return;
		}

		var self = this;
		this.widgetListenerRegistered = true;

		widget.listen(function (event) {
			self.openWidgetTarget(event);
		}, function (error) {
			console.error("Widget route listener error:", error);
		});
	},

	openWidgetTarget: function (event) {
		var route = event && event.route ? event.route : "home";
		var targetUrl = this.getMatchLaunchUrl(event) ||
			this.getTotoProgramLaunchUrl(event) ||
			this.getRouteUrl(route);

		this.retryAttempt = 0;
		this.startApp(targetUrl, { immediate: true });
	},

	updateWidgetFromMessage: function (message) {
		var widget = this.getWidgetBridge();
		var payload = this.getWidgetPayload(message);

		if (!payload || !widget || typeof widget.update !== "function") {
			return false;
		}

		widget.update(payload, function () {
			console.log("BTB widget updated");
		}, function (error) {
			console.error("BTB widget update error:", error);
		});
		return true;
	},

	getWidgetPayload: function (message) {
		if (!message) {
			return null;
		}

		var targetUrl = this.getNotificationLaunchUrl(message);
		var route = targetUrl.indexOf("#SuperLog-display") >= 0
			? "super"
			: targetUrl.indexOf("#SporToto-manage") >= 0 ? "toto" : "btb";
		var title = this.getNotificationTextValue(message, "title");
		var body = this.getMessageValue(message, "widget_body") ||
			this.getNotificationTextValue(message, "body");
		var normalizedRating = this.getNotificationRating(message, body);
		var matchTarget = this.getMatchTarget(message);

		if (!title && !body) {
			return null;
		}

		title = title || (route === "super" ? "Yeni Super bildirimi" : "BTB Mobile");
		body = body || (route === "super"
			? "Super Log’u açmak için dokunun."
			: route === "toto"
				? "Spor Toto programını açmak için dokunun."
				: "BTB uygulamasını açmak için dokunun.");

		body = this.getWidgetBody(body, normalizedRating);

		var payload = {
			title: title,
			body: body,
			route: route
		};

		if (normalizedRating) {
			payload.rating = normalizedRating;
		}

		if (matchTarget) {
			payload.match_id = matchTarget.id;
			payload.match_date = matchTarget.date;
			payload.match_time = matchTarget.time;
		}

		this.addKpiWidgetValues(message, payload);
		return payload;
	},

	addKpiWidgetValues: function (message, payload) {
		var totoHits = this.getMessageValue(message, "toto_coverage_hits");
		var totoTotal = this.getMessageValue(message, "toto_coverage_total");
		var totoTarget = this.getTotoProgramTarget(message);
		var superMinRating = this.getMessageValue(message, "super_min_rating");
		var superWins = this.getMessageValue(message, "super_wins");
		var superLosses = this.getMessageValue(message, "super_losses");
		var superProfit = this.getMessageValue(message, "super_profit");
		var hasSuperThreshold = /^[1-5]$/.test(superMinRating);
		var normalizedSuperWins = superWins === "" ? 0 : Number(superWins);
		var normalizedSuperLosses = superLosses === "" ? 0 : Number(superLosses);
		var normalizedSuperProfit = superProfit === "" ? 0 : Number(superProfit);

		if (
			/^\d+$/.test(totoHits) &&
			/^\d+$/.test(totoTotal) &&
			Number(totoHits) <= Number(totoTotal)
		) {
			payload.toto_coverage_hits = Number(totoHits);
			payload.toto_coverage_total = Number(totoTotal);
		}

		if (totoTarget) {
			payload.toto_program_gc_no = Number(totoTarget.gcNo);
			payload.toto_program_version = Number(totoTarget.version);
		}

		if (
			hasSuperThreshold &&
			(superWins === "" || /^\d+$/.test(superWins)) &&
			(superLosses === "" || /^\d+$/.test(superLosses)) &&
			(superProfit === "" || Number.isFinite(normalizedSuperProfit))
		) {
			payload.super_min_rating = Number(superMinRating);
			payload.super_wins = normalizedSuperWins;
			payload.super_losses = normalizedSuperLosses;
			payload.super_profit = normalizedSuperProfit;
		}
	},

	getNotificationTextValue: function (message, key) {
		return this.getMessageValue(message, key) ||
			this.getMessageValue(message, "notification_" + key);
	},

	getNotificationRating: function (message, body) {
		var explicitRating = this.getMessageValue(message, "rating") ||
			this.getMessageValue(message, "star") ||
			this.getMessageValue(message, "stars") ||
			this.getMessageValue(message, "super_rating");
		var normalizedRating = Number.parseInt(explicitRating, 10);

		if (normalizedRating >= 1 && normalizedRating <= 5) {
			return normalizedRating;
		}

		var text = String(body || "");
		var legacyMatch = text.match(/\brating\s*([1-5])\b/i);

		if (legacyMatch) {
			return Number.parseInt(legacyMatch[1], 10);
		}

		var starMatch = text.match(/([★⭐]{1,5})/);
		return starMatch ? starMatch[1].length : 0;
	},

	getWidgetBody: function (body, rating) {
		var source = String(body || "").trim();

		if (!rating) {
			return source;
		}

		var cleaned = source
			.replace(/\s*\(\s*rating\s*[1-5]\s*\)\s*[.!?]?\s*$/i, "")
			.replace(/\s*[★⭐]{1,5}\s*[.!?]?\s*$/, "")
			.trim();

		if (!cleaned || /[.!?]$/.test(cleaned)) {
			return cleaned;
		}

		return cleaned + ".";
	},

	normalizeMatchDate: function (value) {
		var text = String(value || "").trim();
		var compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);

		if (compact) {
			return compact[1] + "-" + compact[2] + "-" + compact[3];
		}

		return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
	},

	normalizeMatchTime: function (value) {
		var text = String(value || "").trim();
		var compact = text.match(/^(\d{2})(\d{2})(\d{2})$/);

		if (compact) {
			return compact[1] + ":" + compact[2] + ":" + compact[3];
		}

		return /^\d{2}:\d{2}:\d{2}$/.test(text) ? text : "";
	},

	getMatchTarget: function (message) {
		var id = this.getMessageValue(message, "match_id") ||
			this.getMessageValue(message, "matchId");
		var date = this.normalizeMatchDate(
			this.getMessageValue(message, "match_date") ||
			this.getMessageValue(message, "matchDate")
		);
		var time = this.normalizeMatchTime(
			this.getMessageValue(message, "match_time") ||
			this.getMessageValue(message, "matchTime")
		);

		if (!/^\d+$/.test(id) || Number.parseInt(id, 10) <= 0 || !date || !time) {
			return null;
		}

		return {
			id: String(Number.parseInt(id, 10)),
			date: date,
			time: time
		};
	},

	getMatchLaunchUrl: function (message) {
		var target = this.getMatchTarget(message);

		if (!target) {
			return "";
		}

		var timeParts = target.time.split(":");
		var entityPath = "zbet_cds_005(" +
			"datum=datetime'" + target.date + "T00%253A00%253A00'," +
			"id=" + target.id + "," +
			"uzeit=time'PT" +
				timeParts[0] + "H" +
				timeParts[1] + "M" +
				timeParts[2] + "S')";

		return this.launchpadBaseUrl +
			"#btb-manage?sap-ui-app-id-hint=saas_approuter_com.btb.btb&/" +
			entityPath +
			"/?FCLLayout=MidColumnFullScreen";
	},

	getTotoProgramTarget: function (message) {
		var gcNo = this.getMessageValue(message, "toto_program_gc_no") ||
			this.getMessageValue(message, "totoProgramGcNo");
		var version = this.getMessageValue(message, "toto_program_version") ||
			this.getMessageValue(message, "totoProgramVersion");

		if (
			!/^\d+$/.test(gcNo) ||
			Number.parseInt(gcNo, 10) <= 0 ||
			!/^\d+$/.test(version) ||
			Number.parseInt(version, 10) <= 0
		) {
			return null;
		}

		return {
			gcNo: String(Number.parseInt(gcNo, 10)),
			version: String(Number.parseInt(version, 10))
		};
	},

	getTotoProgramLaunchUrl: function (message) {
		var target = this.getTotoProgramTarget(message);

		if (!target) {
			return "";
		}

		return this.launchpadBaseUrl +
			"#SporToto-manage?" +
			"sap-ui-app-id-hint=saas_approuter_com.btb.toto.zbettotoapp&/" +
			"Programs(gc_no=" + target.gcNo +
				",version_no=" + target.version + ")" +
			"/?FCLLayout=MidColumnFullScreen";
	},

	registerFirebase: function () {
		var messaging = this.getFirebaseMessaging();
		if (!messaging) {
			console.warn("Firebase messaging plugin is not available");
			return;
		}

		var self = this;
		this.configureNotificationChannels(messaging);

		this.requestNotificationPermission(function () {
			self.registerFirebaseMessageHandler();
			self.subscribeToNotifications();
		});

		if (typeof messaging.onTokenRefresh === "function") {
			messaging.onTokenRefresh(function () {
				console.log("FCM token refreshed");
				self.subscribeToNotifications();
			}, function (error) {
				console.error("FCM token refresh error:", error);
			});
		}
	},

	configureNotificationChannels: function (messaging) {
		var self = this;
		var createChannel = function (channel) {
			messaging.createChannel({
				id: channel.id,
				name: channel.name,
				description: channel.description,
				importance: 4,
				sound: channel.sound,
				vibration: [0, 180, 120, 180],
				light: true,
				badge: true,
				visibility: 1
			}, function () {
				console.log("BTB notification channel is ready:", channel.id);
			}, function (error) {
				console.error("BTB notification channel error:", channel.id, error);
			});
		};
		var createMissingChannels = function (channels) {
			var existing = Array.isArray(channels) ? channels : [];

			if (typeof messaging.deleteChannel === "function") {
				existing.forEach(function (current) {
					if (
						current &&
						self.legacyNotificationChannelIds.indexOf(current.id) >= 0
					) {
						messaging.deleteChannel(current.id);
					}
				});
			}

			self.notificationChannels.forEach(function (channel) {
				var exists = existing.some(function (current) {
					return current && current.id === channel.id;
				});

				if (!exists) {
					createChannel(channel);
				}
			});
		};

		if (!messaging || typeof messaging.createChannel !== "function") {
			return false;
		}

		if (typeof messaging.listChannels !== "function") {
			createMissingChannels([]);
			return true;
		}

		messaging.listChannels(function (channels) {
			createMissingChannels(channels);
		}, function () {
			createMissingChannels([]);
		});

		return true;
	},

	requestNotificationPermission: function (done) {
		var messaging = this.getFirebaseMessaging();

		if (!messaging || typeof messaging.hasPermission !== "function") {
			done();
			return;
		}

		messaging.hasPermission(function (hasPermission) {
			if (hasPermission) {
				console.log("Notification permission is granted");
				done();
				return;
			}

			if (typeof messaging.grantPermission !== "function") {
				console.warn("Notification permission is not granted and cannot be requested");
				done();
				return;
			}

			messaging.grantPermission(function (granted) {
				console.log("Notification permission was " + (granted ? "granted" : "denied"));
				done();
			}, function (error) {
				console.error("Notification permission error:", error);
				done();
			});
		}, function (error) {
			console.error("Notification permission check error:", error);
			done();
		});
	},

	registerFirebaseMessageHandler: function () {
		var messaging = this.getFirebaseMessaging();

		if (
			this.firebaseMessageHandlerRegistered ||
			!messaging ||
			typeof messaging.onMessageReceived !== "function"
		) {
			return;
		}

		var self = this;

		this.firebaseMessageHandlerRegistered = true;

		messaging.onMessageReceived(function (message) {
			self.updateWidgetFromMessage(message);

			if (self.isNotificationTap(message)) {
				self.openNotificationTarget(message);
			}
		}, function (error) {
			console.error("FCM message handler error:", error);
		});
	},

	isNotificationTap: function (message) {
		if (!message) {
			return false;
		}

		return !!(message.tap || message.wasTapped || message.coldstart);
	},

	openNotificationTarget: function (message) {
		var targetUrl = this.getNotificationLaunchUrl(message);

		this.retryAttempt = 0;
		this.startApp(targetUrl, { immediate: true });
	},

	getNotificationLaunchUrl: function (message) {
		var matchUrl = this.getMatchLaunchUrl(message);

		if (matchUrl) {
			return matchUrl;
		}

		var route = this.getMessageValue(message, "route") ||
			this.getMessageValue(message, "target") ||
			this.getMessageValue(message, "screen");

		if (route) {
			return this.getRouteUrl(route);
		}

		var title = this.getNotificationTextValue(message, "title");
		var body = this.getNotificationTextValue(message, "body");
		var text = ((title || "") + " " + (body || "")).toLowerCase();

		if (text.indexOf("super") >= 0 || text.indexOf("sclear") >= 0) {
			return this.getRouteUrl("super");
		}

		return this.getRouteUrl("btb");
	},

	getMessageValue: function (message, key) {
		if (!message || !key) {
			return "";
		}

		if (message[key]) {
			return String(message[key]);
		}

		if (message.data && message.data[key]) {
			return String(message.data[key]);
		}

		if (message.notification && message.notification[key]) {
			return String(message.notification[key]);
		}

		return "";
	},

	getRouteUrl: function (route) {
		var routeText = String(route || "");
		var normalizedRoute = routeText.toLowerCase();
		var hash = this.defaultHash;

		if (
			normalizedRoute === "super" ||
			normalizedRoute === "superlog" ||
			normalizedRoute === "super-log" ||
			normalizedRoute === "sclear"
		) {
			hash = "#SuperLog-display";
		} else if (
			normalizedRoute === "toto" ||
			normalizedRoute === "sportoto" ||
			normalizedRoute === "spor-toto"
		) {
			hash = "#SporToto-manage";
		} else if (normalizedRoute === "btb" || normalizedRoute === "main" || normalizedRoute === "live") {
			hash = "#btb-manage";
		} else if (routeText.indexOf("#") === 0) {
			hash = routeText;
		}

		return this.launchpadBaseUrl + hash;
	},

	isBilyonerMatchUrl: function (url) {
		try {
			var parsedUrl = new URL(String(url || ""));
			var hostname = parsedUrl.hostname.toLowerCase();
			var pathname = parsedUrl.pathname.toLowerCase();

			return parsedUrl.protocol === "https:" &&
				(hostname === "bilyoner.com" || hostname === "www.bilyoner.com") &&
				pathname.indexOf("/mac-karti/") === 0;
		} catch (e) {
			return false;
		}
	},

	openSystemUrl: function (url) {
		if (
			typeof cordova === "undefined" ||
			!cordova.InAppBrowser ||
			typeof cordova.InAppBrowser.open !== "function"
		) {
			return false;
		}

		try {
			cordova.InAppBrowser.open(url, "_system");
			return true;
		} catch (e) {
			console.error("System URL open error:", e);
			return false;
		}
	},

	handleBeforeLoad: function (event, loadUrl) {
		var url = event && event.url ? event.url : "";

		if (this.isBilyonerMatchUrl(url) && this.openSystemUrl(url)) {
			return;
		}

		if (typeof loadUrl === "function" && url) {
			loadUrl(url);
		}
	},

	subscribeToNotifications: function () {
		var messaging = this.getFirebaseMessaging();

		if (!messaging || typeof messaging.subscribe !== "function") {
			return;
		}

		messaging.subscribe(
			this.topicName,
			function () {
				console.log("Subscribed to BTB");
			},
			function (error) {
				console.error("Subscribe error:", error);
			}
		);
	},

	registerNetworkHandlers: function () {
		var self = this;

		document.addEventListener("online", function () {
			self.handleOnline();
		}, false);

		document.addEventListener("offline", function () {
			if (!self.browserRef) {
				self.clearTimers();
				self.showOfflineState();
			}
		}, false);
	},

	registerLifecycleHandlers: function () {
		document.addEventListener("pause", this.handlePause.bind(this), false);
		document.addEventListener("resume", this.handleResume.bind(this), false);
	},

	handlePause: function () {
		this.pausedAt = Date.now();
	},

	handleResume: function () {
		var backgroundDuration = this.pausedAt ? Date.now() - this.pausedAt : 0;
		var browser = this.browserRef;

		this.pausedAt = 0;

		if (this.relaunchTimer) {
			return;
		}

		if (browser && backgroundDuration >= this.resumeHardRefreshAfter) {
			this.restartBrowserAfterResume(browser);
			return;
		}

		if (browser && typeof browser.show === "function") {
			try {
				browser.show();
				this.disableCustomBack();
				this.verifyBrowserAfterResume(browser);
				return;
			} catch (e) {
				console.error("Browser resume error:", e);
			}
		}

		this.restartBrowserAfterResume(browser);
	},

	verifyBrowserAfterResume: function (browser) {
		var self = this;

		this.clearResumeProbe();
		this.resumeProbeTimer = setTimeout(function () {
			self.resumeProbeTimer = null;
			self.restartBrowserAfterResume(browser);
		}, this.resumeProbeDelay);

		if (!browser || typeof browser.executeScript !== "function") {
			return;
		}

		try {
			browser.executeScript({
				code: "(function(){var b=document.body;return JSON.stringify({href:String(location.href||''),ready:String(document.readyState||''),hasContent:!!(b&&(b.children.length||String(b.innerText||'').trim().length))});})()"
			}, function (results) {
				if (self.browserRef !== browser) {
					self.clearResumeProbe();
					return;
				}

				if (self.isBrowserProbeHealthy(results)) {
					self.retryAttempt = 0;
					self.clearResumeProbe();
					return;
				}

				self.restartBrowserAfterResume(browser);
			});
		} catch (e) {
			console.error("Browser health check error:", e);
			this.restartBrowserAfterResume(browser);
		}
	},

	isBrowserProbeHealthy: function (results) {
		var state;

		if (!Array.isArray(results) || !results.length || typeof results[0] !== "string") {
			return false;
		}

		try {
			state = JSON.parse(results[0]);
		} catch (e) {
			return false;
		}

		return /^https?:\/\//i.test(String(state.href || "")) &&
			(state.ready === "interactive" || state.ready === "complete") &&
			state.hasContent === true;
	},

	clearResumeProbe: function () {
		if (this.resumeProbeTimer) {
			clearTimeout(this.resumeProbeTimer);
			this.resumeProbeTimer = null;
		}
	},

	restartBrowserAfterResume: function (browser) {
		if (browser && this.browserRef !== browser) {
			return;
		}

		this.clearResumeProbe();
		this.retryAttempt = 0;
		this.startApp(this.pendingLaunchUrl || this.getRouteUrl("home"), { immediate: true });
	},

	handleOnline: function () {
		if (this.browserRef) {
			return;
		}

		this.retryAttempt = 0;
		this.startApp(this.pendingLaunchUrl || this.getRouteUrl("home"), { immediate: true });
	},

	setStatusText: function (text) {
		var el = document.getElementById("statusText");
		if (el) {
			el.innerText = text;
		}
	},

	setDetailText: function (text) {
		var el = document.getElementById("detailText");
		if (el) {
			el.innerText = text;
		}
	},

	setRetryVisible: function (visible, label) {
		var retryButton = document.getElementById("retryButton");
		if (!retryButton) {
			return;
		}

		retryButton.hidden = !visible;
		if (label) {
			retryButton.innerText = label;
		}
	},

	isOffline: function () {
		return !!(
			navigator.connection &&
			typeof Connection !== "undefined" &&
			navigator.connection.type === Connection.NONE
		);
	},

	showOfflineState: function () {
		this.setStatusText("No internet connection");
		this.setDetailText("Check your connection and try again.");
		this.setRetryVisible(true, "Retry");
	},

	startApp: function (url, options) {
		var launchUrl = url || this.getRouteUrl("home");
		var settings = options || {};

		this.pendingLaunchUrl = launchUrl;

		if (this.isOffline()) {
			this.showOfflineState();
			return;
		}

		this.setStatusText("Opening BTB");
		this.setDetailText("Connecting to the BTB mobile experience.");
		this.setRetryVisible(false);
		this.scheduleRelaunch(launchUrl, settings.immediate ? settings : { initial: true });
	},

	retryNow: function () {
		this.retryAttempt = 0;
		this.clearTimers();
		this.startApp(this.pendingLaunchUrl || this.getRouteUrl("home"), { immediate: true });
	},

	clearTimers: function () {
		if (this.relaunchTimer) {
			clearTimeout(this.relaunchTimer);
			this.relaunchTimer = null;
		}

		if (this.restoreTimer) {
			clearTimeout(this.restoreTimer);
			this.restoreTimer = null;
		}

		this.clearResumeProbe();
	},

	scheduleRelaunch: function (url, options) {
		var self = this;
		var settings = options || {};
		var launchUrl = url || this.getRouteUrl("home");
		var delay = settings.immediate ? 0 : settings.initial ? 1200 : this.getNextRetryDelay();

		this.clearTimers();
		this.waitingBackPressedOnce = false;
		this.pendingLaunchUrl = launchUrl;

		if (delay > 0 && !settings.initial) {
			this.setStatusText("Connection problem");
			this.setDetailText("Retrying in " + Math.round(delay / 1000) + " seconds.");
			this.setRetryVisible(true, "Retry now");
		}

		this.relaunchTimer = setTimeout(function () {
			self.openLaunchpad(launchUrl);
		}, delay);
	},

	getNextRetryDelay: function () {
		var index = Math.min(this.retryAttempt, this.retryDelays.length - 1);
		var delay = this.retryDelays[index];

		this.retryAttempt += 1;
		return delay;
	},

	closeBrowserForRetry: function (browser) {
		var browserToClose = browser || this.browserRef;

		if (!browserToClose) {
			return;
		}

		browserToClose.btbIntentionalClose = true;

		try {
			browserToClose.close();
		} catch (e) {
			console.log("Browser close error:", e);
		}

		if (this.browserRef === browserToClose) {
			this.browserRef = null;
		}
	},

	openLaunchpad: function (url) {
		var self = this;
		var launchUrl = url || this.pendingLaunchUrl || this.getRouteUrl("home");

		this.relaunchTimer = null;
		this.waitingBackPressedOnce = false;
		this.setStatusText("Opening BTB");
		this.setDetailText("Loading the requested BTB screen.");
		this.setRetryVisible(false);

		if (this.browserRef) {
			this.closeBrowserForRetry(this.browserRef);
			this.relaunchTimer = setTimeout(function () {
				self.openLaunchpad(launchUrl);
			}, this.browserCloseDelay);
			return;
		}

		var browser = cordova.InAppBrowser.open(
			launchUrl,
			"_blank",
			"location=no,toolbar=no,zoom=no,hideurlbar=yes,hardwareback=yes,clearcache=no,clearsessioncache=no,beforeload=yes"
		);
		this.browserRef = browser;

		if (!browser) {
			this.enableCustomBack();
			this.setStatusText("Cannot open BTB");
			this.setDetailText("The in-app browser could not be started.");
			this.setRetryVisible(true, "Retry");
			return;
		}

		// Let InAppBrowser handle the hardware back button while it is open.
		this.disableCustomBack();

		browser.addEventListener("beforeload", function (event, loadUrl) {
			if (self.browserRef !== browser) {
				return;
			}

			self.handleBeforeLoad(event, loadUrl);
		});

		browser.addEventListener("message", function (event) {
			if (self.browserRef === browser) {
				self.handleBrowserMessage(event);
			}
		});

		browser.addEventListener("loadstop", function (event) {
			if (self.browserRef !== browser) {
				return;
			}

			console.log("loadstop url:", event && event.url ? event.url : "");
			self.retryAttempt = 0;
			self.enforceMobileTouchDensity(browser);
			self.enableMobileAutoHideShell(browser);
			self.injectMobileControls(browser);
		});

		browser.addEventListener("loaderror", function (event) {
			if (self.browserRef !== browser) {
				return;
			}

			console.error("Launchpad load error:", event);

			self.closeBrowserForRetry(browser);
			self.enableCustomBack();
			self.scheduleRelaunch(launchUrl);
		});

		browser.addEventListener("exit", function () {
			var wasCurrentBrowser = self.browserRef === browser;

			console.log("Browser closed");

			if (wasCurrentBrowser) {
				self.browserRef = null;
			}

			if (browser.btbIntentionalClose || !wasCurrentBrowser) {
				return;
			}

			self.enableCustomBack();
			self.setStatusText("BTB closed");
			self.setDetailText("Reopening the mobile experience.");
			self.scheduleRelaunch(self.pendingLaunchUrl || self.getRouteUrl("home"), { initial: true });
		});
	},

	onBackButton: function () {
		var self = this;

		// This handler is active only on the logo/loading screen.
		if (this.browserRef) {
			return;
		}

		this.clearTimers();

		if (!this.waitingBackPressedOnce) {
			this.waitingBackPressedOnce = true;
			this.setStatusText("Press back again to exit");
			this.setDetailText("BTB will reopen automatically if you stay here.");
			this.setRetryVisible(true, "Open BTB");

			this.restoreTimer = setTimeout(function () {
				self.waitingBackPressedOnce = false;
				self.startApp(self.pendingLaunchUrl || self.getRouteUrl("home"));
			}, 2000);
		} else {
			navigator.app.exitApp();
		}
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = app;
}

if (typeof document !== "undefined") {
	app.initialize();
}
