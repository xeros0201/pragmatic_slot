var UHTLogotypeInfo = {
    "ext_test3": {"src": "oneworks_logo.png", "bg": "#000000", "fit": "shrink"},
    "oneworks": {"src": "oneworks_logo.png", "bg": "#000000", "fit": "shrink"},
	"ow_cash": {"src": "oneworks_logo.png", "bg": "#000000", "fit": "shrink"}
};

var UHTLobbySeparateIcons = {
	"zh" : "_zh/",
	"zt" : "_zh/"
}

UHT_ForceClickForSounds = true;
UHT_STILLCHECKMONEYONSPIN = true;

var ST_GA4 = ["G-LM078XY385","G-CZW3H3GKFN","G-GH2SZPZ0GS","G-BBX3GJ2LDP","G-KMZJZBH10S","G-GM5RY6Z8LG","G-K2E2CD7X5Y","G-TYR41R01EW","G-8QQNGJE2DS",
"G-EPVHT9CLQ4","G-VFTT2CT4CR","G-GS4CT46LFL","G-DGFCQDPGWL","G-Y7K30WC0F6","G-QVNYQ57KXJ","G-JSPY03SG9K","G-YE4DLTEP1H","G-0JL903JZ68","G-695Z6D75L3",
"G-Z7YN4ZH32L","G-L81RWHNFKF","G-X8XBXYELJP","G-YZ36FT3P2N","G-EN4F8844JM","G-EXLTZWNLW9","G-0E2CEPJ3G7","G-Z8RSQ2SX6H","G-ML7K1SQ4N7","G-D15D7PY7B4",
"G-P6DSTCLEM6","G-C49NYG0QJY","G-HCR8HL08ZF"];

var SPIN_TRACKER_ID = Math.floor(Math.random() * 32);
if (window["ga4_init"] != undefined)
	ga4_init('UA-83294317-' + (7 + SPIN_TRACKER_ID), {'siteSpeedSampleRate':  10, 'sampleRate':   1, name: "ST" + SPIN_TRACKER_ID}, ST_GA4[SPIN_TRACKER_ID]);
else
	ga('create', 'UA-83294317-' + (7 + SPIN_TRACKER_ID), {'siteSpeedSampleRate':  10, 'sampleRate':   1, name: "ST" + SPIN_TRACKER_ID});

if (window["Loader"] != null)
	if (window["Loader"]["WURFLProcessed"] == undefined && window["Loader"]["SendStatistics"] != undefined)
		window["Loader"]["SendStatistics"](JSON.stringify({}));

function UHTPatch(info) // {name, ready(), apply(), interval}
{
	if (info["_UHT_timer"] != undefined)
		clearTimeout(info["_UHT_timer"]);
	if (info.ready())
		info.apply();
	else
		if (info.retry())
			info["_UHT_timer"] = setTimeout(function(){UHTPatch(info)}, info.interval || 500);
}

var isStandalone = window["URLGameSymbol"] == "slotsLobby"
if(isStandalone)
{
	Loader.LoadGame = function(){};
	//window.document.getElementById("wheelofpatience").remove();
}

UHTPatch({
	name: "DisableLobbyNotifications",
	ready:function()
	{
		return (window["MultiLobbyConnection"] != undefined);
	},
	apply:function()
	{
		if(IsRequired("LN"))
			return;
		
		MultiLobbyConnection.CanHaveAlerts = function()
		{
			return false;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPromotionsName",
	ready:function()
	{
		return (window["TournamentProtocol"] != undefined && window["TournamentAnnouncementDisplayer"] != undefined && window["globalRuntime"] != undefined);
	},
	apply:function()
	{
		var oTAD_OSA = TournamentAnnouncementDisplayer.prototype.OnShowAnnouncement;
		TournamentAnnouncementDisplayer.prototype.OnShowAnnouncement = function()
		{
			var announcement = XT.GetObject(AnnouncementVars.Announcement);
			if (this.type != announcement.type)
				return;

			var removeRegex = "~[^~]*~";
			announcement.message = announcement.message.replace(new RegExp(removeRegex, "g"), "");

			oTAD_OSA.apply(this, arguments);
		};

	
		var oTPTPPT = TournamentProtocol.TournamentParser.ParseTournaments;
		TournamentProtocol.TournamentParser.ParseTournaments = function()
		{
			var res = oTPTPPT.apply(this, arguments);
			if (res != null)
			{
				for (var r = 0; r < res.length; ++r)
				{
					var removeRegex = "~[^~]*~";
			        res[r].name = res[r].name.replace(new RegExp(removeRegex, "g"), "");
				}
			}
			return res;
		};

	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchJurisdictionRequirementsOnGP16",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if (["vswaysmahwblck"].indexOf(window["UHT_GAME_CONFIG"]["GAME_SYMBOL"]) != -1)
		{
			window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements = "NOBF,"+window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements;
		}
			
		if (location.hostname.indexOf(".gp16.") == -1)
			return;

		if (location.host.indexOf("test1.gp16") == -1 && location.host.indexOf("test2.gp16") == -1)
			return;

		var data = (new URLSearchParams(window.location.href)).get("brandName");
		if (data == null)
			return;

		window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements += "," + data;

	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
	interval: 1
});



UHTPatch({
	name: "PatchNOAB_BetLevelV2",
	ready: function()
	{
		return (window["BetLevelV2"] != undefined);
	},
	apply: function()
	{
		var oBLV2_XTRC = BetLevelV2.prototype.XTRegisterCallbacks;
		BetLevelV2.prototype.XTRegisterCallbacks = function()
		{
			XT.RegisterCallbackBool(Vars.Jurisdiction_DisableAnteBet, this.OnJurisdictionDisable, this);
			oBLV2_XTRC.apply(this, arguments);
		}
	},
	retry: function()
	{
		return window["Renderer"] == undefined;
	}
});


UHTPatch({
	name: "PatchForceIntro",
	ready: function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function()
	{
		if (IsRequired("SHOPTY"))
		{
			if (window["UHT_CUSTOM_LOADER_TYPE"] == "FP") 
			{
				ClientLoader.prototype.OnRequestToHideLoader = function()
				{
					this.tryToHide = true;
					XT.TriggerEvent(Vars.Evt_DataToCode_IntroClosePressed);
				};
			}

			if (Vars.Evt_CodeToData_IntroClosedOrSkipped != undefined)
			{
				var onIntro = function()
				{
					if(!Globals.isMobile)
					{
						if (window["InterfaceController"] == undefined)
							return;
						var desktopInterfaces = globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceController, true);
						if (desktopInterfaces.length > 0)
						{
							if (desktopInterfaces[0].internalState != 16 && desktopInterfaces[0].internalState != 18)
								desktopInterfaces[0].Pressed_Paytable_Open();
							else
							{
								var onVSGameStateChanged = function()
								{
									var BF_IL = globalRuntime.sceneRoots[1].GetComponentsInChildren(BuyFeature_InterfaceLink)[0];
									if (desktopInterfaces.length > 0 && BF_IL.closeTimer < 0)
									{
										if (desktopInterfaces[0].internalState != 16 && desktopInterfaces[0].internalState != 18)
										{
											desktopInterfaces[0].Pressed_Paytable_Open();
											XT.UnregisterCallbackEvent(onVSGameStateChanged, this, Vars.Evt_Internal_ChangeVSGameState);
										}
									}
								}
								XT.RegisterCallbackEvent(Vars.Evt_Internal_ChangeVSGameState, onVSGameStateChanged, this, 696969);
							}
						}
					}
					else
					{
						if (window["InterfaceControllerMobile_1"] == undefined && window["InterfaceControllerMobile_2"] == undefined)
							return;

						var landscapeInterfaces = globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceControllerMobile_1, true);
						var portraitInterfaces = globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceControllerMobile_2, true);
						if (landscapeInterfaces.length > 0)
						{
							if (landscapeInterfaces[0].internalState != 16 && landscapeInterfaces[0].internalState != 18)
								landscapeInterfaces[0].Pressed_Paytable_Open();
							else
							{
								var onVSGameStateChangedLand = function()
								{
									var BF_IL = globalRuntime.sceneRoots[1].GetComponentsInChildren(BuyFeature_InterfaceLink)[0];
									if (landscapeInterfaces.length > 0 && BF_IL.closeTimer < 0)
									{
										if (landscapeInterfaces[0].internalState != 16 && landscapeInterfaces[0].internalState != 18)
										{
											landscapeInterfaces[0].Pressed_Paytable_Open();
											XT.UnregisterCallbackEvent(onVSGameStateChangedLand, this, Vars.Evt_Internal_ChangeVSGameState);
										}
									}
								}
								XT.RegisterCallbackEvent(Vars.Evt_Internal_ChangeVSGameState, onVSGameStateChangedLand, this, 696969);
							}
						}
						if (portraitInterfaces.length > 0)
						{
							if (portraitInterfaces[0].internalState != 16 && portraitInterfaces[0].internalState != 18)
								portraitInterfaces[0].Pressed_Paytable_Open();
							else
							{
								var onVSGameStateChangedPort = function()
								{
									var BF_IL = globalRuntime.sceneRoots[1].GetComponentsInChildren(BuyFeature_InterfaceLink)[0];
									if (portraitInterfaces.length > 0 && BF_IL.closeTimer < 0)
									{
										if (portraitInterfaces[0].internalState != 16 && portraitInterfaces[0].internalState != 18)
										{
											portraitInterfaces[0].Pressed_Paytable_Open();
											XT.UnregisterCallbackEvent(onVSGameStateChangedPort, this, Vars.Evt_Internal_ChangeVSGameState);
										}
									}
								}
								XT.RegisterCallbackEvent(Vars.Evt_Internal_ChangeVSGameState, onVSGameStateChangedPort, this, 696969);
							}
						}
					}
				}
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_IntroClosedOrSkipped, onIntro, this);
			}
		}
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLimitAutoplay",
	ready:function()
	{
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"]);
	},
	apply:function()
	{
		var lim = IsRequired("LIMAP")
		
		if (lim && lim[0])
		{
			var maxAPs = lim[0] | 0;
			function isAllowed(value) {
				return value <= maxAPs;
			}
			if (window["AutoplayControllerMobileV10"])
			{
				var ctrls = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobileV10, true)
				for (var i=0; i<ctrls.length; i++)
					ctrls[i].sliderSpins.values = ctrls[i].sliderSpins.values.filter(isAllowed);
			}

			if (window["AutoplayControllerAdvancedV10"])
			{
				var ctrls = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerAdvancedV10, true)
				for (var i=0; i<ctrls.length; i++)
					ctrls[i].sliderSpins.values = ctrls[i].sliderSpins.values.filter(isAllowed);
			}

			if (window["AutoplayControllerAdvanced"])
			{
				var ctrls = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerAdvanced, true)
				for (var i=0; i<ctrls.length; i++)
				{
					ctrls[i].requestedAutoSpins = ctrls[i].requestedAutoSpins.filter(isAllowed);
					for (var j=0; j<ctrls[i].checkSpins.length; j++)
						if (ctrls[i].requestedAutoSpins.indexOf(ctrls[i].checkSpins[j].gameObject.name | 0) == -1)
							ctrls[i].checkSpins[j].gameObject.SetActive(false);
					XT.SetInt(InterfaceVars.SelectedAutoSpinsIndexAdvanced, 0);
				}
			}

			if (window["AutoplayControllerMobile"])
			{
				var ctrls = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true)
				for (var i=0; i<ctrls.length; i++)
					ctrls[i].requestedAutoSpins = ctrls[i].requestedAutoSpins.filter(isAllowed);
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchTextureDisposeOnIOS",
	ready: function()
	{
		return (window["UIAtlas"] != undefined);
	},
	apply: function()
	{
		UIAtlas.CheckUsageAndClean = function() {};
		UILabel.CheckUsageAndClean = function() {};

		var oUIL_PPT = UILabel.prototype.processPixiText;
		UILabel.prototype.processPixiText = function()
		{
			this.textIsUnprocessed = false;
			oUIL_PPT.apply(this, arguments);
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchSetMinSpinOnStart",
	ready: function()
	{
		return (window["globalRuntime"] != undefined);
	},
	apply: function()
	{
		if (!IsRequired("MINBETSTART"))
			return;
		if (ServerOptions.isReplay)
			return;

		var OnChangeGameState = function()
		{
			if ((VSGameStateManager.internalState == VSGameState.Result) && (XT.GetObject(Vars.TumblingData) == null))
			{
				var bets = XT.GetObject(Vars.Bets);
				var coinValues = XT.GetObject(Vars.CoinValues);
				if (XT.GetBool(Vars.FromServer_AllowCoins))
					CoinManager.instance.SetCoinValueIndex(0);
				CoinManager.SetBetIndex(0);
		
				XT.UnregisterCallbackEvent(OnChangeGameState, this, Vars.Evt_Internal_ChangeVSGameState);
			}
		}

		var OnXTGameInit = function()
		{
			XT.RegisterCallbackEvent(Vars.Evt_Internal_ChangeVSGameState, OnChangeGameState, this);
		}
		if (GameEvents["evtXTRegisterCallbacks"] != null)
			EventManager.AddHandler(GameEvents.evtXTRegisterCallbacks, function() { XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this); }, this);
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
	interval: 50
});

UHTPatch({
	name: "PatchShowMinSpinWarning",
	ready: function()
	{
		return (window["globalRuntime"] != undefined);
	},
	apply: function()
	{
		if (!IsRequired("MINBETW"))
			return;
		if (ServerOptions.isReplay)
			return;

		var onScreenTargets = [];
		var warningText = "";
		var consumed = false;

		var OnChangeGameState = function()
		{
			if ((VSGameStateManager.internalState == VSGameState.Result) && (XT.GetObject(Vars.TumblingData) == null))
			{
				if (!UpdateOnScreenWarning())
					Consume();
				XT.UnregisterCallbackEvent(OnChangeGameState, this, Vars.Evt_Internal_ChangeVSGameState);
			}
		}

		var Consume = function()
		{
			consumed = true;
			UpdateOnScreenWarning();
			XT.UnregisterCallbackEvent(UpdateOnScreenWarning, this);
			XT.UnregisterCallbackEvent(Consume, this, Vars.Evt_DataToCode_Pressed_Spin);
			XT.UnregisterCallbackEvent(Consume, this, Vars.Evt_DataToCode_StartAutoplay);
		}

		var UpdateOnScreenWarning = function()
		{
			var minTotalBet = CoinManager.initialBetsFromServer[0] * XT.GetInt(Vars.LinesForMinBet);
			var shouldShow = (CoinManager.GetNextTotalBet() > minTotalBet);
			shouldShow &= !consumed;
			shouldShow &= (XT.GetObject(Vars.TumblingData) == null);
			shouldShow &= !XT.GetBool(Vars.Logic_IsFreeSpin);
			for (var i = 0; i < onScreenTargets.length; i++)
				onScreenTargets[i].gameObject.SetActive(shouldShow);
			return shouldShow;
		}

		var OnXTGameInit = function()
		{

			var minTotalBet = CoinManager.initialBetsFromServer[0] * XT.GetInt(Vars.LinesForMinBet);
			var minBetValue = LocaleManager.FormatValue(minTotalBet, new FormatOptions()).replaceAll(" ",'\u00A0');

			var warningTextMap = {
				en:`Current bet is higher than the minimum of ${minBetValue}`,
				ar:`الرهان الحالي أعلى من الحد الأدنى ${minBetValue}`,
				bg:`Текущият залог е по-висок от минимума на ${minBetValue}`,
				cs:`Aktuální sázka je vyšší než minimum ${minBetValue}`,
				da:`Nuværende indsats er højere end minimum af ${minBetValue}`,
				de:`Der aktuelle Einsatz ist höher als das Minimum von ${minBetValue}`,
				el:`Το τρέχον ποντάρισμα είναι υψηλότερο από το ελάχιστο του ${minBetValue}`,
				es:`La apuesta actual es superior al mínimo de ${minBetValue}`,
				et:`Praegune panus on suurem kui miinimum ${minBetValue}`,
				fa:`شرط فعلی بیشتر از حداقل ${minBetValue} است`,
				fi:`Nykyinen panos on suurempi kuin ${minBetValue}:n vähimmäismäärä`,
				fr:`La mise actuelle est supérieure au minimum de ${minBetValue}`,
				hr:`Trenutna oklada je veća od minimalne ${minBetValue}`,
				hu:`Az aktuális tét nagyobb mint a ${minBetValue} minimális értéke`,
				hy:`Ընթացիկ խաղադրույքը բարձր է նվազագույնից ${minBetValue}`,
				id:`Taruhan saat ini lebih tinggi dari minimum ${minBetValue}`,
				it:`La puntata attuale è superiore al minimo di ${minBetValue}`,
				ja:`現在のベットが${minBetValue}の最小値より高い`,
				ka:`მიმდინარე ფსონი მინიმუმზე მეტია ${minBetValue}`,
				ko:`현재 베팅이 최소값 ${minBetValue}보다 높습니다.`,
				lt:`Dabartinis statymas yra didesnis už ${minBetValue} minimumą`,
				lv:`Pašreizējā likme ir lielāka par ${minBetValue} minimumu`,
				ms:`Pertaruhan semasa lebih tinggi daripada minimum ${minBetValue}`,
				nl:`Huidige inzet is hoger dan het minimum van ${minBetValue}`,
				no:`Gjeldende innsats er høyere enn minimum av ${minBetValue}`,
				pl:`Aktualny zakład jest wyższy niż minimum ${minBetValue}`,
				pt:`A aposta atual é superior ao mínimo de ${minBetValue}`,
				ro:`Miza curenta e mai mare decat minimul de ${minBetValue}`,
				ru:`Текущая ставка выше минимальной ${minBetValue}`,
				sk:`Aktuálna stávka je vyššia ako minimum ${minBetValue}`,
				sr:`Тренутна опклада је већа од минималне ${minBetValue}`,
				sv:`Aktuell insats är högre än minimum av ${minBetValue}`,
				th:`การเดิมพันปัจจุบันสูงกว่าขั้นต่ำ ${minBetValue}`,
				tr:`Mevcut bahis minimum ${minBetValue} değerinden yüksektir`,
				uk:`Поточна ставка більша за мінімальну ${minBetValue}`,
				vi:`Cược hiện tại cao hơn mức tối thiểu ${minBetValue}`,
				zh:`当前投注额高于 ${minBetValue} 的最小值`,
				zt:`目前的投注高於 ${minBetValue} 的最小值`
			};

			warningText = warningTextMap[UHT_CONFIG.LANGUAGE];
			if (warningText == undefined)
				warningText = warningTextMap.en;

			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
			if (localizationRoot != undefined)
			{
				//desktop
				var isRK = false;
				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") != -1)
							isRK = true;
					}
				}

				var topBarTransform = localizationRoot.transform.Find("GUI/Interface/TopBar/Background/Sprite");
				if (topBarTransform != null)
				{
					var labelTransform = localizationRoot.transform.Find("GUI/Interface/Windows/BetsWindow/Content/BetInCoins/Bet/Bet/TitleLines/Text/CoinsPerLineLabel");
				
					var newObj = instantiate(labelTransform.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(topBarTransform.parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelTopBar = newObj.GetComponent(UILabel);
					labelTopBar.text = warningText;
					labelTopBar.overflow = 0;
					labelTopBar.width = 850;
					labelTopBar.height = 80;
					labelTopBar.transform.localPosition(-100,103,0);
					labelTopBar.resize = 1;
					labelTopBar.maxLines = 2;
					labelTopBar.Start();
					labelTopBar.init(true);
					onScreenTargets.push(labelTopBar);

					var topBarBkgTransform = localizationRoot.transform.Find("GUI/Utils/GUIArranger/UpLeft/Up");
					if (topBarBkgTransform != null)
					{
						var newObj = instantiate(topBarBkgTransform.gameObject);
						newObj.SetActive(false);
						newObj.transform.SetParent(topBarTransform.parent, false);
						newObj.SetActive(true);
						newObj.SetActive(false);
						var topBarBkgSprite = newObj.GetComponent(UISprite);
						topBarBkgSprite.width = 870;
						topBarBkgSprite.height = 80;
						topBarBkgSprite.transform.localPosition(-100, 103, 0);
						topBarBkgSprite.anchorX = 0.5;topBarBkgSprite.anchorY = 0.5;topBarBkgSprite.color.r = 0;topBarBkgSprite.color.g = 0;topBarBkgSprite.color.b = 0;topBarBkgSprite.color.a = 0.6;
						topBarBkgSprite.Start();
						onScreenTargets.push(topBarBkgSprite);
					}
				}

				//mobile portrait
				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI_mobile/PragmaticPlay/PPAnchorLand/PPArrangeableLand/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") != -1)
							isRK = true;
					}
				}


				var labelPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCoins/Bet/Title/BetTitleLines/Text/CoinsPerLineLabel");
				var topBarPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/TopBar/TopBarBackground/TopBarBackgroundSprite");
				if (Globals.isMini)
				{
					labelPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCoins/BetContent/TotalBetTitleLines/Text/TotalBetValue");
					topBarPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/BottomBar/Background/bg_sprite");
				}

				if (topBarPortTransform != null && labelPortTransform != null)
				{
					var newObj = instantiate(labelPortTransform.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(topBarPortTransform.parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelTopBarPort = newObj.GetComponent(UILabel);
					labelTopBarPort.text = warningText;
					labelTopBarPort.overflow = 0;
					labelTopBarPort.width = Globals.isMini ? 700 : 1300;
					labelTopBarPort.height = Globals.isMini ? 50 : 100;
					if (Globals.isMini)
						labelTopBarPort.fontSize = 30;

					labelTopBarPort.transform.localPosition(0, Globals.isMini ? 245 : 193, 0);
					labelTopBarPort.transform.localScale(1,1.176,1);
					labelTopBarPort.resize = 1;
					labelTopBarPort.maxLines = 1;
					labelTopBarPort.dontIgnoreLocalScale = true;
					labelTopBarPort.Start();
					labelTopBarPort.init(true);
					onScreenTargets.push(labelTopBarPort);

					var topBarPortBkgTransform = localizationRoot.transform.Find("GUI_mobile/Utils/GUIArranger/UpLeft/Up");
					if (topBarPortBkgTransform != null)
					{
						var newObj = instantiate(topBarPortBkgTransform.gameObject);
						newObj.SetActive(false);
						newObj.transform.SetParent(topBarPortTransform.parent, false);
						newObj.SetActive(true);
						newObj.SetActive(false);
						var topBarPortBkgSprite = newObj.GetComponent(UISprite);
						topBarPortBkgSprite.width = Globals.isMini ? 700 : 1300;
						topBarPortBkgSprite.height = Globals.isMini ? 50 : 100;
						topBarPortBkgSprite.transform.localPosition(0, Globals.isMini ? 245 : 198, 0);
						topBarPortBkgSprite.transform.localScale(1,Globals.isMini ? 1 : 1.176, 1);
						topBarPortBkgSprite.anchorX = 0.5;topBarPortBkgSprite.anchorY = 0.5;topBarPortBkgSprite.color.r = 0;topBarPortBkgSprite.color.g = 0;topBarPortBkgSprite.color.b = 0;topBarPortBkgSprite.color.a = 0.4;
						topBarPortBkgSprite.Start();
						onScreenTargets.push(topBarPortBkgSprite);
					}
				}
				//mobile landscape
				

				var labelLandTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BetsWindow/Content/BetInCoins/Bet/Bet/Title/TitleLines/Text/CoinsPerLineLabel");
				var topBarLandTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/BottomBar/Background/bgTopSprite");
				if (topBarLandTransform != null)
				{
					var newObj = instantiate(labelLandTransform.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(topBarLandTransform.parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelTopBarLand = newObj.GetComponent(UILabel);
					labelTopBarLand.text = warningText;
					labelTopBarLand.fontSize = 48;
					labelTopBarLand.overflow = 0;
					labelTopBarLand.width = 650;
					labelTopBarLand.height = 60;
					if (isRK)
						labelTopBarLand.transform.localPosition(0,204,0);
					else
						labelTopBarLand.transform.localPosition(0,194,0);
					labelTopBarLand.transform.localScale(1,1.6,1);
					labelTopBarLand.resize = 1;
					labelTopBarLand.maxLines = 1;
					labelTopBarLand.dontIgnoreLocalScale = true;
					labelTopBarLand.Start();
					labelTopBarLand.init(true);
					onScreenTargets.push(labelTopBarLand);

					var topBarLandBkgTransform = localizationRoot.transform.Find("GUI_mobile/Utils/GUIArranger/UpLeft/Up");
					if (topBarLandBkgTransform != null)
					{
						var newObj = instantiate(topBarLandBkgTransform.gameObject);
						newObj.SetActive(false);
						newObj.transform.SetParent(topBarLandTransform.parent, false);
						newObj.SetActive(true);
						newObj.SetActive(false);
						var topBarLandBkgSprite = newObj.GetComponent(UISprite);
						topBarLandBkgSprite.width = 700;
						topBarLandBkgSprite.height = 60;
						if (isRK)
							topBarLandBkgSprite.transform.localPosition(0, 204, 0);
						else
							topBarLandBkgSprite.transform.localPosition(0, 194, 0);
						topBarLandBkgSprite.transform.localScale(1,1.6,1);
						topBarLandBkgSprite.anchorX = 0.5;topBarLandBkgSprite.anchorY = 0.5;topBarLandBkgSprite.color.r = 0;topBarLandBkgSprite.color.g = 0;topBarLandBkgSprite.color.b = 0;topBarLandBkgSprite.color.a = 0.6;
						topBarLandBkgSprite.Start();
						onScreenTargets.push(topBarLandBkgSprite);
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_BetChanged, UpdateOnScreenWarning, this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_ChangeVSGameState, OnChangeGameState, this);
			XT.RegisterCallbackEvent(Vars.Evt_DataToCode_Pressed_Spin, Consume, this);
			XT.RegisterCallbackEvent(Vars.Evt_DataToCode_StartAutoplay, Consume, this);
		}
		if (GameEvents["evtXTRegisterCallbacks"] != null)
			EventManager.AddHandler(GameEvents.evtXTRegisterCallbacks, function() { XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this); }, this);
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
	interval: 50
});

UHTPatch({
	name: "PatchDefaultBetClamp",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		
		if (UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs") != 0)
			return;

		var oCCVACB = CoinManager.ComputeCoinValuesAndCurrentBet;
		CoinManager.ComputeCoinValuesAndCurrentBet = function(betsFromServer, lastBet, defaultBet)
		{
			var oDefaultBet = defaultBet;
			oCCVACB.apply(this, arguments);
			if (CoinManager.defaultBet < oDefaultBet)
				if (lastBet > XT.GetDouble(Vars.MaxTotalBetFromServer) * 1000 / XT.GetInt(Vars.LinesForMinBet) / 1000)
				{
					var newBet = XT.GetDouble(Vars.MinTotalBetFromServer) * 1000 / XT.GetInt(Vars.LinesForMinBet) / 1000;
					CoinManager.SetDesiredBet(newBet);
					CoinManager.SetDefaultBet(newBet);
				}
		};
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchRUM",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if ((location.hostname.indexOf(".gp16.") == -1) && (location.hostname.indexOf(".prerelease-env.biz") == -1) && (!IsRequired("RUM")))
			return;

		var scriptH = document.createElement("script");
		scriptH.innerHTML =
		`
		// Initialize Faro when the main bundle loads
		window.initFaro = () => {
			window.GrafanaFaroWebSdk.initializeFaro({
				app: {
					name: 'frontend',
					version: '1.0.0',
				},
				trackResources: false,
				enablePerformanceInstrumentation: false,
				transports: [
					new window.GrafanaFaroWebSdk.FetchTransport({
						url: 'https://clctr.ltguevmavv.com/collect',
						// /{app-key},

						// Optional, if your receiver requires an API key
						apiKey: 'RSIlypo2lYVqM6b0krue2BsezYg6XBvm',

						// Optional, if you want to customize how many requests to buffer
						//bufferSize: 10,

						// Optional, if you want to customize how many requests to run in parallel
						//concurrency: 5,

						// Optional, if you want to customize how long to wait before trying to resend the data
						//defaultRateLimitBackoffMs: 1000,

						// Optional, if you want to customize the fetch options
						//requestOptions: {
						//headers: {
						//'My-Header': 'My Header Value',
						//},
						//},
					})
				],
				instrumentations: [
					...window.GrafanaFaroWebSdk.getWebInstrumentations({
						captureConsole: false,
					})
				 ],
			});
			window.faro.api.getSession().attributes.envId=(UHT_GAME_CONFIG_SRC.environmentId | 0).toString();
			window.GrafanaFaroWebSdk.faro.api.pushMeasurement(
				{
					type: 'CustomLoadingTracker',
					values:
					{
						value: 1
					},
				},
				{
					context: 
					{
						category: "uht_loading",
						symbol: URLGameSymbol,
						action: "_0_game_icon_clicked",
					}
				}
			);
		};

		// Dynamically add the tracing instrumentation when the tracing bundle loads
		//window.addTracing = () => {
		//	window.GrafanaFaroWebSdk.faro.instrumentations.add(new window.GrafanaFaroWebTracing.TracingInstrumentation());
		//};
		`;
		document.head.appendChild(scriptH);

		var scriptB = document.createElement("script");
		scriptB.src="https://unpkg.com/@grafana/faro-web-sdk@^1.0.0/dist/bundle/faro-web-sdk.iife.js";
		scriptB.onload=function()
		{
			window.initFaro();
			//var script2 = document.createElement("script");
			//script2.src="https://unpkg.com/@grafana/faro-web-tracing@^1.0.0/dist/bundle/faro-web-tracing.iife.js";
			//script2.onload=window.addTracing;
			//document.body.appendChild(script2);
		}
		document.body.appendChild(scriptB);

	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
	interval: 1
});

UHTPatch({
	name: "PatchBBB",
	ready: function()
	{
		return (window["BBB_Layout"] != undefined);
	},
	apply: function()
	{
		if (!IsRequired("BBB"))
			return;

		var isMini = window["UHT_GAME_CONFIG_SRC"]["minimode"] == '1';
		if(!isMini)
		{
			if (window["FreeSpinsPurchaseManager"])
				window["FreeSpinsPurchaseManager"].prototype.EnoughMoney = function() { return true; }
	
			if (window["FeaturePurchaseManager"])
				window["FeaturePurchaseManager"].prototype.EnoughMoney = function() { return true; }
	
			if (window["FeaturePurchaseV2"])
				window["FeaturePurchaseV2"].prototype.EnoughMoney = function() { return true; }
	
			if (window["FeaturePurchaseManager_GRM"])
				window["FeaturePurchaseManager_GRM"].prototype.EnoughMoney = function() { return true; }
	
			if (window["FeaturePurchaseManager_BK"])
				window["FeaturePurchaseManager_BK"].prototype.EnoughMoney = function() { return true; }
		}
		
		BonusBuyBlack.prototype.OnUpdateButtonUp = function(unused)
		{
			if (!XT.GetBool(Vars.MaxBetAndCoinValueReached))
				for(var b = 0; b < this.betUp_btnEnabler.length; b++) 
					this.betUp_btnEnabler[b].EnableButton();
			else
				for(var b = 0; b < this.betUp_btnEnabler.length; b++) 
					this.betUp_btnEnabler[b].DisableButton();
		}

		BonusBuyBlack.prototype.OnUpdateButtonDown = function(unused)
		{
			if (!XT.GetBool(Vars.MinSmallBetReached))
				for(var b = 0; b < this.betDown_btnEnabler.length; b++) 
					this.betDown_btnEnabler[b].EnableButton();
			else
				for(var b = 0; b < this.betDown_btnEnabler.length; b++) 
					this.betDown_btnEnabler[b].DisableButton();
		}

		
		BBB_Option.prototype.ConfirmBuy = function()
		{
			BonusBuyBlack.featureBought = true;
			XT.TriggerEvent(Vars.Evt_DataToCode_UnblockSpin);
			BonusBuyBlack.instance.spinIsBlocked = false;
			this.buyCat.Stop();
			this.buyCat.Start();
		}
		
		BBB_Layout.prototype.Open = function(/**Array<BBB_OptionInfo>*/ info)
		{
			this.DeselectAll();
			this.gameObject.SetActive(true);

			this.bottomBar.SetActive(true);
			this.bottomBar.transform.localPosition(0, this.bottomBarPosY, 0);
			if (this.bottomBarSprite != null)
				this.bottomBarSprite.width = this.bottomBarSpriteWidth;

			for (var o=0; o<this.optionsNumber; o++)
				this.options[o].UpdateInfo(info[o]);

			//Taking first one as cheapest
			this.bottomBarText.text = info[0].bottomText.text;
			if ((UHT_GAME_CONFIG.LANGUAGE != "en") && (UHT_GAME_CONFIG.LANGUAGE != "id"))
			{
				if (this.bottomBarText.fontName != info[0].bottomText.fontName)
				{
					this.bottomBarText.fontName = info[0].bottomText.fontName;
					this.bottomBarText.Prepare();
				}
			}
			this.bottomBarValue.SetValueManually(XT.GetDouble(Vars.MinTotalBetFromServer));
		}
		
		UICamera.prototype.UpdateCamera = function()
		{
		    var hoveredCollider = null;
		    var skipGettingCollider = false;
		
		    if (this.cachedCamera.IsClippingInput())
		    {
		        var TL = new UHTMath.Vector3(-this.cachedCamera.extraCameraSettings.clipLeft, this.cachedCamera.extraCameraSettings.clipUp, 0.0);
		        var BR = new UHTMath.Vector3(this.cachedCamera.extraCameraSettings.clipRight, -this.cachedCamera.extraCameraSettings.clipDown, 0.0);
		
		        var TLW = this.gameObject.transform.transformPoint(TL);
		        var BRW = this.gameObject.transform.transformPoint(BR);
		
		        var TLS = this.cachedCamera.WorldToScreenPoint(TLW);
		        var BRS = this.cachedCamera.WorldToScreenPoint(BRW);
		
		        if (Input.mousePosition.x < TLS.x || Input.mousePosition.y < TLS.y || Input.mousePosition.x > BRS.x || Input.mousePosition.y > BRS.y)
		            skipGettingCollider = true;
		    }
		
		    if (!skipGettingCollider)
		        hoveredCollider = globalColliderInputManager.getHoveredCollider(this.cachedCamera.ScreenToWorldPoint(Input.mousePosition), this.eventReceiverMask);
		    if (ServerOptions.isReplay && Globals.InputBlocked && (hoveredCollider != null))
		        if (hoveredCollider["usedForReplay"] != true)
		            hoveredCollider = null;
		
		
		    if (Input.GetMouseButton(0))
		    {
		        this.mouseWasPressed = true;
		
		        if (Input.GetMouseButtonDown(0))
		        {
		            this.target = hoveredCollider;
		
		            if (this.target != null)
						if (!this.target["RedirectedClick"])
			                this.target.gameObject.SendMessage(UICamera.messagePress, true);
		
		            this.mousePosOnPress = new UHTMath.Vector3(Input.mousePosition);
		
		            this.mouseWasDragged = false;
		            this.mouseIsOverTarget = true;
		        }
		    }
		    else if (this.mouseWasPressed == true)
		    {
		        this.mouseWasPressed = false;
		
		        if (this.target != null)
		        {
		            this.target.gameObject.SendMessage(UICamera.messagePress, false);
		
		            if (hoveredCollider == this.target)
		            {
		                if (Input.lastUsedInputDeviceIsTouch == false)
		                    this.target.gameObject.SendMessage(UICamera.messageHover, true);
		
		                if (this.mouseWasDragged == false)
		                {
		                    var redirectClick = this.target["RedirectedClick"];
		                    if (redirectClick)
		                        redirectClick["RedirectedClick"](this.target);
		                    else
		                        this.target.gameObject.SendMessage(UICamera.messageClick);
		                }
		            }
		        }
		
		    }
		    else
		    {
		        if ((Input.lastUsedInputDeviceIsTouch == false) && (hoveredCollider != this.target))
		        {
		            if (this.target != null)
		            {
		                this.target.gameObject.SendMessage(UICamera.messageHover, false);
		            }
		
		            this.target = hoveredCollider;
		
		            if (this.target != null)
		            {
		                this.target.gameObject.SendMessage(UICamera.messageHover, true);
		            }
		        }
		    }
		
		    return (hoveredCollider != null);
		};

	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBigWinSkipTracking",
	ready: function()
	{
		return (window["ValueAnimatorWithBigWin"] != undefined);
	},
	apply: function()
	{
		var VAWBW_OFV = ValueAnimatorWithBigWin.prototype.OnFinalizeValue;
		ValueAnimatorWithBigWin.prototype.OnFinalizeValue = function()
		{
			if (this.gameObject.activeInHierarchy && this.isAnimating)
			{
				if (this.isJackPot)
				{
					if (this.curTime > XT.GetFloat(Vars.MinimumJackpotBigWinDuration))
						this.SendGASkipEvent();
				}
				else // was return in original if jackpot
				if (XT.GetInt(Vars.BigWinLevel) > 0)
					this.SendGASkipEvent()
				else
					this.SendGASkipEvent()
			}
			VAWBW_OFV.apply(this, arguments);
		};
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRaceWinnersV3",
	ready: function()
	{
		return (window["TournamentConnection"] != undefined);
	},
	apply: function()
	{
		TournamentConnection.prototype.ReloadRaceWinners = function()
		{
			var ids = [];
			for (var i = 0; i < this.promoHolders.length; ++i)
			{
				if (this.promoHolders[i].type != TournamentProtocol.PromoType.Race)
					continue;
				ids.push(this.promoHolders[i].id);
			}

			if (ids.length == 0)
			{
				this.raceWinnersTimer = 0;
				this.isReloadindRaceWinners = false;
				return;
			}

			var req = new ServerRequest();
			req.Url = this.raceWinnersURL.replace("/v2/winners", "/v3/winners");
			req.Handler = this.raceWinnersReloadedHandler;
			req.PostData = "{\"raceIds\":[" + ids.join(",") + "]}";
			req.ContentType = "application/json";
			RequestManager.AddRequest(req);
		};
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchJackpotPlayDesktopPromoBlackBands",
	ready: function()
	{
		return (window["JackpotModule"] != undefined);
	},
	apply: function()
	{
		var oJM_XTRC = JackpotModule.prototype.XTRegisterCallbacks;
		JackpotModule.prototype.XTRegisterCallbacks = function()
		{
			oJM_XTRC.apply(this, arguments);
			if (!Globals.isMobile)
				if (window["BlackBandsArranger"] != undefined)
				{
					var bba = globalRuntime.sceneRoots[1].GetComponentsInChildren(BlackBandsArranger,true);
					if (bba.length != null)
						bba[0].gameObject.SetActive(false);
				}
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFastBigWin",
	ready: function()
	{
		return ((window["CoinCounter"] != undefined) && (window["CoinCounter"].prototype.ComputeTargetBigWinLevel != undefined));
	},
	apply: function()
	{
		if (IsRequired("FBW"))
		{
			var oCC_XTRC = CoinCounter.prototype.XTRegisterCallbacks;
			CoinCounter.prototype.XTRegisterCallbacks = function()
			{
				oCC_XTRC.apply(this, arguments);
				this.secondsToCountOneTotalBet *= 0.1;
			}
			
			var oCC_CTBWL = CoinCounter.prototype.ComputeTargetBigWinLevel;
			CoinCounter.prototype.ComputeTargetBigWinLevel = function(totalWin, totalBet)
			{
				oCC_CTBWL.apply(this, arguments);
				if (this.currentSettings.coinCounterType == CoinCounterType.IndividualBigWinSounds && totalWin > 0)
					this.secondsToCountOneTotalBet *= 0.1;
			}
			
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchMaxBetReached",
	ready: function()
	{
		return ((window["BetLevelV2"] != undefined) || (window["BetLevelManager"] != undefined));
	},
	apply: function()
	{
		if (window["BetLevelV2"] != undefined)
		{
			var oBLV2_OBC = BetLevelV2.prototype.OnBetChanged;
			BetLevelV2.prototype.OnBetChanged = function()
			{
				oBLV2_OBC.apply(this, arguments);
				if (this.betLevelSettings != null && this.betLevelSettings.betLevelIndex != 0)
					if (XT.GetBool(Vars.FromServer_AllowCoins))
						if (CoinManager.instance.GetSmartIncreasedBet(false) * XT.GetInt(Vars.BetToTotalBetMultiplier) > XT.GetDouble(Vars.ExplicitMaxTotalBetFromServer+"AB"))
							XT.SetBool(Vars.MaxBetAndCoinValueReached, true);
			}
		}
		if (window["BetLevelManager"] != undefined)
		{
			var oBLM_OBC = BetLevelManager.prototype.OnBetChanged;
			BetLevelManager.prototype.OnBetChanged = function()
			{
				oBLM_OBC.apply(this, arguments);
				if (this.betLevelSettings != null && this.betLevelSettings.betLevelIndex != 0)
					if (XT.GetBool(Vars.FromServer_AllowCoins))
						if (CoinManager.instance.GetSmartIncreasedBet(false) * XT.GetInt(Vars.BetToTotalBetMultiplier) > XT.GetDouble(Vars.ExplicitMaxTotalBetFromServer+"AB"))
							XT.SetBool(Vars.MaxBetAndCoinValueReached, true);
			}
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchVSProtocolParserParseMoneySymbolData",
	ready: function()
	{
		return ((window["VSProtocolParser"] != undefined) && (window["VSProtocolParser"]["ParseMoneySymbolData"] != undefined));
	},
	apply: function()
	{
		if (window["UHT_GAME_CONFIG"]["GAME_SYMBOL"].indexOf("vs20clustcol") != 0)
			return;
		
		var oVSPP_PMSD = VSProtocolParser.ParseMoneySymbolData;
		VSProtocolParser.ParseMoneySymbolData = function(source)
		{
			var result = oVSPP_PMSD.apply(this, arguments);

			if (result != null)
			{
				var collectSymbolPresent = (source["mo_c"] == "1");
				var allChests = false;
				if (source.s != null)
				{
					allChests = true;
					var sList = source.s.split(",");
					for (var i=0; i<sList.length; i++)
					{
						if (sList[i] == "11")
							collectSymbolPresent = true;
						if (sList[i] != "10")
							allChests = false;
					}
				}
				if ((result.currentValues != null) && (result.currentSymbolsLook != null) && (collectSymbolPresent || allChests))
					for (var sum=0, i=0; i<result.currentValues.length; i++)
						if (result.currentSymbolsLook[i] == "v")
						{
							sum += result.currentValues[i]
							if ((result.currentValues[i] <= 0) || (sum > 2147483647))
								result.currentValues[i] = result.currentValues["visual"]["animation"];
						}
			}		
			return result;
		};
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchMoneyAndCoinsSwitcher",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
		if (localizationRoot == null)
			return;
		var moneyAndCoin = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/BottomBar/AnchoredMiddle/MoneyAndCoinsSwitcher");
		if (moneyAndCoin != null)
		{
			moneyAndCoin.localPosition(0, 120, -351);
			var boxCollider = moneyAndCoin.GetComponent(Collider);
			if (boxCollider != null)
			{
				boxCollider.size = new UHTMath.Vector3(1777, 190, 1);
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

var metaIframe = null;
var noMeta = false;

UHTPatch({
	name: "PatchNewLobbyMETA",
	ready: function()
	{		
		if(isStandalone)
			return true;
		else
			return (window["MenuController"] != null);
	},
	apply: function()
	{
		var gameConfig;
		var gameSymbol;

		var bkupSendToGame = window.sendToGame;
		if(isStandalone)
		{
			window.sendToGame = function(json)
			{
				var parsed = JSON.parse(json);
				if (typeof parsed.args.config == "string")
					gameConfig = JSON.parse(parsed.args.config);
				else
					gameConfig = parsed.args.config

				window["UHT_GAME_CONFIG_SRC"] = gameConfig;
				gameSymbol = URLGameSymbol;
				window.sendToGame = bkupSendToGame;
			}
			
			sendToAdapter(JSON.stringify({
				common: "EVT_GET_CONFIGURATION",
				type: "html5"
			}));			
		}
		else if (UHT_GAME_CONFIG_SRC.lobbyVersion == 'V3')
		{
			gameConfig = UHT_GAME_CONFIG_SRC;
			gameSymbol = UHT_GAME_CONFIG.GAME_SYMBOL;
		}
		else
		{
			noMeta = true;
			return;
		}
		
		
		var metaContainer = document.createElement("div");
		metaContainer.style.width = "100%";
		metaContainer.style.height = "100%";
		metaContainer.style.position = "absolute";
		metaContainer.style.top = 0;
		metaContainer.style.bottom = 0;
		metaContainer.style.left = 0;
		metaContainer.style.right = 0;
		metaIframe = document.createElement("iframe");
		metaIframe.style.zIndex = 696969;
		metaIframe.style.position = "absolute";
		metaIframe.style.border = 0;
		metaIframe.style.width = "100%";
		metaIframe.style.height = "100%";
		metaIframe.style.top = 0;
		metaIframe.style.bottom = 0;
		metaIframe.style.left = 0;
		metaIframe.style.right = 0;
		metaIframe.name = "lobby_iframe";
		
		metaIframe.style.pointerEvents = "none"
		

		var OpenLobby = function()
		{
			metaIframe.contentWindow.postMessage({group:'common', name:'openLobby'}, "*");
			metaIframe.style.pointerEvents = "auto"
		}

		if(isStandalone)
		{
			metaIframe.onload = OpenLobby;
		}
		else
		{
			metaIframe.onload = function ()
			{
				/*var frameDocument = metaIframe.contentDocument;

				var button = frameDocument.createElement("button");
				button.innerHTML = "TEST";
				frameDocument.body.appendChild(button);
				button = frameDocument.createElement("button");
				button.innerHTML = "TEST";
				frameDocument.body.appendChild(button);
				
				var events = ['mousedown','touchstart','mouseup','mouseupoutside','touchend','touchendoutside','mousemove','touchmove'];
				for (var i=0; i<events.length; i++)
					frameDocument.addEventListener(events[i], eventDispatcher, true);
				
				function eventDispatcher(e)
				{
					if (e.target === frameDocument.body)
					{
						var newEvent = new e.constructor(e.type, e);
						document.dispatchEvent(newEvent);
					}
				}
				*/
				/*document.addEventListener("mousemove", onMouseMove, true);
				frameDocument.addEventListener("mousemove", onMouseMove, true);

				//document.addEventListener("touchstart", onMouseMove, true);
				//frameDocument.addEventListener("touchstart", onMouseMove, true);

				function onMouseMove(e)
				{
					let coord;
					if (e.currentTarget === document)
					{
						coord =
						{
							x: e.pageX - metaIframe.offsetLeft,
							y: e.pageY - metaIframe.offsetTop,
						};
					}
					else
					{
						coord = { x: e.clientX, y: e.clientY };
					}

					var el = frameDocument.elementFromPoint(coord.x, coord.y);
					// you can compare to your own element if needed
					metaIframe.style.pointerEvents = !el || el === frameDocument.body ? "none" : "auto";
				}
				
				function onTouchStart(e)
				{
					let coord;
					if (e.currentTarget === document)
					{
						coord =
						{
							x: e.pageX - metaIframe.offsetLeft,
							y: e.pageY - metaIframe.offsetTop,
						};
					}
					else
					{
						coord = { x: e.clientX, y: e.clientY };
					}

					var el = frameDocument.elementFromPoint(coord.x, coord.y);
					// you can compare to your own element if needed
					metaIframe.style.pointerEvents = !el || el === frameDocument.body ? "none" : "auto";
				}
				*/
			}
		}

		var mgckey = encodeURIComponent(gameConfig.mgckey);
		var ingameLobbyApiURL = encodeURIComponent(gameConfig.ingameLobbyApiURL);	
		//var src = `${ServerOptions.serverUrl}/gs2c/common/lobby/v1/apps/lobby/1.0.0/meta.html?mgckey=${mgckey}&symbol=${gameSymbol}&language=${gameConfig.lang}&currency=${gameConfig.currency}&region=${gameConfig.region}&ingameLobbyApiURL=${ingameLobbyApiURL}&vendor=slots`;
		var src = new URL(window.origin + UHT_CONFIG.GAME_URL).origin + `/gs2c/common/lobby/v1/apps/lobby/1.0.0/meta.html?mgckey=${mgckey}&symbol=${gameSymbol}&language=${gameConfig.lang}&currency=${gameConfig.currency}&region=${gameConfig.region}&ingameLobbyApiURL=${ingameLobbyApiURL}&vendor=slots`;

		if(gameConfig["currencyOriginal"])
			src += `&currencyOriginal=${gameConfig.currencyOriginal}`;
		if(gameConfig["lobbyFilter"])
			src += `&lobbyFilter=${gameConfig.lobbyFilter}`;
		if(gameConfig["lobbyGameSymbol"])
			src += `&lobbyGameSymbol=${gameConfig.lobbyGameSymbol}`;

		IsRequired("UNUSED", false, false);
		if(gameConfig.jurisdictionRequirements)
			if(gameConfig.jurisdictionRequirements.length > 0)
			{
				var req = encodeURIComponent(gameConfig.jurisdictionRequirements);
				src += `&requirements=${req}`;
			}

		if(gameConfig["styleName"] != undefined)
		{
			var styleName = encodeURIComponent(gameConfig["styleName"]);
			src += `&stylename=${styleName}`;
		}

		metaIframe.src = src;
		metaContainer.appendChild(metaIframe);
		document.body.appendChild(metaContainer);

		if(!isStandalone)
		{
			MenuController.prototype.ButtonClicked = function(/**number*/ index)
			{
				var fullscreenDivs = document.getElementsByClassName("fullscreen-reserve");
				if (fullscreenDivs.length > 0)
					fullscreenDivs[0].remove();
				fullscreenDivs = document.getElementsByClassName("fullscreen-root-hidden");
				if (fullscreenDivs.length > 0)
					fullscreenDivs[0].remove();

				var btnType = this.internalOrder[index];

				if (btnType == MenuButtonType.Tournament || btnType == MenuButtonType.PrizeDrop)
				{
					var curType = PromotionsHelper.GetPromotionType(XT.GetString(TournamentVars.SelectedTournamentID));
					var targetType = btnType == MenuButtonType.Tournament ? TournamentProtocol.PromoType.Tournament : TournamentProtocol.PromoType.Race;
					XT.SetInt(TournamentVars.MenuPromotionType, targetType);

					if (curType != targetType)
						this.SelectPromotionOfType(targetType);
				}

				if (btnType == MenuButtonType.Lobby)
				{
					OpenLobby();
					metaIframe.contentWindow.postMessage({group:'common', name:'updateBalance', payload: {amount: XT.GetDouble(Vars.BalanceReceived)}}, "*");
					XT.TriggerEvent(InterfaceVars.Evt_CodeToData_InterfaceWindowOpen);

					if(this.OnHideNewGameNotification != undefined)
						this.OnHideNewGameNotification();
					
				}

				this.click[this.order.indexOf(btnType)].Start();
			};

			//messages will be processed twice if UHTInterfaceBOSS.enabled == true
			var OnReceiveMessage = function(event)
			{
				if (event.data.event == "setMuteFromLobby")
				{
					if (event.data.payload != undefined)
					{
						if (event.data.payload.muted == true)
						{
							if (XT.GetObject(Vars.SoundState).gameSoundIsOn)
								UHTInterfaceBOSS.soundCommands.push(false);
						}
						else
						{
							if (!XT.GetObject(Vars.SoundState).gameSoundIsOn)
								UHTInterfaceBOSS.soundCommands.push(true);
						}
					}
				}
			};
		window.addEventListener("message", OnReceiveMessage, false);
		}

		window.addEventListener("message", function(message)
		{
			if(message.data == undefined) return;
			if(message.data.group == "meta")
			{
				var data = message.data;
				if(data.name == "readyToReceive")
				{
					if(!isStandalone)
					{
						metaIframe.contentWindow.postMessage({group:'lobby', name:'hostInfo', 
															  payload: { id: URLGameSymbol, host: 'slot'}}, "*");

						//var mgr = XT.GetObject(Vars.SoundManagerObject);
						//mgr.MuteMusic(true);
						
					}
				}
				else if(data.name == "lobbyLoaded")
				{
					if(isStandalone)
					{
						var reloadBalanceUrl = window.location.protocol + '//' + window.location.hostname + gameConfig.RELOAD_BALANCE + `?mgckey=${mgckey}`;
						
						var ReloadBalance = function()
						{
							var xhr = new XMLHttpRequest();
							xhr.open("GET", reloadBalanceUrl, true);
							xhr.onreadystatechange = function()
							{
								if (xhr.readyState == 4 && xhr.status == 200)
								{
									var nameValues = String(xhr.responseText).split('&');
									for(i in nameValues)
									{
										var nameVal = nameValues[i].split('=');
										if(nameVal[0] == 'balance')
										{
											metaIframe.contentWindow.postMessage({group:'common', name:'updateBalance', payload: {amount: nameVal[1]}}, "*");
										}
									}
									
								}
							}
							
							xhr.send(null);

							setTimeout(ReloadBalance, 30000);
						}
						
						ReloadBalance();
					}

				}
				else if(data.name == "open" && data.payload)
				{
					var url = data.payload.url;
					if(url)
					{
						location.assign(url);
					}
				}
				else if(data.name == "close")
				{
					metaIframe.style.pointerEvents = "none";
				}
			}
		}, false);
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchUpdateBalanceToMeta",
	ready:function()
	{
		return (metaIframe!= undefined && window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
			if(isStandalone)
				return;

			var OnBalanceUpdated = function()
			{
				metaIframe.contentWindow.postMessage({group:'common', name:'updateBalance', payload: {amount: XT.GetDouble(Vars.BalanceReceived)}}, "*");
			}
			
			XT.RegisterCallbackEvent(Vars.Evt_FromServer_BalanceUpdated, OnBalanceUpdated, this);
			XT.RegisterCallbackEvent(Vars.Evt_FromServer_BalanceUpdatedFromResult, OnBalanceUpdated, this);
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return !isStandalone && !noMeta;
	}
});

if(isStandalone)
{
	UHTPatch = function(info){};
}

UHTPatch({
	name: "PatchUpdateSoundToMeta",
	ready:function()
	{
		return (metaIframe!= undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if(isStandalone)
			return;
		
		var lastPayload = -1;
		var OnSoundChanged = function(param)
		{
			var volume = XT.GetFloat(Vars.SoundVolume);
			var soundState = XT.GetObject(Vars.SoundState);
			if(!soundState.gameSoundIsOn)
				volume = 0;
			else if(volume < 0) volume = 0;
			else if(volume > 1) volume = 1;
			
			if(lastPayload == volume)
				return;

			metaIframe.contentWindow.postMessage({group:'common', name:'sound', payload: {masterVolume: volume}}, "*");
			lastPayload = volume;
		}
	
		XT.RegisterCallbackEvent(Vars.Evt_Internal_SoundStateChanged, OnSoundChanged, this);
		XT.RegisterCallbackFloat(Vars.SoundVolume, OnSoundChanged, this);
	},
	retry:function()
	{
		return !isStandalone && !noMeta;
	}
});

UHTPatch({
	name: "PatchMultiLobbyV3",
	ready: function()
	{
        return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["MultiLobbyConnection"] != undefined 
						&& window["MenuController"] != null && window["TournamentConnection"] != undefined);
	},
	apply: function()
	{
		if(UHT_GAME_CONFIG_SRC["lobbyVersion"] == undefined || UHT_GAME_CONFIG_SRC["lobbyVersion"] != 'V3')
			return;

        var tournamentReloadedCalledOnce = false;
        var tc_OTR = TournamentConnection.prototype.OnTournamentsReloaded;
        TournamentConnection.prototype.OnTournamentsReloaded = function(/**string*/ param, /**number*/ statusCode)
        {
            tournamentReloadedCalledOnce = true;
            tc_OTR.apply(this, arguments);

            if(!this.hasUpdates)
			    XT.SetObject(LobbyVars.LobbyCategorySymbols, ["anything"]); //to call UpdateButtons and enable lobby button
        };

        var mc_UB = MenuController.prototype.UpdateButtons;        
        MenuController.prototype.UpdateButtons = function()
        {
            if(tournamentReloadedCalledOnce)
                this.isEnabled[this.order.indexOf(MenuButtonType.Lobby)] = true;
        
            mc_UB.apply(this, arguments);
        };

		var mlc_SC = MultiLobbyConnection.prototype.SetupCategories;
		MultiLobbyConnection.prototype.SetupCategories = function(/**boolean*/ loadTextures)
		{
			arguments[0] = false;
			mlc_SC.apply(this, arguments);
		}

	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchMissingChars",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
			if (localizationRoot == null)
				return;

			if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "tr" || window["UHT_GAME_CONFIG"]["LANGUAGE"] == "cs" || window["UHT_GAME_CONFIG"]["LANGUAGE"] == "ro")
			{
				if (!Globals.isMobile)
				{
					var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
					if (localizationRoot != undefined)
					{
						var frbTrans = localizationRoot.transform.Find("GUI/Interface/Windows/BonusRoundsWindows");
						if (frbTrans != null)
						{
							var labelToCopyFrom = localizationRoot.transform.Find("GUI/Tournament/Tournament/LocalizedLabels/LocalizedStartsInLabel_0");
							if (labelToCopyFrom != null)
							{
								labelToCopyFrom = labelToCopyFrom.GetComponentsInChildren(UILabel, true)[0];
								if (labelToCopyFrom == null)
									return;
							}
							else
								return;

							var labels = frbTrans.GetComponentsInChildren(UILabel, true);
							for (var i = 0; i < labels.length; i++)
							{
								labels[i].fontName = labelToCopyFrom.fontName;
								labels[i].init(true);
								labels[i].Prepare();
							}
						}
					}
				}
				else if (!Globals.isMini)
				{
					var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
					if (localizationRoot != undefined)
					{
						var pathsMobile = [
							"GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows",
							"GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows"
						];
						for (var i = 0; i < pathsMobile.length; i++)
						{
							var frbTrans = localizationRoot.transform.Find(pathsMobile[i]);
							if (frbTrans != null)
							{
								var labelToCopyFrom = localizationRoot.transform.Find("GUI_mobile/Tournament/TournamentArrangeable/Tournament/LocalizedLabels/LocalizedStartsInLabel_0");
								if (labelToCopyFrom != null)
								{
									labelToCopyFrom = labelToCopyFrom.GetComponentsInChildren(UILabel, true)[0];
									if (labelToCopyFrom == null)
										return;
								}
								else
									return;

								var labels = frbTrans.GetComponentsInChildren(UILabel, true);
								for (var j = 0; j < labels.length; j++)
								{
									labels[j].fontName = labelToCopyFrom.fontName;
									labels[j].init(true);
									labels[j].Prepare();
								}
							}
						}
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this, 6969);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchRKQuickSpin",
	ready: function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function()
	{
		if (!Globals.isMobile)
		{
			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
			if (localizationRoot != undefined)
			{
				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") == -1)
							return;
					}
				}

				var quickSpinTransform = localizationRoot.transform.Find("GUI/QuickSpinAnimator/QuickSpin");
				if (quickSpinTransform != null)
				{
					quickSpinTransform.gameObject.SetActive(true);
				}
			}
		}
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "JurisdictionMaxBet",
	ready: function()
	{
		return (window["VideoSlotsConnectionXTLayer"] != null);
	},
	apply: function()
	{
		var jMB = (new URLSearchParams(window.location.href)).get("jurMaxBet");
		if (jMB != null)
		{
			var oVSCXTL_RS = VideoSlotsConnectionXTLayer.prototype.RequirementsSetup;
			VideoSlotsConnectionXTLayer.prototype.RequirementsSetup = function ()
			{
				oVSCXTL_RS.apply(this, arguments);
				var jurMaxBetCents = jMB * 100;
				var oMaxBetCents = XT.GetInt(Vars.Jurisdiction_MaxBetCents);
				if ((oMaxBetCents == 0) || (jurMaxBetCents < oMaxBetCents))
					XT.SetInt(Vars.Jurisdiction_MaxBetCents, jurMaxBetCents);
			}
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchSHOXC_LIM100",
	ready: function()
	{
		return (window["JurisdictionShowXChance"] != undefined)
	},
	apply: function()
	{
		if (IsRequired("SHOXC_LIM100"))
		{
			var textDict = {
				en:["The max prize in this game is {0}","The max prize in this game is {0} with a chance to hit of 1 in {1}"],
				ar:["الجائزة القصوى في هذه اللعبة هي {0}","الجائزة القصوى في هذه اللعبة هي {0} مع فرصة لتسجيل 1 في {1}"],
				bg:["Максималната печалба в тази игра е {0}","Максималната печалба в тази игра е {0}, а вероятността да бъд спечелена е {1}"],
				cs:["Maximální výhra v této hře je {0}","Maximální výhra v této hře je {0} s šancí na výhru 1 ku {1}"],
				da:["Maks. præmie i dette spil er {0}","Maks. præmie i dette spil er {0} med en chance for at ramme på 1 ud af {1}"],
				de:["Der max. Preis in diesem Spiel beträgt {0}","Der max. Preis in diesem Spiel beträgt {0}, mit einer Chance auf 1 in {1}"],
				el:["Το μέγιστο έπαθλο σε αυτό το παιχνίδι είναι {0}","Το μέγιστο έπαθλο σε αυτό το παιχνίδι είναι {0} με πιθανότητα να πετύχετε 1 σε {1}"],
				es:["El premio máx de este juego es {0}","El premio máx de este juego es {0} con una posibilidad de conseguirlo de 1 sobre {1}"],
				et:["Selle mängu maksimumauhind on {0}","Selle mängu maksimumauhind on {0} ja maksimumauhinna võitmise tõenäosus on 1:{1}"],
				fa:["حداکثر جایزه در این بازی {0} است","حداکثر جایزه در این بازی {0} با شانس نمایان شدن 1 در {1} است."],
				fi:["Tämän pelin enimmäispalkinto on {0}","Tämän pelin enimmäispalkinto on {0}, ja osuman todennäköisyys on 1:{1}"],
				fr:["Le prix max dans ce jeu est de{0}","Le prix max dans ce jeu est de {0} avec des chances d'être obtenu de 1 sur {1}"],
				hr:["Maks. nagrada u ovoj igri iznosi {0}","Maks. nagrada u ovoj igri iznosi {0} s mogućnosti da dobijete 1 u {1}"],
				hu:["Ebben a játékban a max. nyeremény {0}","Ebben a játékban max. nyeremény {0}, a kipörgetés esélye 1 az {1}-hez"],
				hy:["Այս խաղում առավելագույն մրցանակն է {0}","Այս խաղում առավելագույն մրցանակն է{0} ՝ {1}-ից 1-ն ընկնելու հավանականությամբ։"],
				id:["hadiah maksimum di permainan ini adalah {0}","Hadiah maksimum di permainan ini adalah {0} dengan peluang meraih 1 di {1}"],
				it:["Il premio massimo in questo gioco è pari a {0}","Il premio massimo in questo gioco è pari a {0} con una possibilità di ottenere 1 in {1}"],
				ja:["このゲームの最高賞金は{0}です。","このゲームの最高賞金は{0}で、当たる確率は{1}分の1です"],
				ka:["მაქსიმალური პრიზი ამ თამაშში შეადგენს {0}-ს","მაქსიმალური პრიზი ამ თამაშში შეადგენს {0}-ს, მოგების ალბათობა — {1}"],
				ko:["게임 최대 상금은 {0}","게임 최대 상금은 {0}, {1}에서 1 히트 가능"],
				lt:["Maksimalus šio žaidimo prizas yra {0}","Maksimalus šio žaidimo prizas yra {0}, o tikimybė išsukti yra 1 iš {1}"],
				lv:["Maks. balva šajā spēlē ir {0}","Maks. balva šajā spēlē ir {0} ar iespēju uzgriezt 1 no {1}"],
				ms:["Hadiah maks dalam permainan ini ialah {0}","Hadiah maks dalam permainan ini ialah {0} dengan peluang untuk meraih 1 dalam {1}"],
				nl:["De max prijs in deze game is {0}","De max prijs in deze game is {0} met een slaagkans van 1 op {1}"],
				no:["Maks gevinsten i dette spillet er {0}","Maks gevinsten i dette spillet er {0} med en 1 i {1} sjanse til å treffe"],
				pl:["Maksymalna nagroda w tej grze wynosi {0}","Maksymalna nagroda w tej grze wynosi {0} z szansą wygranej 1 na {1}"],
				pt:["O prémio máximo neste jogo é {0}","O prémio máximo neste jogo é {0}, com uma possibilidade de ser obtido de 1 em {1}"],
				ro:["The max prize in this game is {0}","The max prize in this game is {0} with a chance to hit of 1 in {1}"],
				ru:["Макс. приз в этой игре составляет {0}","Макс. приз в этой игре составляет {0} с шансом выпадения 1 в {1}"],
				sk:["Maximálna cena v thejto hre je {0}","Maximálna cena v tejto hre je {0} so šancou na výhru 1 ku {1}"],
				sr:["Maks. nagrada u ovoj igri je {0}","Maks. nagrada u ovoj igri je {0} sa šansom za dobijanje od 1 prema {1}"],
				sv:["Maxpriset i det här spelet är {0}","Maxpriset i det här spelet är {0} med en chans att träffa 1 på {1}"],
				th:["รางวัลสูงสุดในเกมนี้คือ {0}","รางวัลสูงสุดในเกมนี้คือ {0} โดยมีโอกาสที่จะปรากฏ 1 ใน {1}"],
				tr:["Bu oyundaki maks ödül {0}'tir","Bu oyundaki maks ödül {0}'tir ve {1}'de 1 denk gelme ihtimali vardır"],
				uk:["Макс. приз у цій грі становить {0}","Макс. приз у цій грі становить {0} з шансом випадання 1 в {1}"],
				vi:["Giải thưởng tối đa trong trò chơi này là {0}","Giải thưởng tối đa trong trò chơi này là {0} với cơ hội giành được là 1 trong {1}"],
				zh:["本游戏中的最大奖励为{0}","本游戏中的最大奖励为{0}，并有机会在{1}中出现1"],
				zt:["本遊戲中的最大獎勵為{0}","本遊戲中的最大獎勵為{0}，並有機會在{1}中出現1"]
			};

			var configOverrides = [
				{
				  "gameSymbols": [
					"vs20fruitsw_cv31"
				  ],
				  "configs": [
					{
					  "rtp": "95.5",
					  "max_rnd_win": 7300,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					      tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["ante"] = 95.49;
					  tempGameInfo["rtps"]["purchase"] = 95.45
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 95.5);
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 7,300x, with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
						es:`El premio máx de este juego es de 7.300x, con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						pt:`O prémio máximo nesse jogo é de 7.300x com uma taxa de acerto de 1 em 1.000.000.000 e pode ser obtido no jogo base`
					  }
					},
					{
					  "rtp": "96.51",
					  "max_rnd_win": 6600,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					      tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["ante"] = 96.48;
					  tempGameInfo["rtps"]["purchase"] = 96.51
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.49);
					  `,
					  "hideWinLimitPaytable" : true
					  ,
					  "customText" : {
						en:`The max prize in this game is 6,600x, with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
						es:`El premio máx de este juego es de 6.600x, con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						pt:`O prémio máximo nesse jogo é de 6.600x com uma taxa de acerto de 1 em 1.000.000.000 e pode ser obtido no jogo base`
					  }
					},
					{
					  "rtp": "96.6",
					  "max_rnd_win": 5900,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  dict["rtp"] = "96.51";
					  if (tempGameInfo["rtps"] == null)
					      tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["ante"] = 96.49;
					  tempGameInfo["rtps"]["purchase"] = 96.6
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.51);
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 5,900x, with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
						es:`El premio máx de este juego es de 5.900x, con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						pt:`O prémio máximo nesse jogo é de 5.900x com uma taxa de acerto de 1 em 1.000.000.000 e pode ser obtido no jogo base`
					  }
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs243lionsgold_cv33"
				  ],
				  "configs": [
					{
					  "rtp": "95.5",
					  "max_rnd_win": 3400,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 3400x, with a hitrate of 1 in 1,000,000,000 and can be achieved when choosing the 6 free spins option`,
						es:`El premio máx de este juego es de 3.400x, con una tasa de aparición de 1 en 1.000.000.000 y puede alcanzarse al elegir la opción de 6 tiradas gratis`,
					  }
					},
					{
					  "rtp": "96.5",
					  "max_rnd_win": 4100,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 4100x, with a hitrate of 1 in 1,000,000,000 and can be achieved when choosing the 20 free spins option`,
						es:`El premio máx de este juego es de 4.100x, con una tasa de aparición de 1 en 1.000.000.000 y puede alcanzarse al elegir la opción de 20 tiradas gratis`,
					  }
					},
				  ]
				},
				{
				  "gameSymbols": [
					"vswaysrhino_cv48"
				  ],
				  "configs": [
					{
					  "rtp": "94.69",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 166666667,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["ante_min"] = 94.59;
					  tempGameInfo["rtps"]["ante_max"] = 94.69;
					  tempGameInfo["rtps"]["purchase_min"] = 94.46;
					  tempGameInfo["rtps"]["purchase_max"] = 94.53;
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, 94.51);
					  XT.SetDouble(Vars.ReturnToPlayer, 94.55);
					  `,
					  "customText" : {
						en:`The max prize in this game is 20,000x, with a hitrate of 1 in 166,666,667 and can be achieved when choosing the 5 free spins with 10x starting multiplier option`,
						es:`El premio máx de este juego es de 20.000x, con una tasa de aparición de 1 en 166.666.667 y puede conseguirse al elegir la opción de 5 tiradas gratis con multiplicador inicial de 10x`,
						pt:`O prêmio máximo nesse jogo é de 20.000x com uma taxa de acerto de 1 em 1.666.666.667 e pode ser obtido ao escolher o modo de 5 rodadas grátis com opção multiplicadora inicial de 10x`
					  }
					},
					{
					  "rtp": "95.59",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 250000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["ante_min"] = 95.34;
					  tempGameInfo["rtps"]["ante_max"] = 95.47;
					  tempGameInfo["rtps"]["purchase_min"] = 95.47;
					  tempGameInfo["rtps"]["purchase_max"] = 95.55;
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, 95.54);
					  XT.SetDouble(Vars.ReturnToPlayer, 95.59);
					  `,
					  "customText" : {
						en:`The max prize in this game is 20,000x, with a hitrate of 1 in 250,000,000 and can be achieved when choosing the 5 free spins with 10x starting multiplier option`,
						es:`El premio máx de este juego es de 20.000x, con una tasa de aparición de 1 en 250.000.000 y puede conseguirse al elegir la opción de 5 tiradas gratis con multiplicador inicial de 10x`,
						pt:`O prêmio máximo nesse jogo é de 20.000x com uma taxa de acerto de 1 em 250.000.000 e pode ser obtido ao escolher o modo de 5 rodadas grátis com opção multiplicadora inicial de 10x`
					  }
					},
					{
					  "rtp": "96.58",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 200000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["ante_min"] = 96.47;
					  tempGameInfo["rtps"]["ante_max"] = 96.58;
					  tempGameInfo["rtps"]["purchase_min"] = 96.48;
					  tempGameInfo["rtps"]["purchase_max"] = 96.53
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, 96.48);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.53);
					  `,
					  "customText" : {
						en:`The max prize in this game is 20,000x, with a hitrate of 1 in 200,000,000 and can be achieved when choosing the 5 free spins with 10x starting multiplier option`,
						es:`El premio máx de este juego es de 20.000x, con una tasa de aparición de 1 en 200.000.000 y puede conseguirse al elegir la opción de 5 tiradas gratis con multiplicador inicial de 10x`,
						pt:`O prêmio máximo nesse jogo é de 20.000x com uma taxa de acerto de 1 em 200.000.000 e pode ser obtido ao escolher o modo de 5 rodadas grátis com opção multiplicadora inicial de 10x`
					  }
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs20kraken_cv42"
				  ],
				  "configs": [
					{
					  "rtp": "94.5",
					  "max_rnd_win": 5300,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "95.5",
					  "max_rnd_win": 5400,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "96.5",
					  "max_rnd_win": 5200,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs20sbxmas_cv40"
				  ],
				  "configs": [
					{
					  "rtp": "95.5",
					  "max_rnd_win": 7300,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					      tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["ante"] = 95.49;
					  tempGameInfo["rtps"]["purchase"] = 95.45
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 95.5);
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 7,300x, with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
						es:`El premio máx de este juego es de 7.300x, con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						pt:`O prémio máximo nesse jogo é de 7.300x com uma taxa de acerto de 1 em 1.000.000.000 e pode ser obtido no jogo base`
					  }
					},
					{
					  "rtp": "96.51",
					  "max_rnd_win": 6600,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					      tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["ante"] = 96.48;
					  tempGameInfo["rtps"]["purchase"] = 96.51
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.49);
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 6,600x, with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
						es:`El premio máx de este juego es de 6.600x, con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						pt:`O prémio máximo nesse jogo é de 6.600x com uma taxa de acerto de 1 em 1.000.000.000 e pode ser obtido no jogo base`
					  }
					},
					{
					  "rtp": "96.6",
					  "max_rnd_win": 5900,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  dict["rtp"] = "96.51";
					  if (tempGameInfo["rtps"] == null)
					      tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["ante"] = 96.49;
					  tempGameInfo["rtps"]["purchase"] = 96.6
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.51);
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 5,900x, with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
						es:`El premio máx de este juego es de 5.900x, con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						pt:`O prémio máximo nesse jogo é de 5.900x com uma taxa de acerto de 1 em 1.000.000.000 e pode ser obtido no jogo base`
					  }
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs25mustang_cv27"
				  ],
				  "configs": [
					{
					  "rtp": "95.54",
					  "max_rnd_win": 2100,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "96.53",
					  "max_rnd_win": 2100,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs4096bufking_cv41"
				  ],
				  "configs": [
					{
					  "rtp": "94.55",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 94.55
					  `,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "95.53",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 500000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 95.53
					  `,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "96.06",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 500000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 96.06
					  `,
					  "hideWinLimitPaytable" : true
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs20goldfever_cv59"
				  ],
				  "configs": [
					{
					  "rtp": "94.53",
					  "max_rnd_win": 10000,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 94.53
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 94.53);
					  `
					},
					{
					  "rtp": "95.54",
					  "max_rnd_win": 10000,
					  "max_rnd_hr": 500000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 95.54
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 95.54);
					  `
					},
					{
					  "rtp": "96.55",
					  "max_rnd_win": 10000,
					  "max_rnd_hr": 500000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					    tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 96.51
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, -1);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.55);
					  `
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs20xmascarol_cv59"
				  ],
				  "configs": [
					{
					  "rtp": "94.69",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 166666667,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["anteMin"] = 94.59;
					  tempGameInfo["rtps"]["anteMax"] = 94.69;
					  tempGameInfo["rtps"]["purchaseMin"] = 94.46;
					  tempGameInfo["rtps"]["purchaseMax"] = 94.53;
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, 94.51);
					  XT.SetDouble(Vars.ReturnToPlayer, 94.55);
					  `,
					  "customText" : {
						en:`The max prize in this game is 20,000x, with a hitrate of 1 in 166,666,667 and can be achieved when choosing the 5 free spins with 10x starting multiplier option`,
						es:`El premio máx de este juego es de 20.000x, con una tasa de aparición de 1 en 166.666.667 y puede conseguirse al elegir la opción de 5 tiradas gratis con multiplicador inicial de 10x`,
					  }
					},
					{
					  "rtp": "95.59",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 250000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["anteMin"] = 95.34;
					  tempGameInfo["rtps"]["anteMax"] = 95.47;
					  tempGameInfo["rtps"]["purchaseMin"] = 95.47;
					  tempGameInfo["rtps"]["purchaseMax"] = 95.55;
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, 95.54);
					  XT.SetDouble(Vars.ReturnToPlayer, 95.59);
					  `,
					  "customText" : {
						en:`The max prize in this game is 20,000x, with a hitrate of 1 in 250,000,000 and can be achieved when choosing the 5 free spins with 10x starting multiplier option`,
						es:`El premio máx de este juego es de 20.000x, con una tasa de aparición de 1 en 250.000.000 y puede conseguirse al elegir la opción de 5 tiradas gratis con multiplicador inicial de 10x`,
					  }
					},
					{
					  "rtp": "96.58",
					  "max_rnd_win": 20000,
					  "max_rnd_hr": 200000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["anteMin"] = 96.47;
					  tempGameInfo["rtps"]["anteMax"] = 96.58;
					  tempGameInfo["rtps"]["purchaseMin"] = 96.48;
					  tempGameInfo["rtps"]["purchaseMax"] = 96.53
					  `,
					  "gameInfoPayload":
					  `
					  XT.SetDouble(Vars.ReturnToPlayerMin, 96.48);
					  XT.SetDouble(Vars.ReturnToPlayer, 96.53);
					  `,
					  "customText" : {
						en:`The max prize in this game is 20,000x, with a hitrate of 1 in 200,000,000 and can be achieved when choosing the 5 free spins with 10x starting multiplier option`,
						es:`El premio máx de este juego es de 20.000x, con una tasa de aparición de 1 en 200.000.000 y puede conseguirse al elegir la opción de 5 tiradas gratis con multiplicador inicial de 10x`,
					  }
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs10bookoftut_cv48"
				  ],
				  "configs": [
					{
					  "rtp": "94.5",
					  "max_rnd_win": 5500,
					  "max_rnd_hr": 1000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 94.50;
					  `,
					},
					{
					  "rtp": "96.5",
					  "max_rnd_win": 5500,
					  "max_rnd_hr": 250000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 96.50;
					  if (dict["reel_set26"] != undefined)
					  {
							if (dict["reel_set26"] == "5,8,7,10,4,7,1,9,6,1,9,7,6,9,11,7,9,8,11,9,5,7,11,5,10,9,8,11,9,8,3,4,11,10,7,5,10,11,8,7,11,9,7,11,8,7,11,8,7,3,8,7,9,1,8,9,5,8,7,3,9,8,7,9,8,5,9,4,11,9,8,5,9,11,3,8,10,5,8,10,9,8,4,7,9,10,6,7,10,6,7,1,5,7,8,11,10,5,8,10,9,11~9,10,7,8,4,10,8,7,11,9,7,11,4,7,8,6,11,9,6,10,9,6,11,10,7,8,9,6,1,10,6,7,10,8,4,11,8,9,6,8,5,10,8,11,9,10,8,11,9,10,5,9,11,8,7,11,8,10,11,7,10,8,11,10,6,11,10,9,11,10,8,6,3,10,11,6,10,8,11,1,10,8,11,4,10,11,6,10,8,9,11,8,3,9,8,11,4,8,1,11,7,10~9,11,3,7,9,10,8,6,7,11,6,10,11,7,9,11,10,9,11,4,9,11,3,9,11,10,9,11,3,7,11,6,1,11,7,10,11,1,10,11,5,7,11,9,7,11,4,9,11,7,10,11,9,4,5,10,7,11,5,7,10,8,7,10,4,3,7,11,9,1,7,11,10,7,11,10,9,6,10,4,5,10,7,4,10,6,8,10,4,5,10,7,6,4,11,9,7,11,9~6,4,7,9,4,5,9,11,6,8,4,9,11,4,7,5,8,9,1,8,7,5,11,9,5,11,7,8,4,7,11,5,1,10,11,9,10,8,7,11,9,7,11,9,7,8,5,7,8,11,3,9,10,6,9,4,11,1,9,10,3,7,4,11,8,10,1,8,9,7,4,9,10,11,8,9,11,6,10,8,3,5,7,1,11,7,5,9,6,8,9,5,10,9,8,6,10~4,8,10,11,4,8,7,4,11,10,6,8,10,11,5,10,9,11,5,9,1,7,11,1,10,8,5,10,9,11,5,6,9,7,8,3,9,11,7,9,5,7,8,5,4,11,3,4,10,6,9,10,6,8,1,6,9,3,8,9,10,11,8,6,7,11,9,7,8,1,7,10,8,7,11,8,7,9,8,7,5,8,7,9,6,11,5,7,11,5,7,10,9,7,11,6,4,11")
							{
								targetConfig["max_rnd_hr"] = 500000000;
							}
					  }
					  `,
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs25pyramid_cv50"
				  ],
				  "configs": [
					{
					  "rtp": "94.5",
					  "max_rnd_win": 2100,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "95.5",
					  "max_rnd_win": 2200,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "96.5",
					  "max_rnd_win": 2300,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs7776aztec_cv44"
				  ],
				  "configs": [
					{
					  "rtp": "94.53",
					  "max_rnd_win": 6500,
					  "max_rnd_hr": 10000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "95.52",
					  "max_rnd_win": 6700,
					  "max_rnd_hr": 10000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "96.53",
					  "max_rnd_win": 6500,
					  "max_rnd_hr": 10000000000,
					  "hideWinLimitPaytable" : true
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vswaysdogs_cv53"
				  ],
				  "configs": [
					{
					  "rtp": "94.55",
					  "max_rnd_win": 12000,
					  "max_rnd_hr": 500000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 94.55
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 12,000x, with a hitrate of 1 in 500,000,000 and can be achieved when choosing the "raining wilds" free spins option`,
						es:`El premio máx de este juego es de 12.000x, con una tasa de aparición de 1 en 500.000.000 y puede conseguirse al elegir la opción tiradas gratis de wilds lluviosos`,
					  }
					},
					{
					  "rtp": "95.53",
					  "max_rnd_win": 12000,
					  "max_rnd_hr": 250000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 95.53
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 12,000x, with a hitrate of 1 in 333,333,333 and can be achieved when choosing the "sticky wilds" free spins option`,
						es:`El premio máx de este juego es de 12.000x, con una tasa de aparición de 1 en 333.333.333 y puede conseguirse al elegir la opción tiradas gratis de wilds pegajosos`,
					  }
					},
					{
					  "rtp": "96.55",
					  "max_rnd_win": 12000,
					  "max_rnd_hr": 333333333,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
					  	tempGameInfo["rtps"] = {};
				  	  tempGameInfo["rtps"]["purchase"] = 96.55
					  `,
					  "hideWinLimitPaytable" : true,
					  "customText" : {
						en:`The max prize in this game is 12,000x, with a hitrate of 1 in 200,000,000 and can be achieved when choosing the "raining wilds" free spins option`,
						es:`El premio máx de este juego es de 12.000x, con una tasa de aparición de 1 en 200.000.000 y puede conseguirse al elegir la opción tiradas gratis de wilds lluviosos`,
					  }
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs25scarabqueen_cv37"
				  ],
				  "configs": [
					{
					  "rtp": "90.02",
					  "max_rnd_win": 2700,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "95.5",
					  "max_rnd_win": 2600,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					},
					{
					  "rtp": "96.5",
					  "max_rnd_win": 2800,
					  "max_rnd_hr": 1000000000,
					  "hideWinLimitPaytable" : true
					}
				  ]
				},
				{
				  "gameSymbols": [
					"vs40wildwest_cv46"
				  ],
				  "configs": [
					{
					  "rtp": "94.53",
					  "max_rnd_win": 10000,
					  "max_rnd_hr": 100000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 94.53;
					  `,
					},
					{
					  "rtp": "95.56",
					  "max_rnd_win": 10000,
					  "max_rnd_hr": 100000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 95.56;
					  `,
					},
					{
					  "rtp": "96.51",
					  "max_rnd_win": 10000,
					  "max_rnd_hr": 100000000000,
					  "extraPayload": 
					  `
					  if (tempGameInfo["rtps"] == null)
						  tempGameInfo["rtps"] = {};
					  tempGameInfo["rtps"]["purchase"] = 96.51;
					  `,
					}
				  ]
				},
				{
					"gameSymbols": [
					  "vswayspizza_cv88"
					],
					"configs": [
				      {
						"rtp": "94.02",
						"max_rnd_win": 7200,
						"max_rnd_hr": 166666667,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "95.03",
						"max_rnd_win": 7200,
						"max_rnd_hr": 250000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.04",
						"max_rnd_win": 7200,
						"max_rnd_hr": 200000000,
						"hideWinLimitPaytable" : true
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs1600drago_cv50"
					],
					"configs": [
					  {
						"rtp": "94.50",
						"max_rnd_win": 10000,
						"max_rnd_hr": 1000000000
					  },
					  {
						"rtp": "95.50",
						"max_rnd_win": 10000,
						"max_rnd_hr": 1000000000
					  },
					  {
						"rtp": "96.50",
						"max_rnd_win": 10000,
						"max_rnd_hr": 1000000000
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs20wildparty_cv91"
					],
					"configs": [
					  {
						"rtp": "94.06",
						"customText" : {
							en:`The max prize in this game is 5000x and can be achieved when choosing the EXPANDING WILDS free spins option`,
							es:`El premio máximo de este juego es de 5.000x y puede alcanzarse al elegir la opción de tiradas gratis con WILDS EXPANSIVOS`,
							pt:`O prémio máximo deste jogo é de 5,000X e pode ser ganho ao escolher o modo "EXPANDING WILD" de jogadas grátis`
						  }
					  },
					  {
						"rtp": "95.03",
						"customText" : {
							en:`The max prize in this game is 5000x and can be achieved when choosing the EXPANDING WILDS free spins option`,
							es:`El premio máximo de este juego es de 5.000x y puede alcanzarse al elegir la opción de tiradas gratis con WILDS EXPANSIVOS`,
							pt:`O prémio máximo deste jogo é de 5,000X e pode ser ganho ao escolher o modo "EXPANDING WILD" de jogadas grátis`
						  }
					  },
					  {
						"rtp": "96.03",
						"customText" : {
							en:`The max prize in this game is 5000x and can be achieved when choosing the EXPANDING WILDS free spins option`,
							es:`El premio máximo de este juego es de 5.000x y puede alcanzarse al elegir la opción de tiradas gratis con WILDS EXPANSIVOS`,
							pt:`O prémio máximo deste jogo é de 5,000X e pode ser ganho ao escolher o modo "EXPANDING WILD" de jogadas grátis`
						  }
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs576wwrage_cv96"
					],
					"configs": [
					  {
						"rtp": "94.00",
						"max_rnd_win": 3300,
						"max_rnd_hr": 500000000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 3,300x with a hitrate of 1 in 500,000,000 and can be achieved on the base game',
									es:'El premio máx de este juego es de 3.300x con una tasa de aparición de 1 en 500.000.000 y se puede conseguir en el juego base',
								},
								{
									en:'The max prize in this game is 2,800x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game',
									es:'El premio máx de este juego es de 2.800x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3300)
						`,
						"customText" : {
							en:`The max prize in this game is 3,300x with a hitrate of 1 in 500,000,000 and can be achieved on the base game`,
							es:`El premio máx de este juego es de 3.300x con una tasa de aparición de 1 en 500.000.000 y se puede conseguir en el juego base`,
						}
					  },
					  {
						"rtp": "95.00",
						"max_rnd_win": 4300,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 4300)
						`,
						"customText" : {
							en:`The max prize in this game is 4,300x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
							es:`El premio máx de este juego es de 4.300x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						}
					  },
					  {
						"rtp": "96.00",
						"max_rnd_win": 3400,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3400)
						`,
						"customText" : {
							en:`The max prize in this game is 3,400x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game`,
							es:`El premio máx de este juego es de 3.400x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
						}
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs20fruitswx_cv99"
					],
					"configs": [
					  {
						"rtp": "94.51",
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 25,000X`,
							es:`El premio máx de este juego es 25.000X`,
							pt:`O prémio máximo deste jogo é de 25.000X`
						}
					  },
					  {
						"rtp": "95.52",
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 25,000X`,
							es:`El premio máx de este juego es 25.000X`,
							pt:`O prémio máximo deste jogo é de 25.000X`
						}
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs5ultra_cv56"
					],
					"configs": [
					  {
						"rtp": "90.63",
						"max_rnd_win": 1150,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "95.65",
						"max_rnd_win": 1200,
						"max_rnd_hr": 500000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.70",
						"max_rnd_win": 1150,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  }
					]
				  },
				  {
					"gameSymbols": [
					  "vs20trswild2_cv84"
					],
					"configs": [
					  {
						"rtp": "87.09",
						"customText" : {
							en:`The max prize in this game is 4,500x and can be achieved on the base game`,
							es:`El premio máx de este juego es de 4.500x y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é 4.500x e pode ser alcançado no jogo base`
						}
					  },
					  {
						"rtp": "94.24",
						"customText" : {
							en:`The max prize in this game is 4,500x and can be achieved on the base game`,
							es:`El premio máx de este juego es de 4.500x y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é 4.500x e pode ser alcançado no jogo base`
						  }
					  },
					  {
						"rtp": "95.12",
						"customText" : {
							en:`The max prize in this game is 4,500x and can be achieved on the base game`,
							es:`El premio máx de este juego es de 4.500x y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é 4.500x e pode ser alcançado no jogo base`
						  }
					  },
					  {
						"rtp": "96.51",
						"customText" : {
							en:`The max prize in this game is 4,500x and can be achieved on the base game`,
							es:`El premio máx de este juego es de 4.500x y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é 4.500x e pode ser alcançado no jogo base`
						  }
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs5magicdoor_cv100"
					],
					"configs": [
					  {
						"rtp": "94.53",
						"max_rnd_win": 5000,
						"max_rnd_hr": 125000000,
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 5,000x with a hitrate of 1 in 125,000,000 and can be achieved on the base game`,
							es:`El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 125.000.000 y se puede conseguir en el juego base`,
						}
					  },
					  {
						"rtp": "95.54",
						"max_rnd_win": 5000,
						"max_rnd_hr": 142857143,
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 5,000x with a hitrate of 1 in 142,857,143 and can be achieved on the base game`,
							es:`El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 142.857.143 y se puede conseguir en el juego base`,
						}
					  },
					  {
						"rtp": "96.55",
						"max_rnd_win": 5000,
						"max_rnd_hr": 111111111,
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 5,000x with a hitrate of 1 in 111,111,111 and can be achieved on the base game`,
							es:`El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 111.111.111 y se puede conseguir en el juego base`,
						}
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs10firestrike_cv37"
					],
					"configs": [
					  {
						"rtp": "94.50",
						"max_rnd_win": 27000,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "95.50",
						"max_rnd_win": 27000,
						"max_rnd_hr": 166666667,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.50",
						"max_rnd_win": 27000,
						"max_rnd_hr": 166666667,
						"hideWinLimitPaytable" : true
					  }
					]
				  },
				  {
					"gameSymbols": [
					  "vs1masterjoker_cv43"
					],
					"configs": [
					  {
						"rtp": "95.49",
						"max_rnd_win": 10000,
						"max_rnd_hr": 4113599256,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.46",
						"max_rnd_win": 10000,
						"max_rnd_hr": 4001239944,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.51",
						"max_rnd_win": 10000,
						"max_rnd_hr": 4494372480,
						"hideWinLimitPaytable" : true
					  }
					]
				  },
				  {
					"gameSymbols": [
					  "vs20doghouse_cv29"
					],
					"configs": [
					  {
						"rtp": "95.51",
						"max_rnd_win": 6750,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.51",
						"max_rnd_win": 6750,
						"max_rnd_hr": 3000000000,
						"hideWinLimitPaytable" : true
					  },
					]
				  },
				  {
					"gameSymbols": [
					  "vs20pistols_cv89"
					],
					"configs": [
					  {
						"rtp": "94.00",
						"max_rnd_win": 20000,
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 20,000x and can be achieved during the base game and the buy "DUEL" option`,
							es:`El premio máx de este juego es de 20.000x y se puede conseguir en el juego base y en la función DUEL`,
							pt:`O prémio máximo deste jogo é de 20.000X e pode ser ganho no jogo base e no modo "DUEL"`
						}
					  },
					  {
						"rtp": "95.00",
						"max_rnd_win": 20000,
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 20,000x and can be achieved during the base game and the buy "DUEL" option`,
							es:`El premio máx de este juego es de 20.000x y se puede conseguir en el juego base y en la función DUEL`,
							pt:`O prémio máximo deste jogo é de 20.000X e pode ser ganho no jogo base e no modo "DUEL"`
						}
					  },
					  {
						"rtp": "96.00",
						"max_rnd_win": 20000,
						"hideWinLimitPaytable" : true,
						"customText" : {
							en:`The max prize in this game is 20,000x and can be achieved during the base game and the buy "DUEL" option`,
							es:`El premio máx de este juego es de 20.000x y se puede conseguir en el juego base y en la función DUEL`,
							pt:`O prémio máximo deste jogo é de 20.000X e pode ser ganho no jogo base e no modo "DUEL"`
						}
					  }
					]
				  },
				  {
					"gameSymbols": [
					  "vs15diamond_cv11"
					],
					"configs": [
					  {
						"rtp": "94.16",
						"max_rnd_win": 1130,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.48",
						"max_rnd_win": 1140,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.96",
						"max_rnd_win": 1160,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true
					  },
					]
				  },
				  {
					"gameSymbols": [
					  "vs576treasures_cv54"
					],
					"configs": [
					  {
						"rtp": "94.76",
						"max_rnd_win": 3620,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3620);
						`,
						"customText" : {
							en:`The max prize in this game is 3,620x, with a hitrate 1 in 1,000,000,000 and can be achieved during the base game`,
							pt:`O prémio máximo neste jogo é de 3.620x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base`,
						}
					  },
					  {
						"rtp": "95.78",
						"max_rnd_win": 3670,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3670);
						`,
						"customText" : {
							en:`The max prize in this game is 3,670x, with a hitrate 1 in 1,000,000,000 and can be achieved during the base game`,
							pt:`O prémio máximo neste jogo é de 3.670x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base`,
						}
					  },
					  {
						"rtp": "96.77",
						"max_rnd_win": 3590,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3590);
						`,
						"customText" : {
							en:`The max prize in this game is 3,590x, with a hitrate 1 in 1,000,000,000 and can be achieved during the base game`,
							pt:`O prémio máximo neste jogo é de 3.590x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base`,
						}
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs9aztecgemsdx_cv52"
					],
					"configs": [
					  {
						"rtp": "94.5",
						"max_rnd_win": 3930,
						"max_rnd_hr": 1000000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3930);
						`,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "95.5",
						"max_rnd_win": 4380,
						"max_rnd_hr": 1000000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 4380);
						`,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.5",
						"max_rnd_win": 4280,
						"max_rnd_hr": 500000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 4280);
						`,
						"hideWinLimitPaytable" : true
					  },
					]
				  },
				  {
					"gameSymbols": [
					  "vs243caishien_cv32"
					],
					"configs": [
					  {
						"rtp": "95.5",
						"max_rnd_win": 3650,
						"max_rnd_hr": 1000000000,
						"extraPayload": 
						`
						var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
						localizationRoot.transform.Find("IntroScreen/content/Pages/Page1/LabelsHolder/Landscape/Label_II").GetComponentsInChildren(UILabel,true)[0].text = '3.650';
						localizationRoot.transform.Find("IntroScreen/content/Pages/Page1/LabelsHolder/Portrait/Label_II").GetComponentsInChildren(UILabel,true)[0].text = '3.650';
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 3650);
						`,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.5",
						"max_rnd_win": 2880,
						"max_rnd_hr": 1000000000,
						"extraPayload": 
						`
						var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
						localizationRoot.transform.Find("IntroScreen/content/Pages/Page1/LabelsHolder/Landscape/Label_II").GetComponentsInChildren(UILabel,true)[0].text = '2.880';
						localizationRoot.transform.Find("IntroScreen/content/Pages/Page1/LabelsHolder/Portrait/Label_II").GetComponentsInChildren(UILabel,true)[0].text = '2.880';
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 2880);
						`,
						"hideWinLimitPaytable" : true
					  },
					]
				  },
				  {
					"gameSymbols": [
					  "vs25jeitinho_cv96"
					],
					"configs": [
					  {
						"rtp": "95.50",
						"max_rnd_win": 2600,
						"max_rnd_hr": 1000000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 2600);
						`,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.50",
						"max_rnd_win": 2800,
						"max_rnd_hr": 1000000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 2800);
						`,
						"hideWinLimitPaytable" : true
					  },
					]
				  },
				  {
					"gameSymbols": [
					  "vswaysfreezet_cv101"
					],
					"configs": [
					  {
						"rtp": "94.50",
						"max_rnd_win": 4888,
						"max_rnd_hr": 111111111,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 4888);
						`,
						"customText" : {
							en:`The max prize in this game is 4,888x, with a hitrate 1 in 111,111,111 and can be achieved during the base game`,
							es:`El premio máx de este juego es de 4.888x con una tasa de aparición de 1 en 111.111.111 y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é de 4.888x, com uma taxa de acerto de 1 em 111.111.111 e pode ser alcançado durante o jogo base`,
						}
					  },
					  {
						"rtp": "96.50",
						"max_rnd_win": 4888,
						"max_rnd_hr": 200000000,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 4888);
						`,
						"customText" : {
							en:`The max prize in this game is 4,888x, with a hitrate 1 in 200,000,000 and can be achieved during the base game`,
							es:`El premio máx de este juego es de 4.888x con una tasa de aparición de 1 en 200.000.000 y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é de 4.888x, com uma taxa de acerto de 1 em 200.000.000 e pode ser alcançado durante o jogo base`,
						}
					  }
					]
				  },
				  {
					"gameSymbols": [
					  "vs25ultwolgol_cv101"
					],
					"configs": [
					  {
						"rtp": "94.53",
						"max_rnd_win": 5000,
						"max_rnd_hr": 333333333,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000x with a hitrate of 1 in 333,333,333 and can be achieved on the base game',
									es:'El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 333.333.333 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 5.000x, com uma taxa de acerto de 1 em 333.333.333 e pode ser alcançado durante o jogo base',
								},
								{
									en:'The max prize in this game is 3,125x with a hitrate of 1 in 200,000,000 and can be achieved on the base game',
									es:'El premio máx de este juego es de 3.125x con una tasa de aparición de 1 en 200.000.000 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 3.125x, com uma taxa de acerto de 1 em 200.000.000 e pode ser alcançado durante o jogo base',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
						"customText" : {
							en:'The max prize in this game is 5,000x with a hitrate of 1 in 333,333,333 and can be achieved on the base game',
							es:'El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 333.333.333 y se puede conseguir en el juego base',
							pt:'O prémio máximo neste jogo é de 5.000x, com uma taxa de acerto de 1 em 333.333.333 e pode ser alcançado durante o jogo base',
						}
					},
					{
						"rtp": "95.56",
						"max_rnd_win": 5000,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game',
									es:'El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 5.000x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base',
								},
								{
									en:'The max prize in this game is 3,125x with a hitrate of 1 in 250,000,000 and can be achieved on the base game',
									es:'El premio máx de este juego es de 3.125x con una tasa de aparición de 1 en 250.000.000 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 3.125x, com uma taxa de acerto de 1 em 250.000.000 e pode ser alcançado durante o jogo base',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
						"customText" : {
							en:'The max prize in this game is 5,000x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game',
							es:'El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base',
							pt:'O prémio máximo neste jogo é de 5.000x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base',
						}
					},
					{
						"rtp": "96.57",
						"max_rnd_win": 5000,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game',
									es:'El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 5.000x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base',
								},
								{
									en:'The max prize in this game is 3,125x with a hitrate of 1 in 166,666,667 and can be achieved on the base game',
									es:'El premio máx de este juego es de 3.125x con una tasa de aparición de 1 en 166.666.667 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 3.125x, com uma taxa de acerto de 1 em 166.666.667 e pode ser alcançado durante o jogo base',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
						"customText" : {
							en:'The max prize in this game is 5,000x with a hitrate of 1 in 1,000,000,000 and can be achieved on the base game',
							es:'El premio máx de este juego es de 5.000x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base',
							pt:'O prémio máximo neste jogo é de 5.000x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base',
						}
					},
					]
				},
				{
					"gameSymbols": [
					  "vs20devilic_cv99"
					],
					"configs": [
					  {
						"rtp": "96.46",
						"max_rnd_win": 10000,
						"max_rnd_hr": 333333333,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 10,000X with a chance to hit of 1 in 333,333,333',
									es:'El premio máx de este juego es 10.000X con una posibilidad de conseguirlo de 1 sobre 333.333.333',
									pt:'O prémio máximo neste jogo é 10.000X, com uma possibilidade de ser obtido de 1 em 333.333.333',
								},
								{
									en:'The max prize in this game is 6,667X with a chance to hit of 1 in 142,857,143',
									es:'El premio máx de este juego es 6.667X con una posibilidad de conseguirlo de 1 sobre 142.857.143',
									pt:'O prémio máximo neste jogo é 6.667X, com uma possibilidade de ser obtido de 1 em 142.857.143',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 10000)
						`,
					  },
					  {
						"rtp": "95.60",
						"max_rnd_win": 10000,
						"max_rnd_hr": 333333333,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 10,000X with a chance to hit of 1 in 500,000,000',
									es:'El premio máx de este juego es 10.000X con una posibilidad de conseguirlo de 1 sobre 500.000.000',
									pt:'O prémio máximo neste jogo é 10.000X, com uma possibilidade de ser obtido de 1 em 500.000.000',
								},
								{
									en:'The max prize in this game is 6,667X with a chance to hit of 1 in 125,000,000',
									es:'El premio máx de este juego es 6.667X con una posibilidad de conseguirlo de 1 sobre 125.000.000',
									pt:'O prémio máximo neste jogo é 6.667X, com uma possibilidade de ser obtido de 1 em 125.000.000',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 10000)
						`,
					  },
					  {
						"rtp": "94.41",
						"max_rnd_win": 10000,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 10,000X with a chance to hit of 1 in 1,000,000,000',
									es:'El premio máx de este juego es 10.000X con una posibilidad de conseguirlo de 1 sobre 1.000.000.000',
									pt:'O prémio máximo neste jogo é 10.000X, com uma possibilidade de ser obtido de 1 em 1.000.000.000',
								},
								{
									en:'The max prize in this game is 6,667X with a chance to hit of 1 in 500,000,000',
									es:'El premio máx de este juego es 6.667X con una posibilidad de conseguirlo de 1 sobre 500.000.000',
									pt:'O prémio máximo neste jogo é 6.667X, com uma possibilidade de ser obtido de 1 em 500.000.000',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 10000)
						`,
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs50jucier_cv91"
					],
					"configs": [
					  {
						"rtp": "94.03",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 4,167X',
									es:'El premio máx de este juego es 4.167X',
									pt:'O prémio máximo neste jogo é 4.167X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					  {
						"rtp": "95.00",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 4,167X',
									es:'El premio máx de este juego es 4.167X',
									pt:'O prémio máximo neste jogo é 4.167X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					  {
						"rtp": "96.05",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 4,167X',
									es:'El premio máx de este juego es 4.167X',
									pt:'O prémio máximo neste jogo é 4.167X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					]
				},
				{
					"gameSymbols": [
					  "vs10bbsplxmas_cv97"
					],
					"configs": [
					  {
						"rtp": "94.60",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 3,334X',
									es:'El premio máx de este juego es 3.334X',
									pt:'O prémio máximo neste jogo é 3.334X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					  {
						"rtp": "95.67",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 3,334X',
									es:'El premio máx de este juego es 3.334X',
									pt:'O prémio máximo neste jogo é 3.334X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					  {
						"rtp": "96.71",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 3,334X',
									es:'El premio máx de este juego es 3.334X',
									pt:'O prémio máximo neste jogo é 3.334X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					]
				},
				{
					"gameSymbols": [
					  "vs20goldfeverh_cv77"
					],
					"configs": [
					  {
						"rtp": "98.00",
						"max_rnd_win": 11817,
						"max_rnd_hr": 11000000000,
						"hideWinLimitPaytable" : true
					  },
					]
				},
				{
					"gameSymbols": [
					  "vs5bb3reeler_cv101"
					],
					"configs": [
					  {
						"rtp": "94.50",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 3,334X',
									es:'El premio máx de este juego es 3.334X',
									pt:'O prémio máximo neste jogo é 3.334X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					  {
						"rtp": "95.50",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 3,334X',
									es:'El premio máx de este juego es 3.334X',
									pt:'O prémio máximo neste jogo é 3.334X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					  {
						"rtp": "96.50",
						"max_rnd_win": 5000,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,000X',
									es:'El premio máx de este juego es 5.000X',
									pt:'O prémio máximo neste jogo é 5.000X',
								},
								{
									en:'The max prize in this game is 3,334X',
									es:'El premio máx de este juego es 3.334X',
									pt:'O prémio máximo neste jogo é 3.334X',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5000)
						`,
					  },
					]
				},
				{
					"gameSymbols": [
					  "vswaysspltsym_cv99"
					],
					"configs": [
					  {
						"rtp": "94.53",
						"max_rnd_win": 14000,
						"max_rnd_hr": 1000000000,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 14000);
						`,
						"customText" : {
							en:`The max prize in this game is 14,000x, with a hitrate 1 in 1,000,000,000 and can be achieved during the base game`,
							es:`El premio máx de este juego es de 14.000x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é de 14.000x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base`,
						}
					  },
					  {
						"rtp": "95.54",
						"max_rnd_win": 14000,
						"max_rnd_hr": 142857143,
						"hideWinLimitPaytable" : true,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 14000);
						`,
						"customText" : {
							en:`The max prize in this game is 14,000x, with a hitrate 1 in 142,857,143 and can be achieved during the base game`,
							es:`El premio máx de este juego es de 14.000x con una tasa de aparición de 1 en 142.857.143 y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é de 14.000x, com uma taxa de acerto de 1 em 142.857.143 e pode ser alcançado durante o jogo base`,
						}
					  },
					]
				},
				{
					"gameSymbols": [
					  "vs5drmystery_cv64"
					],
					"configs": [
					  {
						"rtp": "94.49",
						"max_rnd_win": 1250,
						"max_rnd_hr": 500000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 1250);
						var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
						if (localizationRoot != undefined)
						{
							var paths = [
								"Paytable/Pages/Page2/ProgressiveFeature/Rule6",
								"Paytable_mobile/Paytable_landscape/Page4/Content/RealContent/ProgressiveFeatureBottom/Rule6",
								"Paytable_mobile/Paytable_portrait/Page4/Content/RealContent/ProgressiveFeatureBottom/Rule6"
							];

							for (var pIdx = 0; pIdx < paths.length; pIdx++)
							{
								var labelTransform = localizationRoot.transform.Find(paths[pIdx]);
								if (labelTransform != undefined)
								{
									labelTransform.localScale(0,0,0);
									labelTransform.GetComponent(UILabel).text = "";
								}
							}
						}
						`,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "95.49",
						"max_rnd_win": 1250,
						"max_rnd_hr": 500000000,
						"extraPayload": 
						`1250
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 1250);
						var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
						if (localizationRoot != undefined)
						{
							var paths = [
								"Paytable/Pages/Page2/ProgressiveFeature/Rule6",
								"Paytable_mobile/Paytable_landscape/Page4/Content/RealContent/ProgressiveFeatureBottom/Rule6",
								"Paytable_mobile/Paytable_portrait/Page4/Content/RealContent/ProgressiveFeatureBottom/Rule6"
							];

							for (var pIdx = 0; pIdx < paths.length; pIdx++)
							{
								var labelTransform = localizationRoot.transform.Find(paths[pIdx]);
								if (labelTransform != undefined)
								{
									labelTransform.localScale(0,0,0);
									labelTransform.GetComponent(UILabel).text = "";
								}
							}
						}
						`,
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "96.49",
						"max_rnd_win": 1250,
						"max_rnd_hr": 500000000,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 1250);
						var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
						if (localizationRoot != undefined)
						{
							var paths = [
								"Paytable/Pages/Page2/ProgressiveFeature/Rule6",
								"Paytable_mobile/Paytable_landscape/Page4/Content/RealContent/ProgressiveFeatureBottom/Rule6",
								"Paytable_mobile/Paytable_portrait/Page4/Content/RealContent/ProgressiveFeatureBottom/Rule6"
							];

							for (var pIdx = 0; pIdx < paths.length; pIdx++)
							{
								var labelTransform = localizationRoot.transform.Find(paths[pIdx]);
								if (labelTransform != undefined)
								{
									labelTransform.localScale(0,0,0);
									labelTransform.GetComponent(UILabel).text = "";
								}
							}
						}
						`,
						"hideWinLimitPaytable" : true
					  },
					]
				},
				{
					"gameSymbols": [
					  "vs20treesot_cv98"
					],
					"configs": [
					  {
						"rtp": "94.06",
						"max_rnd_win": 15000,
						"max_rnd_hr": 166666667,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 15000);
						`,
						"customText" : {
							en:`The max prize in this game is 15,000x, with a hitrate 1 in 166,666,667 and can be achieved during the base game`,
							es:`El premio máx de este juego es de 15.000x con una tasa de aparición de 1 en 166.666.667 y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é de 15.000x, com uma taxa de acerto de 1 em 166.666.667 e pode ser alcançado durante o jogo base`,
						},
						"hideWinLimitPaytable" : true
					  },
					  {
						"rtp": "95.10",
						"max_rnd_win": 15000,
						"max_rnd_hr": 333333333,
						"extraPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 15000);
						`,
						"customText" : {
							en:`The max prize in this game is 15,000x, with a hitrate 1 in 333,333,333 and can be achieved during the base game`,
							es:`El premio máx de este juego es de 15.000x con una tasa de aparición de 1 en 333.333.333 y se puede conseguir en el juego base`,
							pt:`O prémio máximo neste jogo é de 15.000x, com uma taxa de acerto de 1 em 333.333.333 e pode ser alcançado durante o jogo base`,
						},
						"hideWinLimitPaytable" : true
					  },
					]
				},
				{
					"gameSymbols": [
					  "vs20fruitswh_cv77"
					],
					"configs": [
					  {
						"rtp": "98.00",
						"max_rnd_win": 5966,
						"hideWinLimitPaytable" : true,
						"extraPayload":
						`
						var SHOXC_LIM100 = {};
						SHOXC_LIM100.chanceLabel = this.chanceLabel;
						var OnBetLevelChanged = function()
						{
							var texts = [
								{
									en:'The max prize in this game is 5,966x, with a hitrate 1 in 2,000,000,000 and can be achieved during the base game',
									es:'El premio máx de este juego es de 5.966x con una tasa de aparición de 1 en 2.000.000.000 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 5.966x, com uma taxa de acerto de 1 em 2.000.000.000 e pode ser alcançado durante o jogo base',
								},
								{
									en:'The max prize in this game is 4,722x, with a hitrate 1 in 1,000,000,000 and can be achieved during the base game',
									es:'El premio máx de este juego es de 4.722x con una tasa de aparición de 1 en 1.000.000.000 y se puede conseguir en el juego base',
									pt:'O prémio máximo neste jogo é de 4.722x, com uma taxa de acerto de 1 em 1.000.000.000 e pode ser alcançado durante o jogo base',
								}
							];
							var bls = XT.GetObject(Vars.BetLevelSettings);
							if (bls != null)
							{
								var text = texts[bls.betLevelIndex][UHT_CONFIG.LANGUAGE];
								if (text == undefined)
									text = texts[bls.betLevelIndex]["en"];
								SHOXC_LIM100.chanceLabel.text = text;
							}
						}
						XT.RegisterCallbackEvent(Vars.BetLevelChanged, OnBetLevelChanged, this);
						`,
						"gameInfoPayload": 
						`
						XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 5966)
						`,
					  }
					]
				},
				{
					"gameSymbols": [
					  "vs10cowgold_cv59"
					],
					"configs": [
						{
							"rtp": "94.50",
							"max_rnd_win": 1400,
							"max_rnd_hr": 1000000000,
							"hideWinLimitPaytable" : true,
							"gameInfoPayload": 
							`
							XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 1400)
							`,
						},
						{
							"rtp": "95.50",
							"max_rnd_win": 1450,
							"max_rnd_hr": 1000000000,
							"hideWinLimitPaytable" : true,
							"gameInfoPayload": 
							`
							XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 1450)
							`,
						},
						{
							"rtp": "96.50",
							"max_rnd_win": 1625,
							"max_rnd_hr": 1000000000,
							"hideWinLimitPaytable" : true,
							"gameInfoPayload": 
							`
							XT.SetInt(WinLimitVars.WinLimit_TotalBetMultiplier, 1625)
							`,
						}
					]
				},
			];
			var targetConfig = undefined;
			var oJSXC_HIR = JurisdictionShowXChance.prototype.HandleInitResponse;
			JurisdictionShowXChance.prototype.HandleInitResponse = function(/**Object*/ dict)
			{
				XT.SetBool(Vars.Jurisdiction_Show_X_Chance, true);
				var gameInfo = XT.GetObject("GameInfo");
				if (gameInfo == null)
				{
					if (dict["gameInfo"])
					{
						if (window["UHT_GAME_CONFIG"]["GAME_SYMBOL"] == "vs9aztecgemsdx_cv52")
							dict["gameInfo"] = dict["gameInfo"].replace("-", "_");
						try
						{
							gameInfo = JSON5.parse(dict["gameInfo"]);
						}
						catch(err)
						{

						}
					}
				}

				var targetGame = configOverrides.find((element) => element.gameSymbols.indexOf(window["UHT_GAME_CONFIG"]["GAME_SYMBOL"]) != -1);
				if (targetGame != undefined)
				{
					var returnToPlayer = -1;
					var rtp = GameProtocolCommonParser.ParseDoubleList(dict, GameProtocolDictionary.returnToPlayer);
					if (rtp != null)
					{
						if (rtp.length > 1) 
						{
							rtp.sort();
							returnToPlayer = rtp[rtp.length - 1]
						} 
						else
							returnToPlayer = rtp[0];
					}
					else if (gameInfo != null && gameInfo["rtps"] != undefined)
					{
						returnToPlayer = gameInfo["rtps"]["regular"];
						if (returnToPlayer == undefined)
						{
							returnToPlayer = -1;
							for (let member in gameInfo["rtps"])
							{
								let hr = _number.otod(gameInfo["rtps"][member]);
								if (hr > returnToPlayer)
									returnToPlayer = hr;
							}
						}
					}

					targetConfig = (targetConfig) ? targetConfig : targetGame.configs.find((element) => element.rtp == returnToPlayer);
					if (targetConfig != undefined)
					{
						var paytable = globalRuntime.sceneRoots[1].GetComponentInChildren(Paytable, true);
						if (paytable == null)
							paytable = globalRuntime.sceneRoots[1].GetComponentInChildren(Paytable_mobile, true);
						if (paytable != null)
						{
							var jurisdictionCustomizations = paytable.GetComponentsInChildren(JurisdictionCustomization, true);
							for (var i = 0; i < jurisdictionCustomizations.length; i++)
							{
								if (jurisdictionCustomizations[i].jurisdiction == "GR")
									jurisdictionCustomizations[i].jurisdiction = UHT_GAME_CONFIG_SRC["jurisdiction"];
							}
						}

						var tempGameInfo = {};
						if (gameInfo != null)
							tempGameInfo = gameInfo;
						if (targetConfig.extraPayload != undefined)
							eval(targetConfig.extraPayload);
						if (tempGameInfo["props"] == null)
							tempGameInfo["props"] = {};
						if (targetConfig["max_rnd_win"] != undefined)
							tempGameInfo["props"]["max_rnd_win"] = targetConfig["max_rnd_win"];
						if (targetConfig["max_rnd_hr"] != undefined)
							tempGameInfo["props"]["max_rnd_hr"] = targetConfig["max_rnd_hr"];
						dict.gameInfo = JSON.stringify(tempGameInfo);
						gameInfo = tempGameInfo;

						if (targetConfig["hideWinLimitPaytable"])
						{
							var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
							if (localizationRoot != undefined)
							{
								var paths = [
									"Paytable/Pages/Common_Info2/WinLimit",
									"Paytable_mobile/Paytable_landscape/Common_Info4/Content/RealContent/WinLimit",
									"Paytable_mobile/Paytable_portrait/Common_Info4/Content/RealContent/WinLimit"
								];

								for (var pIdx = 0; pIdx < paths.length; pIdx++)
								{
									var labelTransform = localizationRoot.transform.Find(paths[pIdx]);
									if (labelTransform != undefined)
									{
										var xtvar2cat = labelTransform.GetComponent(XTVariable2CAT);
										if (xtvar2cat != null)
										{
											xtvar2cat.greater = xtvar2cat.lessOrEquals;
											if (xtvar2cat.lessOrEquals != null)
												xtvar2cat.lessOrEquals.Start();
										}
									}
								}
							}
						}
					}
				}

				if (gameInfo != null && gameInfo["props"] && (gameInfo["props"]["max_rnd_hr"] == undefined))
				{
					var maxHR = -1;
					for (var member in gameInfo["props"])
					{
						if (member.indexOf("max_rnd_hr") == 0)
						{
							var hr = _number.otod(gameInfo["props"][member]);
							if (hr > maxHR)
								maxHR = hr;
						}
					}
					if (maxHR > 0)
						gameInfo["props"]["max_rnd_hr"] = maxHR.toString();
				}

				if ((gameInfo != null && gameInfo["props"] != null) && gameInfo["props"]["max_rnd_hr"] != null)
				{
					var text = (gameInfo["props"]["max_rnd_hr"] < 100000000) ? textDict[UHT_CONFIG.LANGUAGE][0] : textDict[UHT_CONFIG.LANGUAGE][1];
					if (text != undefined)
						this.chanceLabel.text = text;
					if (targetConfig != undefined && targetConfig.customText != undefined)
					{
						text = targetConfig.customText[UHT_CONFIG.LANGUAGE];
						if (text == undefined)
							text = targetConfig.customText["en"];
						this.chanceLabel.text = text;
					}
				}

				if (gameInfo != null)
					oJSXC_HIR.apply(this, arguments);

				if (ServerOptions.jurisdiction == "BS")
				{
					var stylePayload = `#WinLimitDesktop,#WinLimitLandscape,#WinLimitPortrait{margin-left:auto;margin-right:auto;position:relative;top:0;z-index:269;width:95%!important}.iPhone.MainWindow.Chrome #WinLimitLandscape,.iPhone.MainWindow.Chrome #WinLimitPortrait,.iPhone.MainWindow.MobileSafari #WinLimitLandscape{position:fixed;left:50%;transform:translateX(-50%)}canvas.WinLimitCanvas{margin-left:auto;margin-right:auto;display:block}@media only screen and (orientation:landscape){#WinLimitLandscape{display:block!important}#WinLimitPortrait{display:none!important}}@media only screen and (orientation:portrait){#WinLimitLandscape{display:none!important}#WinLimitPortrait{display:block!important}}`;
					var style = document.createElement('style');
					style.textContent = stylePayload;
					document.head.appendChild(style);

					var htmlString = "";
					if (document.documentElement.id == "Mobile")
						htmlString = '<div style=display:block;color:#fff class=RGSContainerActive data-height=25><div style=margin-left:auto;margin-right:auto;width:100%;display:block;height:20px;font-size:14px; id=WinLimitPortrait></div><div style=margin-left:auto;margin-right:auto;width:100%;display:none;white-space:nowrap;height:20px; id=WinLimitLandscape></div></div>';
					else
						htmlString = '<div style=display:block;color:#fff class=RGSContainerActive data-height=29><div style=width:100%;display:block;white-space:nowrap;font-size:2.5vh; id=WinLimitDesktop></div></div>';

					var htmlContent = new DOMParser().parseFromString(htmlString, "text/html");
					document.body.insertBefore(htmlContent.body.firstChild, renderCanvas);

					var textContainer = document.getElementById("WinLimitDesktop");
					if (textContainer != null)
						textContainer.innerHTML = this.chanceLabel.text;
					textContainer = document.getElementById("WinLimitPortrait");
					if (textContainer != null)
						textContainer.innerHTML = this.chanceLabel.text;
					textContainer = document.getElementById("WinLimitLandscape");
					if (textContainer != null)
						textContainer.innerHTML = this.chanceLabel.text;

					renderCanvas.classList.add("WinLimitCanvas");

					var OnUHTResize = function(/**Object*/ unused)
					{
						var rgsParent = document.getElementsByClassName("RGSContainerActive")[0].dataset;
						var pixelRatio = UHTScreen.height / window.innerHeight;
						var scale = 1 - (rgsParent.height * pixelRatio / UHTScreen.height);
						var sign = (document.documentElement.className.indexOf("iPhone") >= 0 && document.documentElement.id == "Mobile" && window.orientation == 90 && !window.frameElement) ? 1 : -1;
						var transY = sign * ((rgsParent.height * pixelRatio / (UHTScreen.height - rgsParent.height * pixelRatio)) / 2) * 100 ;
						renderCanvas.style.transform = "scale(" + scale + ") translateY(" + transY + "%)";
					};

					EventManager.AddHandler("EVT_UHT_RESIZE", OnUHTResize, this);
					OnUHTResize(null);
				}
			}

			JurisdictionShowXChance.prototype.OnGameInfoChanged = function()
			{
				if (targetConfig != undefined)
					if (targetConfig.gameInfoPayload != undefined)
						eval(targetConfig.gameInfoPayload);
			};

			JurisdictionShowXChance.prototype.XTRegisterCallbacks = function()
			{
				this.priority = -6969;
				FOXLink.prototype.XTRegisterCallbacks.call(this);
				XT.RegisterCallbackEvent("Evt_Internal_GameInfoChanged", this.OnGameInfoChanged, this);
			};

			
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchMinSpinBetNoBF",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if (UHT_GAME_CONFIG_SRC["replayMode"])
			return;
		
		var minSpinBetCents = IsRequired("MINSPINBET");
		if (minSpinBetCents == false)
			return;

		if (window["BaccaratConnection"] != undefined)
		{
			var oBC_HIR = BaccaratConnection.prototype.HandleInitResponse;
			BaccaratConnection.prototype.HandleInitResponse = function() 
			{
				this.lastResponse.initData.minBet = minSpinBetCents / 100;
				var betsFromServer = this.lastResponse.initData.chipValues;
				var newBets = betsFromServer;
				var minBet = betsFromServer[0];
				if (minBet * 100 < minSpinBetCents)
				{
					newBets = [];
					for (var i=0; i<betsFromServer.length; i++)
						if (betsFromServer[i] * 100 >= minSpinBetCents)
							newBets.push(betsFromServer[i]);
					var proposedMinBet = minSpinBetCents / 100;
					if (IsRequired("NODEC"))
						proposedMinBet = Math.ceil(proposedMinBet);
					if (newBets[0] / proposedMinBet > 1.1)
						newBets.splice(0, 0, proposedMinBet);
				}
				this.lastResponse.initData.chipValues = newBets;
				if (this.lastResponse.initData.prevBets != null)
				{
					for (var i = 0; i < this.lastResponse.initData.prevBets.length; i++)
					{
						if (this.lastResponse.initData.prevBets[i] > 0 && this.lastResponse.initData.prevBets[i] < (minSpinBetCents / 100))
						{
							this.lastResponse.initData.prevBets = [];
							this.lastResponse.bets = [];
							XT.TriggerEvent(TGVars.Evt_DataToCode_ClearBets);
							break;
						}
					}
				}
				oBC_HIR.apply(this, arguments);		
			}
		}

		if (window["BlackjackConnection"] != undefined)
		{
			var oBC_HIR = BlackjackConnection.prototype.HandlerGameInit;
			BlackjackConnection.prototype.HandlerGameInit = function(arg) {
				console.log("VideoSlotsConnection - HandlerGameInit");
				this.lastResponse = arg;
				if (this.lastResponse == null) {
					console.error("Null response from server!");
					return
				}
				this.lastResponse.InitData.MinBet = minSpinBetCents / 100;
				var betsFromServer = this.lastResponse.InitData.ChipValues;
				var newBets = betsFromServer;
				var minBet = betsFromServer[0];
				if (minBet * 100 < minSpinBetCents)
				{
					newBets = [];
					for (var i=0; i<betsFromServer.length; i++)
						if (betsFromServer[i] * 100 >= minSpinBetCents)
							newBets.push(betsFromServer[i]);
					var proposedMinBet = minSpinBetCents / 100;
					if (IsRequired("NODEC"))
						proposedMinBet = Math.ceil(proposedMinBet);
					if (newBets[0] / proposedMinBet > 1.1)
						newBets.splice(0, 0, proposedMinBet);
				}
				this.lastResponse.InitData.ChipValues = newBets;
				if (this.lastResponse.InitData.PrevBets != null)
				{
					for (var i = 0; i < this.lastResponse.InitData.PrevBets.length; i++)
					{
						if (this.lastResponse.InitData.PrevBets[i] > 0 && this.lastResponse.InitData.PrevBets[i] < (minSpinBetCents / 100))
						{
							this.lastResponse.InitData.PrevBets = []
							break;
						}
					}
				}
				oBC_HIR.apply(this, arguments);
			}
		}

		if (window["RouletteConnection"] != undefined)
		{
			var oRC_HIR = RouletteConnection.prototype.HandlerGameInit;
			RouletteConnection.prototype.HandlerGameInit = function(arg) {
				console.log("VideoSlotsConnection - HandlerGameInit");
				this.lastResponse = arg;
				if (this.lastResponse == null) {
					console.error("Null response from server!");
					return
				}
				this.lastResponse.InitData.MinBet = minSpinBetCents / 100;
				var betsFromServer = this.lastResponse.InitData.ChipValues;
				var newBets = betsFromServer;
				var minBet = betsFromServer[0];
				if (minBet * 100 < minSpinBetCents)
				{
					newBets = [];
					for (var i=0; i<betsFromServer.length; i++)
						if (betsFromServer[i] * 100 >= minSpinBetCents)
							newBets.push(betsFromServer[i]);
					var proposedMinBet = minSpinBetCents / 100;
					if (IsRequired("NODEC"))
						proposedMinBet = Math.ceil(proposedMinBet);
					if (newBets[0] / proposedMinBet > 1.1)
						newBets.splice(0, 0, proposedMinBet);
				}
				this.lastResponse.InitData.ChipValues = newBets;
				if (this.lastResponse.Bets != null)
				{
					for (var i = 0; i < this.lastResponse.Bets.length; i++)
					{
						if (this.lastResponse.Bets[i] > 0 && this.lastResponse.Bets[i] < (minSpinBetCents / 100))
						{
							this.lastResponse.Bets = [];
							break;
						}
					}
				}
				oRC_HIR.apply(this, arguments);
			}
		}
		
		var BuyFeatureIsPresentAndActive = function()
		{
			var featureIsPresent = [];
			if (window["FreeSpinsPurchaseManager"])
			{
				var fspm = globalRuntime.sceneRoots[1].GetComponentsInChildren(FreeSpinsPurchaseManager, true);
				for (var i = 0; i < fspm.length; i++)
				{
					featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
				}
			}

			if (window["FeaturePurchaseManager"])
			{
				var fpm = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager, true);
				for (var i = 0; i < fpm.length; i++)
				{
					if (!fpm[i].isSuperSpin)
						featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
					else
						featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableSuperSpin));
				}
			}

			if (window["FeaturePurchaseV2"])
			{
				var fpv2 = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseV2, true);
				for (var i = 0; i < fpv2.length; i++)
					featureIsPresent.push(fpv2[i].featureAvailable);
			}

			if (window["FeaturePurchaseManager_GRM"])
			{
				var fpm_GRM = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager_GRM, true);
				for (var i = 0; i < fpm_GRM.length; i++)
				{
					featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
				}
			}

			if (window["FeaturePurchaseManager_BK"])
			{
				var fpm_BK = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager_BK, true);
				for (var i = 0; i < fpm_BK.length; i++)
				{
					featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
				}
			}

			return (featureIsPresent.indexOf(true) != -1);
		}

		if (UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("cs") == 0)
		{
			CoinManager.ComputeCoinValuesAndCurrentBet = function(betsFromServer, lastBet, defaultBet) 
			{
				if (XT.GetBool(Vars.HasCoins)) {
					var minBet = betsFromServer[0];
					var maxBet = betsFromServer[betsFromServer.length - 1];

					//var curve = [ 0.002, 0.004, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5 ];
					//var curve = [ 0.2, 0.4, 0.6, 0.8 ];
					var curve = [ 0.05, 0.1, 0.2, 0.4 ];
			
					var levels = XT.GetInt(Vars.NumberOfBetLevels);

					while ((minBet*levels)<((maxBet/levels)*curve[0]))
						curve.unshift(curve[0]*0.2);

					if (maxBet/minBet < levels)
					{
						levels = ((maxBet * 1000) / (minBet * 1000)) | 0;
						XT.SetInt(Vars.NumberOfBetLevels, levels);
					}

					var maxCoinValue = ((maxBet * 1000) / levels) / 1000;

					//remove cents
					maxCoinValue = (Math.floor((maxCoinValue + 0.0001) * 100)) / 100;
					if ((maxCoinValue * levels) > maxBet)
						maxCoinValue = ((maxCoinValue * 100) | 0) / 100;

					var x = (maxCoinValue - minBet);

					var coinValues = [];
					coinValues.push(minBet);
					for (var j = 0; j < curve.length; j++)
					{
						var computedVal = CoinManager.GetNiceCoinValue(minBet + x * curve[j]);
						if ((computedVal > minBet) && (computedVal < maxCoinValue))
							coinValues.push(computedVal);
					}
					coinValues.push(maxCoinValue);

					//remove duplicates
					for (var i = 1; i < coinValues.length; i++ )
					{
						if (Math.abs(coinValues[i] - coinValues[i - 1]) < 1e-3)
						{
							coinValues.splice(i, 1);
							i--;
						}
					}

					XT.SetObject(Vars.CoinValues, coinValues);
					CoinManager.computedCoinValues = coinValues
				} else
					CoinManager.betsFromServer = betsFromServer;
				CoinManager.SetDesiredBet(lastBet);
				CoinManager.SetDefaultBet(defaultBet)
			};

			var oCCVACB = CoinManager.ComputeCoinValuesAndCurrentBet;
			CoinManager.ComputeCoinValuesAndCurrentBet = function(betsFromServer, lastBet, defaultBet)
			{
				var newBets = betsFromServer;
				var minBet = betsFromServer[0];
				if (minBet * 100 < minSpinBetCents)
				{
					newBets = [];
					for (var i=0; i<betsFromServer.length; i++)
						if (betsFromServer[i] * 100 >= minSpinBetCents)
							newBets.push(betsFromServer[i]);
					var proposedMinBet = Math.ceil((minSpinBetCents)) / 100;
					if (IsRequired("NODEC"))
						proposedMinBet = Math.ceil(proposedMinBet);
					if (newBets[0] / proposedMinBet > 1.1)
						newBets.splice(0, 0, proposedMinBet);

					arguments[0] = newBets;
				}
				oCCVACB.apply(this, arguments);
			};
		}
		else if (UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs") == 0)
		{
			var oCCVACB = CoinManager.ComputeCoinValuesAndCurrentBet;
			CoinManager.ComputeCoinValuesAndCurrentBet = function(betsFromServer, lastBet, defaultBet)
			{
				var maxExplicitBetLimitC = XT.GetInt(Vars.Jurisdiction_MaxBetCents);
				if (maxExplicitBetLimitC > 0)
					XT.SetDouble(Vars.ExplicitMaxTotalBetFromServer, maxExplicitBetLimitC / 100);
		
				var newBets = betsFromServer;
				var minBet = betsFromServer[0];
				if (minBet * 100 * XT.GetInt(Vars.LinesForMinBet) < minSpinBetCents)
				{
					newBets = [];
					for (var i=0; i<betsFromServer.length; i++)
						if (betsFromServer[i] * 100 * XT.GetInt(Vars.LinesForMinBet) >= minSpinBetCents)
							newBets.push(betsFromServer[i]);
					var proposedMinBet = Math.ceil((minSpinBetCents / XT.GetInt(Vars.LinesForMinBet))) / 100;
					if (IsRequired("NODEC"))
						proposedMinBet = Math.ceil(proposedMinBet);
					if (newBets[0] / proposedMinBet > 1.1)
						newBets.splice(0, 0, proposedMinBet);
				}
				var oLMIBFS = CoinManager.initialBetsFromServer;
				CoinManager.initialBetsFromServer = newBets;
				XT.TriggerEvent(CoinManagerVars.Evt_ComputedCoinValuesAndCurrentBet);
				CoinManager.initialBetsFromServer = oLMIBFS;

				if (!BuyFeatureIsPresentAndActive() && XT.GetInt(Vars.LinesForMinBet) != -1)
				{
					arguments[0] = newBets;
				}
				oCCVACB.apply(this, arguments);
			};
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchMinSpinBet",
	ready: function()
	{
		return (window["globalRuntime"] != undefined);
	},
	apply: function()
	{
		if (ServerOptions.isReplay)
			return;

		var minSpinBetCents = IsRequired("MINSPINBET");
		if (minSpinBetCents == false)
			return;

		var onScreenTargetsDesk = [];
		var onScreenTargetsMobile = [];
		var windowTargetsDesk = [];
		var windowTargetsMobile = [];
		var showBetWarning = false;
		var warningText = "";
		var purchaseType = "";

		var OnBetChanged = function()
		{
			var currentBetCents = CoinManager.GetNextTotalBet() * 100;
			showBetWarning = (minSpinBetCents[0] > currentBetCents) && !ServerOptions.isReplay;
			for (var i = 0; i < windowTargetsDesk.length; i++)
			{
				windowTargetsDesk[i].gameObject.SetActive(showBetWarning && !CoinManager.isStrictMode);
			}

			for (var i = 0; i < windowTargetsMobile.length; i++)
			{
				windowTargetsMobile[i].gameObject.SetActive(showBetWarning && !CoinManager.isStrictMode);
			}
			SetOnScreenWarningState();
		}

		var OnLogicIsFreeSpin = function(value)
		{
			if (value)
			{
				HideOnScreenWarning();
			}
			else
			{
				SetOnScreenWarningState();
			}
		}

		var OnIntro = function()
		{
			if (XT.GetBool(Vars.Logic_IsFreeSpin))
			{
				HideOnScreenWarning();
			}
			else
			{
				SetOnScreenWarningState();
			}
		}

		var SetOnScreenWarningState = function()
		{
			var betIsTooLow = false;
			var shouldBeVisibleDesktop = true;
			for (var i = 0; i < windowTargetsDesk.length; i++)
			{
				betIsTooLow ||= windowTargetsDesk[i].gameObject.activeSelf;
				if (betIsTooLow)
					shouldBeVisibleDesktop &&= !windowTargetsDesk[i].gameObject.activeInHierarchy;
			}

			if (!betIsTooLow)
				shouldBeVisibleDesktop = false;

			betIsTooLow = false;
			var shouldBeVisibleMobile = true;
			for (var i = 0; i < windowTargetsMobile.length; i++)
			{
				betIsTooLow ||= windowTargetsMobile[i].gameObject.activeSelf;
				if (betIsTooLow)
					shouldBeVisibleMobile &&= !windowTargetsMobile[i].gameObject.activeInHierarchy;;
			}

			if (!betIsTooLow)
				shouldBeVisibleMobile = false;

			for (var i = 0; i < onScreenTargetsDesk.length; i++)
			{
				onScreenTargetsDesk[i].gameObject.SetActive(shouldBeVisibleDesktop);
			}

			for (var i = 0; i < onScreenTargetsMobile.length; i++)
			{
				onScreenTargetsMobile[i].gameObject.SetActive(shouldBeVisibleMobile);
			}
		}

		var HideOnScreenWarning = function()
		{
			for (var i = 0; i < onScreenTargetsDesk.length; i++)
			{
				onScreenTargetsDesk[i].gameObject.SetActive(false);
			}

			for (var i = 0; i < onScreenTargetsMobile.length; i++)
			{
				onScreenTargetsMobile[i].gameObject.SetActive(false);
			}
		}

		var cheapestBuy = 9007199254740991;

		var BuyFeatureIsPresentAndActive = function()
		{
			if (IsRequired("NOBF") || XT.GetBool(Vars.Jurisdiction_DisableBuyFeature))
				return false;

			var featureIsPresent = [];
			if (window["FreeSpinsPurchaseManager"])
			{
				var fspm = globalRuntime.sceneRoots[1].GetComponentsInChildren(FreeSpinsPurchaseManager, true);
				for (var i = 0; i < fspm.length; i++)
				{
					featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
					
					var fspc = fspm[i].fsPurchaseConfig;
					if (fspc != null)
						for (var j = 0; j < fspc.purchaseOptions.length; j++)
							cheapestBuy = Math.min(cheapestBuy, fspc.purchaseOptions[j].bet);
				}
			}

			if (window["FeaturePurchaseManager"])
			{
				var fpm = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager, true);
				for (var i = 0; i < fpm.length; i++)
				{
					if (!fpm[i].isSuperSpin)
					{
						featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
						for (var j = 0; j < fpm[i].purchaseCosts.length; j++)
							if (j < fpm[i].purchaseDisplayer.ftPurchaseItems.length && fpm[i].purchaseDisplayer.ftPurchaseItems[j].cat.show.cat != null)
								cheapestBuy = Math.min(cheapestBuy, fpm[i].purchaseCosts[j]);
					}
					else
						featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableSuperSpin));
				}
			}

			if (window["FeaturePurchaseV2"])
			{
				var fpv2 = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseV2, true);
				for (var i = 0; i < fpv2.length; i++)
				{
					featureIsPresent.push(fpv2[i].featureAvailable);
					for (var j = 0; j < fpv2[i].featurePurchaseData.purchaseCosts.length; j++)
						cheapestBuy = Math.min(cheapestBuy, fpv2[i].featurePurchaseData.purchaseCosts[j]);
				}
			}

			if (window["FeaturePurchaseManager_GRM"])
			{
				var fpm_GRM = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager_GRM, true);
				for (var i = 0; i < fpm_GRM.length; i++)
				{
					featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
					for (var j = 0; j < fpm_GRM[i].purchaseCosts.length; j++)
						cheapestBuy = Math.min(cheapestBuy, fpm_GRM[i].purchaseCosts[j]);
				}
			}

			if (window["FeaturePurchaseManager_BK"])
			{
				var fpm_BK = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager_BK, true);
				for (var i = 0; i < fpm_BK.length; i++)
				{
					featureIsPresent.push(!XT.GetBool(Vars.Jurisdiction_DisableBuyFeature));
					for (var j = 0; j < fpm_BK[i].purchaseCosts.length; j++)
						cheapestBuy = Math.min(cheapestBuy, fpm_BK[i].purchaseCosts[j]);
				}
			}

			return (featureIsPresent.indexOf(true) != -1);
		}

		var IsFeatureBought = function()
		{
			var featureBought = -2;
			switch (purchaseType)
			{
				case "fp_V1":
				case "fp_V2":
					if (XT.GetObject(Vars.FeaturePurchase) == null)
						featureBought = -2;
					else
					{
						featureBought = XT.GetObject(Vars.FeaturePurchase).purchaseIndex;
						if (window["FeaturePurchaseV2"])
						{
							var fpv2 = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseV2, true);
							for (var i = 0; i < fpv2.length; i++)
							{
								if (fpv2[i].fsPurchased)
									return true;
							}
						}
					}
					break;
				case "fsp":
					featureBought = XT.GetObject(Vars.FreeSpinsPurchaseConfig).optionIndex;
					break;
			}

			return (featureBought > -1);
		};

		var OnXTGameInit = function()
		{
			if (!BuyFeatureIsPresentAndActive())
				return;

			var betValue = LocaleManager.FormatValue((minSpinBetCents / 100), new FormatOptions()).replaceAll(" ",'\u00A0');
			var minBFValue = LocaleManager.FormatValue((CoinManager.initialBetsFromServer[0] * cheapestBuy), new FormatOptions()).replaceAll(" ",'\u00A0');

			var warningTextMap = {
				en: `YOU CAN BUY FREE SPINS FROM ${minBFValue} AND ABOVE OR INCREASE YOUR BET TO ${betValue} TO SPIN`,
				ar: `يمكنك شراء دورات مجانية من ${betValue} وما فوق أو زيادة رهانك إلى ${minBFValue} للدوران`,
				bg: `"МОЖЕТЕ ДА ЗАКУПИТЕ БЕЗПЛАТНИ ЗАВЪРТАНИЯ ОТ ${minBFValue} И ПОВЕЧЕ ИЛИ ДА УВЕЛИЧИТЕ ЗАЛОГА СИ ДО ${betValue}, ЗА ДА ЗАВЪРТИТЕ"`,
				cs: `MŮŽETE SI KOUPIT ROZTOČENÍ ZDARMA OD ${minBFValue} A VÝŠE NEBO ZVÝŠIT SÁZKU NA ${betValue} A ROZTOČIT SE`,
				da: `DU KAN KØBE GRATIS SPINS FRA ${minBFValue} OG DEROVER ELLER ØGE DIN INDSATS TIL ${betValue} FOR AT SPINNE`,
				de: `"SIE KÖNNEN KOSTENLOSE DREHUNGEN AB ${minBFValue} ERWERBEN ODER IHREN EINSATZ AUF ${betValue} ERHÖHEN, UM ZU DREHEN"`,
				el: `ΜΠΟΡΕΊΤΕ ΝΑ ΑΓΟΡΆΣΕΤΕ ΔΩΡΕΆΝ ΠΕΡΙΣΤΡΟΦΈΣ ΑΠΌ ${minBFValue} ΚΑΙ ΠΆΝΩ Ή ΝΑ ΑΥΞΉΣΕΤΕ ΤΟ ΠΟΝΤΆΡΙΣΜΆ ΣΑΣ ΣΕ ${betValue} ΓΙΑ ΠΕΡΙΣΤΡΟΦΈΣ.`,
				es: `PUEDES COMPRAR TIRADAS GRATIS A PARTIR DE ${minBFValue} O AUMENTAR TU APUESTA A ${betValue} PARA GIRAR`,
				et: `SAAD OSTA TASUTA KEERUTUSI ALATES ${minBFValue} JA ROHKEM VÕI SUURENDADA OMA PANUST ${betValue} KEERUTUSTE TEGEMISEKS.`,
				fa: `شما می‌توانید از ${betValue} به بالا چرخش‌های رایگان بخرید یا شرط خود را به ${minBFValue} افزایش دهید تا چرخش کنید.`,
				fi: `VOIT OSTAA ILMAISKIERROKSIA ${minBFValue}:STÄ ALKAEN TAI NOSTAA PANOKSESI ${betValue}:EEN PYÖRÄYTYSTÄ VARTEN.`,
				fr: `VOUS POUVEZ ACHETER DES TOURS GRATUITS À PARTIR DE ${minBFValue} OU AUGMENTER VOTRE MISE À ${betValue} POUR TOURNER.`,
				hr: `MOŽETE KUPITI BESPLATNE VRTNJE OD ${minBFValue} ILI POVIŠAVATI ULOG NA ${betValue} ZA VRNJU`,
				hu: `"INGYENES PÖRGETÉSEKET VÁSÁROLHATSZ ${minBFValue}-TŐL ÉS FELETTE, VAGY NÖVELHETED A TÉTEDET ${betValue}-IG A PÖRGETÉSHEZ."`,
				hy: `Դուք կարող եք գնել անվճար պտույտներ ${minBFValue} և ավելի կամ բարձրացնել ձեր խաղադրույքը մինչև ${betValue} պտտվելու համար:`,
				id: `ANDA BISA BELI SPIN GRATIS MULAI DARI ${minBFValue} DAN LEBIH ATAU NAIKKAN TARUHAN ANDA KE ${betValue} UNTUK SPIN`,
				it: `È POSSIBILE ACQUISTARE GIRI GRATUITI A PARTIRE DA ${minBFValue} O AUMENTARE LA PUNTATA A ${betValue} PER GIRARE`,
				ja: `${minBFValue}以上のフリースピンを購入するか、ベット額を${betValue}まで増やしてスピンすることができる。`,
				ka: `ქვენ შეგიძლიათ შეიძინოთ უფასო სპინები ${minBFValue}-დან ან გაზარდოთ თქვენი ფსონი ${betValue}-მდე სპინებისთვის.`,
				ko: `${minBFValue} 이상에서 무료 스핀을 구매하거나 ${betValue}으로 베팅을 늘려 스핀을 돌릴 수 있습니다.`,
				lt: `"GALITE NUSIPIRKTI NEMOKAMŲ SUKIMŲ NUO ${minBFValue} IR DAUGIAU ARBA PADIDINTI STATYMĄ IKI ${betValue}, KAD GALĖTUMĖTE SUKTI"`,
				lv: `"JŪS VARAT IEGĀDĀTIES BEZMAKSAS GRIEZIENUS NO ${minBFValue} UN VAIRĀK VAI PALIELINĀT LIKMI LĪDZ ${betValue}, LAI GRIEZTOS."`,
				ms: `ANDA BOLEH MEMBELI PUTARAN PERCUMA DARI ${minBFValue} DAN KE ATAS ATAU MENINGKATKAN PERTARUHAN ANDA KE ${betValue} UNTUK BERPUTAR`,
				nl: `JE KUNT GRATIS SPINS KOPEN VANAF ${minBFValue} OF JE INZET VERHOGEN TOT ${betValue} OM TE SPINNEN`,
				no: `DU KAN KJØPE GRATISSPINN FRA ${minBFValue} OG OPPOVER ELLER ØKE INNSATSEN DIN TIL ${betValue} FOR Å SPINNE`,
				pl: `"MOŻESZ KUPIĆ DARMOWE OBROTY OD ${minBFValue} LUB ZWIĘKSZYĆ STAWKĘ DO ${betValue}, ABY ZAKRĘCIĆ."`,
				pt: `PODE COMPRAR RODADAS GRÁTIS A PARTIR DE ${minBFValue} OU AUMENTAR A SUA APOSTA PARA ${betValue} PARA RODAR`,
				ru: `ВЫ МОЖЕТЕ КУПИТЬ БЕСПЛАТНЫЕ СПИНЫ ОТ ${minBFValue} И ВЫШЕ ИЛИ УВЕЛИЧИТЬ СТАВКУ ДО ${betValue} НА СПИН`,
				sk: `MÔŽETE SI KÚPIŤ ROZTOČENIE ZDARMA OD ${minBFValue} A VYŠŠIE ALEBO ZVÝŠIŤ SVOJU STÁVKU NA ${betValue} A ROZTOČIŤ`,
				sr: `MOŽETE KUPITI BESPLATNE OKRETE OD ${minBFValue} ILI POVEĆATI SVOJU OPKLADU NA ${betValue} ZA OKRETANJE`,
				sv: `DU KAN KÖPA GRATISSPINN FRÅN ${minBFValue} OCH HÖGRE ELLER ÖKA DIN INSATS TILL ${betValue} FÖR ATT SPINNA`,
				th: `คุณสามารถซื้อการหมุนฟรีได้จาก ${minBFValue} ขึ้นไป หรือเพิ่มการเดิมพันของคุณเป็น ${betValue} เพื่อหมุน`,
				tr: `${minBFValue} VE ÜZERI ÜCRETSIZ DÖNDÜRME SATIN ALABILIR VEYA DÖNDÜRMEK IÇIN BAHSINIZI ${betValue}'E YÜKSELTEBILIRSINIZ`,
				uk: `ВИ МОЖЕТЕ КУПИТИ БЕЗКОШТОВНІ ОБЕРТАННЯ ВІД ${minBFValue} І ВИЩЕ АБО ЗБІЛЬШИТИ СТАВКУ ДО ${betValue} НА ОБЕРТАННЯ`,
				vi: `BẠN CÓ THỂ MUA VÒNG QUAY MIỄN PHÍ TỪ ${minBFValue} TRỞ LÊN HOẶC TĂNG CƯỢC CỦA BẠN LÊN ${betValue} ĐỂ QUAY`,
				zh: `您可以购买 ${minBFValue} 及以上的免费旋转，或将投注额提高到 ${betValue} 以进行旋转`,
				zt: `您可以從 ${minBFValue} 開始購買免費旋轉，或者將您的投注增加到 ${betValue} 進行旋轉`

			};

			warningText = warningTextMap[UHT_CONFIG.LANGUAGE];
			if (warningText == undefined)
				warningText = warningTextMap.en;


			if (window["BuyFeature_InterfaceLink"])
			{
				var bf_if = globalRuntime.sceneRoots[1].GetComponentsInChildren(BuyFeature_InterfaceLink)[0];
				purchaseType = bf_if.purchaseType;
			}

			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
			if (localizationRoot != undefined)
			{
				//desktop
				var isRK = false;
				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") != -1)
							isRK = true;
					}
				}
				var labelTransform = localizationRoot.transform.Find("GUI/Interface/Windows/BetsWindow/Content/BetInCoins/Bet/Bet/TitleLines/Text/CoinsPerLineLabel");
				if (labelTransform != null)
				{
					//bet in coins
					var newObj = instantiate(labelTransform.gameObject);
					newObj.SetActive(false);
					var parent = localizationRoot.transform.Find("GUI/Interface/Windows/BetsWindow/Content/BetInCoins");
					if (parent == null)
						return;
					newObj.transform.SetParent(parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelCoins = newObj.GetComponent(UILabel);
					labelCoins.text = warningText;
					labelCoins.overflow = 0;
					labelCoins.width = 374;
					labelCoins.height = 50;
					labelCoins.transform.localPosition(0,-377,0);
					labelCoins.resize = 1;
					labelCoins.maxLines = 2;
					labelCoins.Start();
					labelCoins.init(true);
					windowTargetsDesk.push(labelCoins);
					var oUIL_OELCO = labelCoins.OnEnable;
					labelCoins.OnEnable = function()
					{
						oUIL_OELCO.apply(this, arguments);
						for (var i = 0; i < onScreenTargetsDesk.length; i++)
						{
							onScreenTargetsDesk[i].gameObject.SetActive(false);
						}
					}
					var oUIL_ODLCO = labelCoins.OnDisable;
					labelCoins.OnDisable = function()
					{
						oUIL_ODLCO.apply(this, arguments);
						for (var i = 0; i < onScreenTargetsDesk.length; i++)
						{
							onScreenTargetsDesk[i].gameObject.SetActive(showBetWarning);
						}
					}
					var bkgTransform = localizationRoot.transform.Find("GUI/Interface/Windows/BetsWindow/Content/BetInCoins/Background/bkg");
					if (bkgTransform != null)
					{
						var sprite = bkgTransform.GetComponent(UISprite);
						if (sprite != null)
						{
							if (isRK)
							{
								sprite.height = 675;
								bkgTransform.localPosition(12, -100, 0);
							}
							else
							{
								sprite.height = 645;
								bkgTransform.localPosition(0, -85, 0);
							}
						}
					}

					//bet in cash new
					var betGridTransform = localizationRoot.transform.Find("GUI/Interface/Windows/BetsWindow/Content/BetInCashNew/BetGrid");
					if (betGridTransform != null)
					{
						var betGrid = betGridTransform.GetComponent(BetGridManager);
						if (betGrid != null)
						{
							betGrid.bottomPadding = 60;
							var newObj = instantiate(labelTransform.gameObject);
							newObj.SetActive(false);
							newObj.transform.SetParent(betGridTransform.parent, false);
							newObj.SetActive(true);
							newObj.SetActive(false);
							var labelCash = newObj.GetComponent(UILabel);
							labelCash.text = warningText;
							labelCash.overflow = 0;
							labelCash.width = 574;
							labelCash.height = 80;
							labelCash.transform.localPosition(0, 33, 0);
							labelCash.resize = 1;
							labelCash.maxLines = 2;
							labelCash.Start();
							labelCash.init(true);
							windowTargetsDesk.push(labelCash);
							var oUIL_OECA = labelCash.OnEnable;
							labelCash.OnEnable = function()
							{
								oUIL_OECA.apply(this, arguments);
								for (var i = 0; i < onScreenTargetsDesk.length; i++)
								{
									onScreenTargetsDesk[i].gameObject.SetActive(false);
								}

							}
							var oUIL_ODCA = labelCash.OnDisable;
							labelCash.OnDisable = function()
							{
								oUIL_ODCA.apply(this, arguments);
								for (var i = 0; i < onScreenTargetsDesk.length; i++)
								{
									onScreenTargetsDesk[i].gameObject.SetActive(showBetWarning);
								}
							}
							var oBGM_GGD = BetGridManager.prototype.GenerateGridDesktop;
							BetGridManager.prototype.GenerateGridDesktop = function()
							{
								oBGM_GGD.apply(this, arguments);
								var titlePos = this.title.transform.localPosition();
								labelCash.transform.localPosition(titlePos.x, 33, 0);
							}
						}
					}
				}

				var topBarTransform = localizationRoot.transform.Find("GUI/Interface/TopBar/Background/Sprite");
				if (topBarTransform != null)
				{
					var newObj = instantiate(labelTransform.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(topBarTransform.parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelTopBar = newObj.GetComponent(UILabel);
					labelTopBar.text = warningText;
					labelTopBar.overflow = 0;
					labelTopBar.width = 850;
					labelTopBar.height = 80;
					labelTopBar.transform.localPosition(-100,103,0);
					labelTopBar.resize = 1;
					labelTopBar.maxLines = 2;
					labelTopBar.Start();
					labelTopBar.init(true);
					onScreenTargetsDesk.push(labelTopBar);

					var topBarBkgTransform = localizationRoot.transform.Find("GUI/Utils/GUIArranger/UpLeft/Up");
					if (topBarBkgTransform != null)
					{
						var newObj = instantiate(topBarBkgTransform.gameObject);
						newObj.SetActive(false);
						newObj.transform.SetParent(topBarTransform.parent, false);
						newObj.SetActive(true);
						newObj.SetActive(false);
						var topBarBkgSprite = newObj.GetComponent(UISprite);
						topBarBkgSprite.width = 870;
						topBarBkgSprite.height = 80;
						topBarBkgSprite.transform.localPosition(-100, 103, 0);
						topBarBkgSprite.anchorX = 0.5;
						topBarBkgSprite.anchorY = 0.5;
						topBarBkgSprite.color.r = 0;
						topBarBkgSprite.color.g = 0;
						topBarBkgSprite.color.b = 0;
						topBarBkgSprite.color.a = 0.6;
						topBarBkgSprite.Start();
						onScreenTargetsDesk.push(topBarBkgSprite);
					}
				}

				//mobile portrait
				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI_mobile/PragmaticPlay/PPAnchorLand/PPArrangeableLand/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") != -1)
							isRK = true;
					}
				}

				var labelPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCoins/Bet/Title/BetTitleLines/Text/CoinsPerLineLabel");
				if (labelPortTransform != null)
				{
					//bet in coins
					var newObj = instantiate(labelPortTransform.gameObject);
					newObj.SetActive(false);
					var parent = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCoins");
					if (parent == null)
						return;
					newObj.transform.SetParent(parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelPortCoins = newObj.GetComponent(UILabel);
					labelPortCoins.text = warningText;
					labelPortCoins.fontSize = 60;
					labelPortCoins.overflow = 0;
					labelPortCoins.width = 1200;
					labelPortCoins.height = 140;
					labelPortCoins.transform.localPosition(0,-1070,0);
					labelPortCoins.resize = 1;
					labelPortCoins.maxLines = 2;
					labelPortCoins.Start();
					labelPortCoins.init(true);
					windowTargetsMobile.push(labelPortCoins);
					var oUIL_OECOP = labelPortCoins.OnEnable;
					labelPortCoins.OnEnable = function()
					{
						oUIL_OECOP.apply(this, arguments);
						for (var i = 0; i < onScreenTargetsMobile.length; i++)
						{
							onScreenTargetsMobile[i].gameObject.SetActive(false);
						}

					}
					var oUIL_ODCOP = labelPortCoins.OnDisable;
					labelPortCoins.OnDisable = function()
					{
						oUIL_ODCOP.apply(this, arguments);
						for (var i = 0; i < onScreenTargetsMobile.length; i++)
						{
							onScreenTargetsMobile[i].gameObject.SetActive(showBetWarning);
						}
					}
					var bkgPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCoins/Background/bkg");
					if (bkgPortTransform != null)
					{
						var sprite = bkgPortTransform.GetComponent(UISprite);
						if (sprite != null)
						{
							if (isRK)
							{
								sprite.height = 800;
								bkgPortTransform.localPosition(32, -210, 0);
							}
							else
							{
								sprite.height = 773;
								bkgPortTransform.localPosition(0, -191, 0);
							}
						}
					}

					//bet in cash new
					var betGridPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCashNew/BetGrid");
					if (betGridPortTransform != null)
					{
						var betGrid = betGridPortTransform.GetComponent(BetGridManager);
						if (betGrid != null)
						{
							betGrid.bottomPadding = 110;
							var newObj = instantiate(labelPortTransform.gameObject);
							newObj.SetActive(false);
							newObj.transform.SetParent(betGridPortTransform.parent, false);
							newObj.SetActive(true);
							newObj.SetActive(false);
							var labelPortCash = newObj.GetComponent(UILabel);
							labelPortCash.text = warningText;
							labelPortCash.overflow = 0;
							labelPortCash.width = 1000;
							labelPortCash.height = 100;
							labelPortCash.transform.localPosition(0, -640, 0);
							labelPortCash.resize = 1;
							labelPortCash.maxLines = 2;
							labelPortCash.Start();
							labelPortCash.init(true);
							windowTargetsMobile.push(labelPortCash);
							var oUIL_OECAP = labelPortCash.OnEnable;
							labelPortCash.OnEnable = function()
							{
								oUIL_OECAP.apply(this, arguments);
								for (var i = 0; i < onScreenTargetsMobile.length; i++)
								{
									onScreenTargetsMobile[i].gameObject.SetActive(false);
								}

							}
							var oUIL_ODCAP = labelPortCash.OnDisable;
							labelPortCash.OnDisable = function()
							{
								oUIL_ODCAP.apply(this, arguments);
								for (var i = 0; i < onScreenTargetsMobile.length; i++)
								{
									onScreenTargetsMobile[i].gameObject.SetActive(showBetWarning);
								}
							}
							var oBGM_GGM = betGrid.GenerateGridMobile;
							betGrid.GenerateGridMobile = function()
							{
								oBGM_GGM.apply(this, arguments);
								var titlePos = this.title.transform.localPosition();
								labelPortCash.transform.localPosition(titlePos.x, -this.background.height / 2 + labelPortCash.height / 2, 0);
							}
						}
					}
				}

				var topBarPortTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/TopBar/TopBarBackground/TopBarBackgroundSprite");
				if (topBarPortTransform != null)
				{
					var newObj = instantiate(labelPortCoins.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(topBarPortTransform.parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelTopBarPort = newObj.GetComponent(UILabel);
					labelTopBarPort.text = warningText;
					labelTopBarPort.overflow = 0;
					labelTopBarPort.width = 1300;
					labelTopBarPort.height = 100;
					labelTopBarPort.transform.localPosition(0,193,0);
					labelTopBarPort.transform.localScale(1,1.176,1);
					labelTopBarPort.resize = 1;
					labelTopBarPort.maxLines = 2;
					labelTopBarPort.dontIgnoreLocalScale = true;
					labelTopBarPort.Start();
					labelTopBarPort.init(true);
					onScreenTargetsMobile.push(labelTopBarPort);

					var topBarPortBkgTransform = localizationRoot.transform.Find("GUI_mobile/Utils/GUIArranger/UpLeft/Up");
					if (topBarPortBkgTransform != null)
					{
						var newObj = instantiate(topBarPortBkgTransform.gameObject);
						newObj.SetActive(false);
						newObj.transform.SetParent(topBarPortTransform.parent, false);
						newObj.SetActive(true);
						newObj.SetActive(false);
						var topBarPortBkgSprite = newObj.GetComponent(UISprite);
						topBarPortBkgSprite.width = 1300;
						topBarPortBkgSprite.height = 100;
						topBarPortBkgSprite.transform.localPosition(0, 198, 0);
						topBarPortBkgSprite.transform.localScale(1,1.176,1);
						topBarPortBkgSprite.anchorX = 0.5;
						topBarPortBkgSprite.anchorY = 0.5;
						topBarPortBkgSprite.color.r = 0;
						topBarPortBkgSprite.color.g = 0;
						topBarPortBkgSprite.color.b = 0;
						topBarPortBkgSprite.color.a = 0.4;
						topBarPortBkgSprite.Start();
						onScreenTargetsMobile.push(topBarPortBkgSprite);
					}
				}
				//mobile landscape
				var labelLandTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BetsWindow/Content/BetInCoins/Bet/Bet/Title/TitleLines/Text/CoinsPerLineLabel");
				if (labelLandTransform != null)
				{
					//bet in coins
					var newObj = instantiate(labelLandTransform.gameObject);
					newObj.SetActive(false);
					var parent = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BetsWindow/Content/BetInCoins");
					if (parent == null)
						return;
					newObj.transform.SetParent(parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelLandCoins = newObj.GetComponent(UILabel);
					labelLandCoins.text = warningText;
					labelLandCoins.fontSize = 31;
					labelLandCoins.overflow = 0;
					labelLandCoins.width = 1300;
					labelLandCoins.height = 32;
					labelLandCoins.transform.localPosition(0,-395,0);
					labelLandCoins.resize = 1;
					labelLandCoins.maxLines = 2;
					labelLandCoins.Start();
					labelLandCoins.init(true);
					windowTargetsMobile.push(labelLandCoins);
					var oUIL_OECOL = labelLandCoins.OnEnable;
					labelLandCoins.OnEnable = function()
					{
						oUIL_OECOL.apply(this, arguments);
						for (var i = 0; i < onScreenTargetsMobile.length; i++)
						{
							onScreenTargetsMobile[i].gameObject.SetActive(false);
						}

					}
					var oUIL_ODCOL = labelLandCoins.OnDisable;
					labelLandCoins.OnDisable = function()
					{
						oUIL_ODCOL.apply(this, arguments);
						for (var i = 0; i < onScreenTargetsMobile.length; i++)
						{
							onScreenTargetsMobile[i].gameObject.SetActive(showBetWarning);
						}
					}

					var bkgLandTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BetsWindow/Content/BetInCoins/Background/bkg");
					if (bkgLandTransform != null)
					{
						var sprite = bkgLandTransform.GetComponent(UISprite);
						if (sprite != null)
						{
							if (isRK)
							{
								sprite.height = 830;
								bkgLandTransform.localPosition(12.5, -35, 0);
							}
							else
							{
								sprite.height = 560;
								bkgLandTransform.localPosition(0, -19, 0);
							}
						}
					}

					//bet in cash new
					var betGridLandTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BetsWindow/Content/BetInCashNew/BetGrid");
					if (betGridLandTransform != null)
					{
						var betGrid = betGridLandTransform.GetComponent(BetGridManager);
						if (betGrid != null)
						{
							betGrid.bottomPadding = 60;
							var newObj = instantiate(labelLandTransform.gameObject);
							newObj.SetActive(false);
							newObj.transform.SetParent(betGridLandTransform.parent, false);
							newObj.SetActive(true);
							newObj.SetActive(false);
							var labelLandCash = newObj.GetComponent(UILabel);
							labelLandCash.text = warningText;
							labelLandCash.overflow = 0;
							labelLandCash.width = 1000;
							labelLandCash.height = 50;
							labelLandCash.transform.localPosition(0, -230, 0);
							labelLandCash.resize = 1;
							labelLandCash.maxLines = 1;
							labelLandCash.Start();
							labelLandCash.init(true);
							windowTargetsMobile.push(labelLandCash);
							var oUIL_OECAL = labelLandCash.OnEnable;
							labelLandCash.OnEnable = function()
							{
								oUIL_OECAL.apply(this, arguments);
								for (var i = 0; i < onScreenTargetsMobile.length; i++)
								{
									onScreenTargetsMobile[i].gameObject.SetActive(false);
								}

							}
							var oUIL_ODCAL = labelLandCash.OnDisable;
							labelLandCash.OnDisable = function()
							{
								oUIL_ODCAL.apply(this, arguments);
								for (var i = 0; i < onScreenTargetsMobile.length; i++)
								{
									onScreenTargetsMobile[i].gameObject.SetActive(showBetWarning);
								}
							}
							var oBGM_GGM = betGrid.GenerateGridMobile;
							betGrid.GenerateGridMobile = function()
							{
								oBGM_GGM.apply(this, arguments);
								var titlePos = this.title.transform.localPosition();
								labelLandCash.transform.localPosition(titlePos.x, -this.background.height / 2 + labelLandCash.height / 2, 0);
							}
						}
					}
				}

				var topBarLandTransform = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/BottomBar/Background/bgTopSprite");
				if (topBarLandTransform != null)
				{
					var newObj = instantiate(labelLandCoins.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(topBarLandTransform.parent, false);
					newObj.SetActive(true);
					newObj.SetActive(false);
					var labelTopBarLand = newObj.GetComponent(UILabel);
					labelTopBarLand.text = warningText;
					labelTopBarLand.fontSize = 48;
					labelTopBarLand.overflow = 0;
					labelTopBarLand.width = 650;
					labelTopBarLand.height = 60;
					if (isRK)
						labelTopBarLand.transform.localPosition(0,204,0);
					else
						labelTopBarLand.transform.localPosition(0,194,0);
					labelTopBarLand.transform.localScale(1,1.6,1);
					labelTopBarLand.resize = 1;
					labelTopBarLand.maxLines = 2;
					labelTopBarLand.dontIgnoreLocalScale = true;
					labelTopBarLand.Start();
					labelTopBarLand.init(true);
					onScreenTargetsMobile.push(labelTopBarLand);

					var topBarLandBkgTransform = localizationRoot.transform.Find("GUI_mobile/Utils/GUIArranger/UpLeft/Up");
					if (topBarLandBkgTransform != null)
					{
						var newObj = instantiate(topBarLandBkgTransform.gameObject);
						newObj.SetActive(false);
						newObj.transform.SetParent(topBarLandTransform.parent, false);
						newObj.SetActive(true);
						newObj.SetActive(false);
						var topBarLandBkgSprite = newObj.GetComponent(UISprite);
						topBarLandBkgSprite.width = 700;
						topBarLandBkgSprite.height = 60;
						if (isRK)
							topBarLandBkgSprite.transform.localPosition(0, 204, 0);
						else
							topBarLandBkgSprite.transform.localPosition(0, 194, 0);
						topBarLandBkgSprite.transform.localScale(1,1.6,1);
						topBarLandBkgSprite.anchorX = 0.5;
						topBarLandBkgSprite.anchorY = 0.5;
						topBarLandBkgSprite.color.r = 0;
						topBarLandBkgSprite.color.g = 0;
						topBarLandBkgSprite.color.b = 0;
						topBarLandBkgSprite.color.a = 0.6;
						topBarLandBkgSprite.Start();
						onScreenTargetsMobile.push(topBarLandBkgSprite);
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_BetChanged, OnBetChanged, this);
			XT.RegisterCallbackEvent(Vars.Evt_CodeToData_IntroClosedOrSkipped, OnIntro, this);
			XT.RegisterCallbackBool(Vars.Logic_IsFreeSpin, OnLogicIsFreeSpin, this);

			var oSR_CS = StageResult.prototype.CanSpin;
			StageResult.prototype.CanSpin = function()
			{

				if (showBetWarning && !IsFeatureBought() && !CoinManager.isStrictMode)
				{
					SystemMessageManager.ShowMessage(SystemMessageType.NoMoney, false, warningText, null);
					return false;
				}
				var canSpin = oSR_CS.apply(this, arguments);
				if (showBetWarning && (IsFeatureBought() || CoinManager.isStrictMode) && canSpin)
					HideOnScreenWarning();

				if (!IsFeatureBought() && XT.GetBool(InterfaceVars.BUY_BetController_visible)) // pressed X, no buy
					canSpin = false;

				return canSpin;
			}
		}
		if (GameEvents["evtXTRegisterCallbacks"] != null)
			EventManager.AddHandler(GameEvents.evtXTRegisterCallbacks, function() { XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this); }, this);
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
	interval: 50
});

UHTPatch({
	name: "PatchTournamentPointsNotificationPort",
	ready: function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function()
	{
		var onIntro = function()
		{
			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
			if (localizationRoot != undefined)
			{
				var bkg = localizationRoot.transform.Find("GUI_mobile/TournamentPointsNotification/Portrait/Content/Holder/bkg");
				if (bkg != null)
				{
					var s = bkg.localScale();
					bkg.localScale(2, s.y, s.z);
					var newObj = instantiate(bkg.gameObject);
					newObj.SetActive(false);
					newObj.transform.SetParent(bkg.transform.parent, false);
					newObj.SetActive(true);
					newObj.GetComponent(UISprite).Start();
				}
				var xbtn = localizationRoot.transform.Find("GUI_mobile/TournamentPointsNotification/Portrait/Content/Holder/Button/MinimizeButton");
				if (xbtn != null)
				{
					var sprite = xbtn.GetComponentsInChildren(UISprite, true);
					if (sprite.length > 0)
					{
						sprite[0].color.r = 1;
						sprite[0].color.g = 1;
						sprite[0].color.b = 1;
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_CodeToData_IntroClosedOrSkipped, onIntro, this);	
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "ShowPPClassic",
	ready: function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined)
	},
	apply: function()
	{
		if (IsRequired("CLASSIC"))
		{
			var shouldApply = 
			["vs25wolfgold","vs25mustang","vs25chilli","vs10firestrike","vs5joker","vsprg5joker","vs25dragonkingdom","vs15diamond","vs5aztecgems","vs5aztecgems_jp","vsprg5aztecgems","vs9aztecgemsdx","vs20rhino","vsprg20rhino","vs5super7","vs1masterjoker","vs1dragon8","vs1dragon8_jp","vs5jjwild","vs25wolfgold_cv4","vs25wolfgoldgr_cv58","vs25wolfgoldlim","vs25mustang_cv27","vs25mustanggr_cv58","vs25chilli_cv17","vs25chilligr_cv58","vs10firestrike_cv37","vs10fstrikegr_cv58","vsprg5joker_cv77","vs5joker_cv18","vs5jokergr_cv58","vs5jokerlim","vs25dragonking_cv2","vs25dragonknggr_cv58","vs15diamond_cv11","vs15diamondgr_cv58","vsprg5aztecgems_cv77","vs5aztecgems_cv17","vs9aztcgmsdxgr_cv61","vs9aztecgemsdx_cv52","vsprg20rhino_cv77","vs20rhino_cv20","vs20rhinogr_cv61","vs5super7_cv41","vs5super7gr_cv58","vs1masterjoker_cv43","vs1mjokergr_cv58","vs1dragon8_cv6","vs5jjwild_cv99","vs5hotburn","vsprg5hburn","vsprg5hburn_cv77","vs5hotburn_cv46","vs5hburngr_cv58"].indexOf(UHT_CONFIG.SYMBOL) > -1;
			if (!shouldApply)
				return;
			var retryCounter = 0;
			var successCallback = function()
			{

			};

			var errorCallback = function()
			{
				document.getElementsByTagName("HEAD")[0].removeChild(script);
				if (retryCounter < 5)
				{
					retryCounter++;
					setTimeout(function(){script = loadScript(path, successCallback, errorCallback);}, 200);
				}
			};

			var loadScript = function(url, loadCallback, errorCallback)
			{
				var script = document.createElement("script");
				script.src = url;

				if(loadCallback != undefined)
					script.onload = loadCallback;

				if(errorCallback != undefined)
				{
					script.onabort = errorCallback;
					script.onerror = errorCallback;
				}

				document.getElementsByTagName("HEAD")[0].appendChild(script);

				return script;
			}

			var path = "";
			var split = UHT_CONFIG.GAME_URL.split("/");
			split.splice(split.indexOf(UHT_GAME_CONFIG.GAME_SYMBOL) - 2);
			path = split.join("/") + "/";
			path += "PP_Classic.js";
			var script = loadScript(path, successCallback, errorCallback);

			if (window["UHT_CUSTOM_LOADER"] == true)
			{
				UHTPatch({
					name: "PatchHideFirstLoaderForClassic",
					ready:function()
					{
						return (window["UHTEngine"] != undefined && window["UHTEngine"]["HideFirstLoader"] != undefined);
					},
					apply:function()
					{
						var oUHTE_HL = UHTEngine.HideFirstLoader;
						UHTEngine.HideFirstLoader = function()
						{
							oUHTE_HL.apply(this, arguments);
							var clientLoader = globalRuntime.sceneRoots[0].GetComponentsInChildren(ClientLoader,true)[0];
							clientLoader.scaledBar.transform.parent.gameObject.SetActive(false);
							clientLoader.gameObject.GetComponentInChildren(ClientLoaderAnimation).gameObject.SetActive(false);
							if (window["ppLogoShouldBeHidden"] == true)
								window["ppLogoShouldBeHidden"] = false;
							if (window["scaleLoadingBar"] != undefined) 
								window["scaleLoadingBar"]();
							var customLoader = globalRuntime.sceneRoots[0].transform.Find("UI Root/LoaderParent/Loader/CustomContent");
							if (customLoader != null && customLoader.gameObject != null)
							{
								customLoader.gameObject.SetActive(false);
							}
							window["UHT_CUSTOM_LOADER"] = false;
						};
					},
					retry:function()
					{
						return (window["Renderer"] == undefined);
					},
					interval: 50
				});
			}
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	},
	interval: 50
});


UHTPatch({
	name: "DisableCashSwitch",
	ready: function()
	{
		return (window["CoinsSwitcher"] != null);
	},
	apply: function()
	{
		var noSwitch = IsRequired("NOCS");

		var oVSCXTL_SHC = VideoSlotsConnectionXTLayer.prototype.SetHasCoins;
		VideoSlotsConnectionXTLayer.prototype.SetHasCoins = function()
		{
			XT.SetBool(InterfaceVars.ShowCoinsAndCashHint, false);
			
			if (noSwitch)
			{
				XT.SetBool(Vars.HasCoins, true);
				oVSCXTL_SHC.apply(this, [true]);
			}
			else
				oVSCXTL_SHC.apply(this, arguments);
		}
		
		if (noSwitch)
		{
			CoinsSwitcher.prototype.OnPress = function() {};
			var oVSCXTL_US = VideoSlotsConnectionXTLayer.prototype.UpdateSettings;
			VideoSlotsConnectionXTLayer.prototype.UpdateSettings = function()
			{
				if (arguments[1] != undefined)
					if (arguments[1].Settings != undefined)
						arguments[1].Settings.Coins = true;
				oVSCXTL_US.apply(this, arguments);
			}
			
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchRemoveRedSkinDDW",
	ready: function()
	{
		return (window["DropsAndWinsIconOpt"] != null);
	},
	apply: function()
	{
		DropsAndWinsIconOpt.prototype.GetDNWSpriteName = function()
		{
			var ret = this.gameObject.GetComponent(UISprite).spriteName;
			var key = "region";
			if (UHT_GAME_CONFIG_SRC[key] == undefined || UHT_GAME_CONFIG_SRC[key] != "Asia")
				return ret;
			if (ret.indexOf("drop_win_add_promo") == -1 && ret.indexOf("DDW_Landscape") == -1 && ret.indexOf("DDW_Portrait") == -1)
				ret += "_as";
			return ret;
		};
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "HideQuickSpinHint",
	ready: function()
	{
		return (window["QuickSpinWindowController"] != null);
	},
	apply: function()
	{
		if (IsRequired("HQSW"))
		{
			var oQSWC_OGI = QuickSpinWindowController.prototype.OnGameInit;
			QuickSpinWindowController.prototype.OnGameInit = function()
			{
				XT.SetBool(InterfaceVars.ShowFastPlayHint, false);
				oQSWC_OGI.apply(this, arguments);
			}
		}
	},
	retry: function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDisplayStyleAwareContent",
	ready:function()
	{
		return (window["DisplayStyleAwareContent"] != undefined);
	},
	apply:function()
	{
		DisplayStyleAwareContent.prototype.XTRegisterCallbacks = function()
		{
			XT.RegisterCallbackString(TournamentVars.RankPromotionID, this.OnDisplayStyleChanged, this);
		};

		DisplayStyleAwareContent.prototype.OnDisplayStyleChanged = function(value)
		{
			var tournament = PromotionsHelper.FindPromotion(value);
			if (tournament != null)
			{
				var idx = this.displayStyles.indexOf(tournament.displayStyle);
				if (idx > -1)
					this.CATLinks[idx].Start();
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentParseVsFreeRound",
	ready:function()
	{
		return (window["VSProtocolParser"] != undefined);
	},
	apply:function()
	{
		VSProtocolParser.ParseVsFreeRound = function(nameValues)
		{
			var isFromInit = VSProtocolParser.firstFRBparse;
			VSProtocolParser.firstFRBparse = false;

			var isFreeRoundEnd = false;
			if (XT.GetBool(Vars.DontShowFRBEndWindowOnInit) && isFromInit)
			{
				var evts = VSProtocolParser.ParseVsFreeRoundEvents(nameValues);
				if (evts != null && evts.length > 0)
				{
					var curEvt = evts[0];
					if (curEvt.Type == VsFreeRoundEvent.EventType.Finish && evts.length == 1)
					{
						isFreeRoundEnd = true;
					}
				}
			}

			if (nameValues[GameProtocolDictionary.FreeRound.RoundsLeft] != undefined
				&& nameValues[GameProtocolDictionary.FreeRound.TotalWin] != undefined && !isFreeRoundEnd)
			{
				var res = new VsFreeRound();
				res.RoundsLeft = GameProtocolCommonParser.ParseInt(nameValues, GameProtocolDictionary.FreeRound.RoundsLeft);
				res.TotalWin = GameProtocolCommonParser.ParseDouble(nameValues, GameProtocolDictionary.FreeRound.TotalWin);
				if (isFromInit && XT.GetBool(Vars.DontShowFRBEndWindowOnInit))
					res.TotalWin = 0;

				if (nameValues[GameProtocolDictionary.FreeRound.RoundType] != undefined)
				{
					var type = nameValues[GameProtocolDictionary.FreeRound.RoundType];
					switch(type)
					{
						case "N":
							res.Type = VsFreeRound.RoundType.Spins;
							break;
						case "T":
							res.Type = VsFreeRound.RoundType.Timed;
							break;
						case "F":
							res.Type = VsFreeRound.RoundType.BonusBoost;
							break;
						default:
							break;
					}
				}
				res.BonusCode = GameProtocolCommonParser.ParseIfExist(nameValues, GameProtocolDictionary.FreeRound.BonusCode);

				return res;
			}

			return null;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentConnectionForTournamentRank",
	ready:function()
	{
		return (window["TournamentConnection"] != undefined);
	},
	apply:function()
	{
		TournamentConnection.prototype.GetPromotionForRankInfo = function()
		{
			var ret = [];

			var addedAnyTournament = false;
			var addedAnyRace = false;

			for (var i = 0; i < this.promoHolders.length; ++i)
			{
				var promo = this.promoHolders[i];
				if (promo.promotion != null && promo.promotion.clientMode == TournamentProtocol.ClientMode.Visible && promo.type != TournamentProtocol.PromoType.Invalid)
				{
					if (_string.IsNullOrEmpty(promo.promotion.uid))
						promo.promotion.uid = promo.uid;

					if (promo.type == TournamentProtocol.PromoType.Tournament)
					{
						if (promo.promotion.status == TournamentProtocol.StatusCode.Open || !addedAnyTournament || (XT.GetBool(TournamentVars.DisplayingPromotionsInOtherGames) && (promo.promotion.status == TournamentProtocol.StatusCode.StartsSoon)))
							ret.push(promo.promotion);
						addedAnyTournament = true;
					}
					if (promo.type == TournamentProtocol.PromoType.Race)
					{
						if (promo.promotion.status == TournamentProtocol.StatusCode.Open || !addedAnyRace || (XT.GetBool(TournamentVars.DisplayingPromotionsInOtherGames) && (promo.promotion.status == TournamentProtocol.StatusCode.StartsSoon)))
							ret.push(promo.promotion);
						addedAnyRace = true;
					}
				}
			}
			return ret.length > 0 ? ret : null;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "FixNotoQuickSpinWindow",
	ready: function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function()
	{
		var onIntro = function()
		{
			if (UHT_CONFIG.LANGUAGE == "en")
			{
				var styles = document.getElementsByTagName("style");
				var hasNewFont = false;
				for (var i = 0; i < styles.length; i++)
				{
					if (styles[i].outerHTML.indexOf('f1198a4357aed9f041a6de9a664568c') != -1)
					{
						hasNewFont = styles[i].outerHTML.split("base64,")[1].indexOf("d09GRgABAAAAAEVs") == 0;
					}
				}

				if (!hasNewFont)
					return;
				if (!Globals.isMobile)
				{
					var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
					if (localizationRoot != undefined)
					{
						var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel");
						if (pragmaticPlayLabelTransform != null)
						{
							var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
							if (pragmaticPlayLabel != null)
							{
								if (pragmaticPlayLabel.text.indexOf("REEL") != -1)
									return;
							}
						}

						var tempTransform = localizationRoot.transform.Find("GUI/QuickSpinAnimator/QuickSpin/Window/Content/Text/IfYouWantToPlayFasterLabel");
						if (tempTransform != null)
						{
							var label = tempTransform.GetComponentsInChildren(UILabel, true)[0];
							if (label != undefined)
							{
								if (label.width == 1395)
								{
									label.width = 1033;
									label.text = 'If you want to play faster, you can enable QUICK SPIN or hold SPACE for TURBO SPIN.\n\nYou can disable the feature from the        button.'
								}

								var sprite = localizationRoot.transform.Find("GUI/QuickSpinAnimator/QuickSpin/Window/Content/Text/Sprite");
								if (sprite != null)
									sprite.localPosition(203, -43.7, 0);
							}
						}
					}
				}
				else
				{
					var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
					if (localizationRoot != undefined)
					{
						var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI_mobile/PragmaticPlay/PPAnchorLand/PPArrangeableLand/PragmaticPlayLabel");
						if (pragmaticPlayLabelTransform != null)
						{
							var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
							if (pragmaticPlayLabel != null)
							{
								if (pragmaticPlayLabel.text.indexOf("REEL") != -1)
								{
									sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Port/Text/MenuIcon");
									if (sprite != null)
									{
										var pos = sprite.localPosition();
										if (pos.y == -206.6)
											sprite.localPosition(14.4, -135, 0);
									}

									var sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Land/Text/SpinIcon");
									if (sprite != null)
									{
										var pos = sprite.localPosition();
										sprite.localPosition(-119, 10, 0);
									}

									sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Land/Text/MenuIcon");
									if (sprite != null)
									{
										var pos = sprite.localPosition();
										sprite.localPosition(294, -106, 0);
									}

									return;
								}
							}
						}

						var sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Land/Text/SpinIcon");
						if (sprite != null)
						{
							var pos = sprite.localPosition();
							if (pos.x != -125.7)
								sprite.localPosition(-125.7, 6.5, 0);
						}

						sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Land/Text/MenuIcon");
						if (sprite != null)
						{
							var pos = sprite.localPosition();
							if (pos.x != 315)
								sprite.localPosition(315, -99.7, 0);
						}

						sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Port/Text/SpinIcon");
						if (sprite != null)
						{
							var pos = sprite.localPosition();
							if (pos.x != 126.5)
								sprite.localPosition(126.5, 85.5, 0);
						}

						sprite = localizationRoot.transform.Find("GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Port/Text/MenuIcon");
						if (sprite != null)
						{
							var pos = sprite.localPosition();
							if (pos.y != -206.6)
								sprite.localPosition(14.4, -206.6, 0);
						}
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_CodeToData_IntroClosedOrSkipped, onIntro, this);	
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

var XStype = false;

UHTPatch({
	name: "PatchXS_KB",
	ready: function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function()
	{
		XStype = IsRequired("XS");
		if (XStype != false)
			XStype = XStype[0];
		if (IsRequired("XS_KB"))
			XStype = "KB";
		
		if (XStype && !Globals.isMini && (window["MultiLobbyConnection"] != undefined))
		{
			var scriptsToLoad = 1;
			if(XStype != "KB" && XStype != "BRTS")
				scriptsToLoad = 2;
			
			var introSkipped = false;
			
			var scriptLoaded = [];
			var retryCounter = [];
			var successCallbacks = [];
			var errorCallbacks = [];
			var paths = [];
			var scripts = [];
			
			var loadScript = function(url, loadCallback, errorCallback)
			{
				var script = document.createElement("script");
				script.src = url;

				if(loadCallback != undefined)
					script.onload = loadCallback;

				if(errorCallback != undefined)
				{
					script.onabort = errorCallback;
					script.onerror = errorCallback;
				}

				document.getElementsByTagName("HEAD")[0].appendChild(script);

				return script;
			}

			var split = UHT_CONFIG.GAME_URL.split("/");
			split.splice(split.indexOf(UHT_GAME_CONFIG.GAME_SYMBOL) - 2);
			var rootPath = split.join("/") + "/";
			
			if(scriptsToLoad > 1)
			{
				var lang = window["UHT_GAME_CONFIG"]["LANGUAGE"];
				paths[0] = rootPath+"XS_GNR.js";
				paths[1] = rootPath+"XS_"+XStype+"_"+lang+".js";
			}
			else
				paths[0] = rootPath+"XS_" + XStype + ".js";

			var allScriptsLoaded = function()
			{
				var allLoaded = true;
				for(var i=0; i < scriptsToLoad; i++)
				{
					if(!scriptLoaded[i])
					{
						allLoaded = false;
						break;
					}
				}
				return allLoaded;
			}

			var loadScriptWithRetries = function(index)
			{
				scriptLoaded[index] = false;
				retryCounter[index] = 0;
				
				successCallbacks[index] = function()
				{
					scriptLoaded[index] = true;
					if (introSkipped && allScriptsLoaded())
						injectXS_KB();
				};

				errorCallbacks[index] = function()
				{
					document.getElementsByTagName("HEAD")[0].removeChild(scripts[index]);
					if (retryCounter[index] < 5)
					{
						retryCounter[index]++;
						setTimeout(function(){scripts[index] = loadScript(paths[index], successCallbacks[index], errorCallbacks[index]);}, 2000);
					}
				};

				scripts[index] = loadScript(paths[index], successCallbacks[index], errorCallbacks[index]);	
			}
			
			for(var i=0; i < scriptsToLoad; i++)
			{
				loadScriptWithRetries(i);
			}
			
			var onIntro = function()
			{
				introSkipped = true;
				
				if (allScriptsLoaded())
				{
					injectXS_KB();
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_CodeToData_IntroClosedOrSkipped, onIntro, this);
		}
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchAutoplayMALL_FRB",
	ready:function()
	{
		return (window["AutoplayControllerAdvancedV10"] != undefined);
	},
	apply:function()
	{
		AutoplayControllerAdvancedV10.prototype.UpdateStartAutoplayButton = function(s)
		{
			if (XT.GetBool(Vars.Jurisdiction_MandatoryAutoplayLossLimit))
			{
				if (this.startAutoplayButtonEnablers == null)
					this.startAutoplayButtonEnablers = this.startAutoplayButton.GetComponents(ButtonEnabler);
				if ((XT.GetObject(Vars.BonusRoundsData) == null) && (s.cashDecreasesValue < CoinManager.GetNextTotalBet()))
					for (var i = 0; i < this.startAutoplayButtonEnablers.length; ++i)
						this.startAutoplayButtonEnablers[i].DisableButton();
				else
					for (var i = 0; i < this.startAutoplayButtonEnablers.length; ++i)
						this.startAutoplayButtonEnablers[i].EnableButton()
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchResponseErrorType",
	ready:function()
	{
		return (window["GameConnection"] != undefined) && (window["GameConnection"].prototype.StoreResponse != undefined);
	},
	apply:function()
	{
		var o_GCSR = GameConnection.prototype.StoreResponse;
		GameConnection.prototype.StoreResponse = function()
		{
			if ((arguments[1] == 200) && ((arguments[0] == "pnow=1") || (arguments[0].indexOf("error_type=r") > -1)))
			{
				this.retryTimer = this.retryDelay - 0.5;
				this.retryRequest = true
			}
			else
				o_GCSR.apply(this, arguments);
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchBoss",
	ready:function()
	{
		return (window["UHTInterfaceBOSS"] != undefined);
	},
	apply:function()
	{
		var o_IBPM = UHTInterfaceBOSS.PostMessage;
		UHTInterfaceBOSS.PostMessage = function()
		{
			o_IBPM.apply(this, arguments);
			var message = arguments[0];
			if (message == "gameRoundEnded")
			{
				if (GameConnection.I != undefined)
				{
					if (GameConnection.I.requestState == RequestState.Collect || GameConnection.I.srvResponse.NextGameActions != null && GameConnection.I.srvResponse.NextGameActions.indexOf(NextGameAction.Collect) > -1)
					{
						//GameConnection.I.mustPostGameRoundEndedOnCollect = true;
						return;
					}
					if (XT.GetDouble(Vars.SpinCycleWinReceived) != 0)
						if (UHTInterfaceBOSS.OnVisualBalanceUpdate != undefined)
							UHTInterfaceBOSS.OnVisualBalanceUpdate();
				}
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchLabelChange",
	ready:function()
	{
		return (window["LabelChange"] != undefined);
	},
	apply:function()
	{
		LabelChange.prototype.SetValues = function(label) 
		{
			var copyFrom = this.newContent;
			if (this.currentPayload != -1 && this.extraPayloads != null && this.extraPayloads.length > this.currentPayload && this.extraPayloads[this.currentPayload] != null)
			{
				copyFrom = this.extraPayloads[this.currentPayload].label;
				if (copyFrom.fontName == null)
					copyFrom.fontName = this.newContent.fontName;
			}
			ModificationsManager.CopyFromLabelToLabel(copyFrom, label, !this.hasDynamicContent, this.hasCustomEffects)
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchNoMessagesAvailable",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
			var translationDict = 
			{
				"en": "No messages available",
				"ar": "لا توجد رسائل متاحة",
				"bg": "Няма налични съобщения",
				"cs": "Žádné zprávy nejsou k dispozici",
				"da": "Ingen beskeder tilgængelige",
				"de": "Keine Nachrichten verfügbar",
				"el": "Δεν υπάρχουν διαθέσιμα μηνύματα",
				"es": "No hay mensajes disponibles",
				"et": "Sõnumid puuduvad",
				"fa": "هیچ پیامی موجود نیست",
				"fi": "Ei viestejä saatavilla",
				"fr": "Aucun message disponible",
				"hr": "Nema dostupnih poruka",
				"hu": "Nincsenek elérhető üzenetek",
				"hy": "Հասանելի հաղորդագրություններ չկան",
				"id": "Tidak ada pesan yang tersedia",
				"it": "Nessun messaggio disponibile",
				"ja": "メッセージはありません",
				"ka": "არ არის შეტყობინებები",
				"ko": "사용 가능한 메시지가 없습니다.",
				"lt": "Pranešimų nėra",
				"lv": "Nav pieejami ziņojumi",
				"ms": "Tiada mesej tersedia",
				"nl": "Geen berichten beschikbaar",
				"no": "Ingen meldinger tilgjengelig",
				"pl": "Brak dostępnych wiadomości",
				"pt": "Não há mensagens disponíveis",
				"ro": "Niciun mesaj",
				"ru": "Сообщения недоступны",
				"sk": "Žiadne správy nie sú k dispozícii",
				"sr": "Nema dostupnih poruka",
				"sv": "Inga meddelanden tillgängliga",
				"th": "ไม่มีข้อความ",
				"tr": "Mesaj mevcut değil",
				"uk": "Немає доступних повідомлень",
				"vi": "Không có tin nhắn nào",
				"zh": "无留言",
				"zt": "無訊息可用"
			}

			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
			if (localizationRoot == null)
				return;

			var paths;
			if(Globals.isMobile)
			{
				paths = [
					"GUI_mobile/Tournament/Ear/Land/ScreenAnchor/Holder_Rank/Rank/Ear/Message",
					"GUI_mobile/Tournament/Ear/Land/ScreenAnchor/Holder_Rank/Rank/Ear/LocalizedLabels",
					"GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Ear/Message",
					"GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Ear/LocalizedLabels"
				];
			}
			else
			{
				paths = [
					"GUI/Tournament/ScreenAnchor/Holder_Rank/Rank/Ear/Message",
					"GUI/Tournament/ScreenAnchor/Holder_Rank/Rank/Ear/LocalizedLabels"
				];
			}

			for (var i = 0; i < paths.length; i++)
			{
				var t = localizationRoot.transform.Find(paths[i]);
				if (t != null)
				{
					var label = t.GetComponentsInChildren(UILabel, true)[0];
					if (label != null)
					{
						label.text = translationDict[UHT_CONFIG.LANGUAGE];
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchFreeRoundsLeftTopBar",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
			var FreeRoundLeftPayload = 
			{
				"en": "FREE BONUS SPINS",
				"ar": "لفات المكافأة المجانية",
				"bg": "БЕЗПЛАТНИ БОНУС ЗАВЪРТАНИЯ",
				"cs": "BONUSOVÁ OTOČENÍ ZDARMA",
				"da": "GRATIS BONUSSPINS",
				"de": "GRATIS-BONUS-SPINS",
				"el": "ΔΩΡΕΑΝ ΠΕΡΙΣΤΡΟΦΕΣ ΜΠΟΝΟΥΣ",
				"es": "TIRADAS BONUS GRATIS",
				"et": "TASUTA BOONUSKEERUTUSED",
				"fa": "چرخش پاداش رایگان",
				"fi": "ILMAISET BONUSPYÖRÄYTYKSET",
				"fr": "SPINS BONUS GRATUITS",
				"hr": "BESPLATNE BONUS VRTNJE",
				"hu": "INGYENES BÓNUSZ PÖRGETÉSEK",
				"hy": "ԱՆՎՃԱՐ ԲՈՆՈՒՍԱՅԻՆ ՍՊԻՆՆԵՐ",
				"id": "PUTARAN BONUS GRATIS",
				"it": "GIRI BONUS GRATIS",
				"ja": "フリーボーナススピン",
				"ka": "ᲣᲤᲐᲡᲝ ᲑᲝᲜᲣᲡ ᲓᲐᲢᲠᲘᲐᲚᲔᲑᲔᲑᲘ",
				"ko": "무료 보너스 스핀",
				"lt": "NEMOKAMI PREMIJOS SUKIMAI",
				"lv": "BEZMAKSAS BONUSA GRIEZIENI",
				"ms": "PUTARAN BONUS PERCUMA",
				"nl": "GRATIS BONUS SPINS",
				"no": "GRATIS BONUSSPINN",
				"pl": "DARMOWE OBROTY BONUSU",
				"pt": "RODADAS BÓNUS GRÁTIS",
				"ro": "ROTIRI GRATUITE BONUS",
				"ru": "БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНЫ",
				"sk": "VOĽNÉ BONUSOVÉ TOČENIA",
				"sr": "BESPLATNI BONUS SPINOVI",
				"sv": "GRATIS BONUSPINN",
				"th": "สปินโบนัสฟรี",
				"tr": "ÜCRETSIZ BONUS SPINLER",
				"uk": "БЕЗКОШТОВНІ БОНУСНІ ОБЕРТАННЯ",
				"vi": "VÒNG QUAY THƯỞNG MIỄN PHÍ",
				"zh": "免费奖励旋转",
				"zt": "免費獎勵旋轉"
			}

			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
			if (localizationRoot == null)
				return;

			var paths = [
				"GUI/Interface/Windows/BonusRoundsInfoTopBar/Texts/LeftText/FreeRoundLeftHolder/FreeBonusSpinsLabel",
				"GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsInfoTopBar/Texts/LeftText/FreeRoundLeftHolder/FreeBonusSpinsLabel",
				"GUI_mobile/Interface_Portrait/ContentInterface/Windows/FRBTopBarAnchorHolder/BonusRoundsInfoTopBar/Texts/LeftText/FreeRoundLeftHolder/FreeBonusSpinsLabel",
			];

			for (var i = 0; i < paths.length; i++)
			{
				var t = localizationRoot.transform.Find(paths[i]);
				if (t != null)
				{
					var label = t.GetComponentsInChildren(UILabel, true)[0];
					if (label != null)
					{
						label.text = FreeRoundLeftPayload[UHT_CONFIG.LANGUAGE];
					}
				}
			}

			var prizesRemainingPaths = [
				"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_BM/Title/Title/PrizesLeftLabel",
				"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_AGBM/Title/Title/PrizesLeftLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/PrizesRemainingLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/PrizesRemainingLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/PrizesRemainingLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/PrizesRemainingLabel"
			];

			var totalPrizesPaths = [
				"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_BM/Title/Title/NoOfPrizesLabel",
				"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_AGBM/Title/Title/NoOfPrizesLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
				"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel"
			];

			for (var i = 0; i < prizesRemainingPaths.length; i++)
			{
				var t = localizationRoot.transform.Find(prizesRemainingPaths[i]);
				if (t != null)
				{
					var label = t.GetComponentsInChildren(UILabel, true)[0];
					if (label != null)
					{
						label.anchorX = 0.5;
					}
				}
			}

			for (var i = 0; i < totalPrizesPaths.length; i++)
			{
				var t = localizationRoot.transform.Find(totalPrizesPaths[i]);
				if (t != null)
				{
					var label = t.GetComponentsInChildren(UILabel, true)[0];
					if (label != null)
					{
						label.anchorX = 1;
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideBetGrid",
	ready:function()
	{
		return (window["BetsControllerMobile"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("COCA_PM"))
		{
			var o_BCM_XTRC = BetsControllerMobile.prototype.XTRegisterCallbacks;
			BetsControllerMobile.prototype.XTRegisterCallbacks = function()
			{
				o_BCM_XTRC.apply(this, arguments);
				var children = this.cashContent.transform.parent.children;
				for (var i = 0; i < children.length; i++)
				{
					if (children[i].gameObject.name == "BetInCash")
					{
						this.cashContent = children[i].gameObject;
						break;
					}
				}
			};
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBetMaxTracking",
	ready:function()
	{
		return ((window["CoinManager"] != undefined) && (window["CoinManager"].prototype.OnSetMaxBet != undefined));
	},
	apply:function()
	{
		var GA_BETMAXPRESSEDSENT = false;
		var oCMOSMB = CoinManager.prototype.OnSetMaxBet;
		CoinManager.prototype.OnSetMaxBet = function()
		{
			if (!GA_BETMAXPRESSEDSENT)
			{
				globalTracking.SendEvent("uht_behaviour", "BetMaxPressed", 1, "BehaviourTracker");
				GA_BETMAXPRESSEDSENT = true;
			}
			oCMOSMB.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchNoMoneyBetsOverlap",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnNotEnoughMoneyForSpin = function()
		{
			XT.TriggerEvent(InterfaceVars.Evt_DataToCode_CloseAllInterfaceWindows);
		}
		XT.RegisterCallbackEvent(Vars.Evt_CodeToData_NotEnoughMoneyForSpin, this.OnNotEnoughMoneyForSpin, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchPlayLaterBonusRoundsWindowsLabelTextCopy",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["LabelTextCopy"] != undefined);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				var paths = [
					"GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts",
					"GUI/Interface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts",
					"GUI/Interface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts",
					"GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts",
					"GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts",
					"GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts",
					"GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts",
					"GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts",
					"GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts",
				];
				var fullPath = [];
				function GetParentPath(transform)
				{
					if (transform.parent != null)
					{
						fullPath.push(transform.parent.gameObject.name);
						GetParentPath(transform.parent.transform);
					}
				}

				for (var i = 0; i < paths.length; i++)
				{
					var t = localizationRoot.transform.Find(paths[i]);
					if (t != null)
					{
						var ltc = t.GetComponentsInChildren(LabelTextCopy, true);
						for(var j = 0; j < ltc.length; j++)
						{
							if (ltc[j] != null)
							{
								fullPath = [ltc[j].gameObject.name];
								GetParentPath(ltc[j].transform);
								fullPath = fullPath.reverse().join('/');
								if (fullPath.indexOf("GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/MLA/FreeBonusRounds!Label") != -1)
								{
									ltc[j].source.gameObject.AddComponent("LabelTextCopy");
									var tmp = ltc[j].source.gameObject.GetComponent(LabelTextCopy);
									if (tmp != null)
									{
										tmp.source = ltc[j].gameObject.GetComponent(UILabel);
									}
								}
								ltc[j].Awake = function()
								{
									this.myLabel = this.gameObject.GetComponent(UILabel);
									this.myLabel.fontName = this.source.fontName;
									this.myLabel.Prepare();
								};
							}
						}
					}
				}

		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchResponsePatcher_KOD",
	ready:function()
	{
		return (window["ResponsePatcher_KOD"] != undefined);
	},
	apply:function()
	{
		ResponsePatcher_KOD.prototype.HandleSpinResponse = function(param)
		{
			this.isInit = false;
			this.CountScattersOnScreen(param);
			this.ParseTrail(param);
		};
		ResponsePatcher_KOD.prototype.HandlePickBonusResponse = function(param)
		{
			this.isInit = false;
			this.CountScattersOnScreen(param);
			this.ParseTrail(param);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchSCSymbolsManager",
	ready:function()
	{
		return (window["SCSymbolsManager"] != undefined);
	},
	apply:function()
	{
		SCSymbolsManager.prototype.OnGameInit = function() 
		{
			XT.RegisterCallbackObject(Vars.ResultScreenSymbols, this.OnResultScreenSymbols, this);
			if (this.TopPrizeSymbolIsSpecial)
				this.symbolAwards[this.symbolAwards.length - 1] = XT.GetDouble(SCVars.MaxCombinationAwardDisplayed);
			this.OnResultScreenSymbols(XT.GetObject(Vars.ResultScreenSymbols));
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBetGridManager",
	ready:function()
	{
		return (window["BetGridManager"] != undefined);
	},
	apply:function()
	{
		BetCell.prototype.XTRegisterCallbacks = function()
		{
			XT.RegisterCallbackObject(Vars.TotalBets, this.OnTotalBetsChanged, this);
			this.OnTotalBetsChanged(XT.GetObject(Vars.TotalBets));
			XT.RegisterCallbackInt(Vars.NextBetIndex, this.OnNextBetIndex, this);
		}
		BetGridManager.prototype.XTRegisterCallbacks = function()
		{
			XT.RegisterCallbackObject(Vars.TotalBets, this.OnTotalBetsChanged, this);
		}

		let BetGridTitleChanged = false;
		BetGridManager.prototype.OnTotalBetsChanged = function(param)
		{
			var bets = param;
			if (bets == null)
				return;

			if (!BetGridTitleChanged)
			{
				BetGridTitleChanged = true;
				
				if (IsRequired("NOCUR_CBW"))
				{
					var langList = ["en","ar","bg","cs","da","de","el","es","et","fa","fi","fr","hr","hu","hy","id","it","ja","ka","ko","lt","lv","ms","nl","no","pl","pt","ru","sk","sr","sv","th","tr","uk","vi","zh","zt"];
					var textList = ["CHANGE BET {0}","تغيير الرهان {0}","ПРОМЯНА НА ЗАЛОГА {0}","ZMĚNIT SÁZKU {0}","SKIFT INDSATS {0}","{0} EINSATZ ÄNDERN","ΑΛΛΑΓΗ ΣΤΟΙΧΗΜΑΤΟΣ {0}","CAMBIAR APUESTA {0}","MUUDA PANUST {0}","تغییر شرط {0}","VAIHDA PANOS {0}","CHANGER LA MISE {0}","PROMIJENITE ULOG {0}","{0} TÉT MEGVÁLTOZTATÁSA","ՓՈԽԵԼ ԽԱՂԱԴՐՈՒՅՔԸ՝ {0}","UBAH TARUHAN {0}","MODIFICA PUNTATA {0}","ベット{0}を変更","ფსონის შეცვლა {0}","베팅 {0} 변경","KEISTI STATYMĄ {0}","MAINĪT LIKMI {0}","UBAH TARUHAN {0}","INZET WIJZIGEN {0}","ENDRE INNSATS {0}","ZMIEŃ ZAKŁAD {0}","ALTERAR APOSTA {0}","ИЗМЕНИТЬ СТАВКУ {0}","ZMENIŤ STÁVKU {0}","PROMENI ULOG {0}","ÄNDRA INSATS {0}","เปลี่ยนเดิมพัน {0}","{0} DEĞERİNDEKİ BAHSİ DEĞİŞTİR","ЗМІНИТИ СТАВКУ {0}","THAY ĐỔI CƯỢC {0}","更改赌注{0}","變更賭注{0}"];
					var whichLang = langList.indexOf(UHT_GAME_CONFIG.LANGUAGE);
					if (whichLang > -1)
					{
						var text = textList[whichLang].replace("{0}", LocaleManager.GetCurrencySymbol());
						var BGMs = globalRuntime.sceneRoots[1].GetComponentsInChildren(BetGridManager, true);
						for (var i=0; i<BGMs.length; i++)
						{
							var VDs = BGMs[i].title.gameObject.GetComponentsInChildren(VarDisplayer, true);
							for (var j=0; j<VDs.length; j++)
							{
								var labels = VDs[j].gameObject.GetComponentsInChildren(UILabel, true);
								for (var k=0; k<labels.length; k++)
								{
									if ((j==0) && (labels[k].gameObject.GetComponent(LabelTextCopy) == null)) //only once per BGM (j==0)
									{
										labels[k].gameObject.SetActive(false);
										var copyGO = instantiate(labels[k].gameObject);
										copyGO.transform.SetParent(BGMs[i].title, false);
										copyGO.transform.localPosition(UHTMath.Vector3.zero);
										copyGO.SetActive(true);
										
										var newlabel = copyGO.GetComponent(UILabel);
										newlabel.text = text;
										newlabel.anchorX = 0.5;
									}
								}
								VDs[j].gameObject.SetActive(false);
							}
						}
					}
				}
			}

			var maxTotalBet = XT.GetDouble(Vars.ExplicitMaxTotalBetFromServer+"AB");

			var neededCells = 0;
			for (var bIdx = 0; bIdx < bets.length; bIdx++)
				if (bets[bIdx] - 1e-3 < maxTotalBet)
					neededCells++;

			for (var cell=this.container.children.length; cell<neededCells; cell++)
			{
				var newObj = instantiate(this.betCell);
				newObj.transform.SetParent(this.container, false);
			}

			for (var cell=0; cell<this.container.children.length; cell++)
				this.container.children[cell].gameObject.SetActive(false);

			this.cells = [];
			for (var cell=0; cell<neededCells; cell++)
			{
				this.container.children[cell].gameObject.SetActive(true);
				this.cells.push(this.container.children[cell].gameObject)
			}
			if (this.isDesktop)
				this.GenerateGridDesktop();
			else
			{
				this.transform.parent.localScale(1.25,1.25,1);
				this.GenerateGridMobile()
			}
		}
		
		BetCell.prototype.OnTotalBetsChanged = function(param)
		{
			var totalBets = param;
			if (totalBets != null && this.betIndex != -1 && this.betIndex < totalBets.length)
			{
				var formatInfo = new FormatOptions();
				formatInfo.hasCurrency = !IsRequired("NOCUR_CBW");
				formatInfo.hasDecimals = !IsRequired("NODEC") && !IsRequired("NODEC_CBW");

				this.bet.text = LocaleManager.FormatValue(totalBets[this.betIndex], formatInfo);
			}
		};
		
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPadding",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{

		var pad = IsRequired("PAD");
		if (pad != false)
		{
			var offsetX=0;
			var sizeDiffX=0;
			var offsetY=0;
			var sizeDiffY=0;
			
			for (var i=0; i< pad.length; i++)
			{
				var offsetType = pad[i].split(";")[0];
				var offsetValue = parseFloat(pad[i].split(";")[1]);
				
				if (offsetType == "T")//top
				{
					offsetY = offsetValue;
					sizeDiffY += offsetValue;
				}
				if (offsetType == "B")//bottom
				{
					sizeDiffY += offsetValue;
				}
				if (offsetType == "L")//left
				{
					offsetX = offsetValue;
					sizeDiffX += offsetValue;
				}
				if (offsetType == "R")//right
				{
					sizeDiffX += offsetValue;
				}
			}
					
			var OnUHTResize = function(/**Object*/ unused)
			{
				var canv = globalRenderer.renderer.view;
				canv.style.transform = "translateX(" + offsetX + "px) translateY(" + offsetY + "px)";
				canv.style.width = (window.innerWidth - sizeDiffX)/window.innerWidth * 100 + "%";
				canv.style.height = (window.innerHeight - sizeDiffY)/window.innerHeight * 100 + "%";
			};
			
			window.addEventListener("resize", OnUHTResize, false);
			
			Renderer.prototype.checkWindowSize = function()
			{
				if (rememberedWindowWidth != window.innerWidth - sizeDiffX)
				{
					rememberedWindowWidth = window.innerWidth - sizeDiffX;
					canvasSizeDirty = true;
				}
				if (rememberedWindowHeight != window.innerHeight - sizeDiffY)
				{
					rememberedWindowHeight = window.innerHeight - sizeDiffY;
					canvasSizeDirty = true;
				}
			};
			OnUHTResize(null);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchSpinButtonAndSBIssue",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
		if (localizationRoot == null)
			return;

		var paths = [
			"GUI_mobile/Interface_Portrait/ContentInterface/DynamicContent/ContentScale/Normal/SpinButtons/StartSpin_Fake",
			"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Normal/SpinButtons/StartSpin_Fake"
		];

		var spinButtons = [];
		for (var i = 0; i < paths.length; i++)
		{
			var t = localizationRoot.transform.Find(paths[i]);
			if (t != null)
			{
				spinButtons.push(t);
			}
		}
		var ShowButtons = function()
		{
			for (var i = 0; i < spinButtons.length; i++)
				spinButtons[i].localScale(1, 1, 1);
		}

		var HideButtons = function()
		{
			for (var i = 0; i < spinButtons.length; i++)
				spinButtons[i].localScale(0, 0, 0);
		}

		var OnAutoSpinsLeft = function(value)
		{
			if (value != -1)
				HideButtons();
		};

		var OnStopAutoplay = function()
		{
			ShowButtons();
		};

		var OnStoppedAutoplayByCondition = function()
		{
			ShowButtons();
		};

		XT.RegisterCallbackInt(Vars.AutoplaySpinsLeft, OnAutoSpinsLeft, this);
		XT.RegisterCallbackEvent(Vars.Evt_DataToCode_StopAutoplay, OnStopAutoplay, this);
		XT.RegisterCallbackEvent(Vars.Evt_Internal_StoppedAutoplayByCondition, OnStoppedAutoplayByCondition, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchMinimizeEar",
	ready:function()
	{
		return (window["NotificationsManager"] != undefined && window["V3Animator"] != undefined);
	},
	apply:function()
	{
		if (Globals.isMobile || Globals.isMini) //on Mobile the ear is minimized with one V3Animator, Open_Minimized, not in 2 stages like on desktop
			return;

		var oNM_CS = NotificationsManager.prototype.ChangeState;
		var skipNextAnimatorEnd = false;
		var parentName = null;
		NotificationsManager.prototype.ChangeState = function(state)
		{
			if (this.currentEarState == NotificationsManager.EarState.Open && state == NotificationsManager.EarState.Minimized){
				if(parentName == "Default_Minimized")
					skipNextAnimatorEnd = true;
			}

			oNM_CS.apply(this, arguments);
		}

		var oV3A_IU = V3Animator.prototype.InternalUpdate;
		V3Animator.prototype.InternalUpdate = function()
		{
			var restoreOriginalCAT = null;
			if (this.isPlaying && this.currentTime >= this.animationTime &&
					   this.animationMode == V3AnimationMode.Default &&
						this.callWhenFinished != null && this.canStartCallback)
			{
				parentName = this.gameObject.transform.parent.gameObject.name;
				if(skipNextAnimatorEnd && parentName == "Open_Default" && this.callWhenFinished.cat != null)
				{
					if(this.callWhenFinished.cat.events)
					{
						var actions = this.callWhenFinished.cat.events[0].actions;

						var Minimized = null;
						for(i in actions[0].ToDisableList)
						{
							if(actions[0].ToDisableList[i].name == "Minimized")
							{
								Minimized = actions[0].ToDisableList[i];
								actions[0].ToDisableList.splice(i, 1);
								break;
							}
						}

						var oToEnableList = actions[0].ToEnableList;
						actions[0].ToEnableList = [];
						
						var oAction1 = actions[1];
						actions.pop();

						restoreOriginalCAT = function()
						{
							actions[0].ToDisableList.unshift(Minimized);
							actions[0].ToEnableList = oToEnableList;
							actions.push(oAction1);
						};
					}
				}
			}

			oV3A_IU.apply(this, arguments);

			if(restoreOriginalCAT != null)
			{
				restoreOriginalCAT();
				skipNextAnimatorEnd = false;
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPromotionsWarningWithTitle",
	ready:function()
	{
		return (window["PromotionsWarning"] != undefined);
	},
	apply:function()
	{
		if (window["NotificationsManager"] != undefined)
			return;
		PromotionsWarning.prototype.OnBetChanged = function()
		{
			if (this.details == null)
				return;

			var totalBet = XT.GetDouble(Vars.TotalBetDisplayed);
			if (isNaN(totalBet))
				return;

			var minBetLimit = -1;
			var promoTitle = "";
			var visible = false;
			for (var i = 0; i < this.details.length; ++i)
			{
				var promo = PromotionsHelper.FindPromotion(this.details[i].uid);
				var isConsidered = promo != null && promo.clientMode == TournamentProtocol.ClientMode.Visible && promo.status == TournamentProtocol.StatusCode.Open && PromotionsHelper.currentPromotionsUUID == this.details[i].uid && !promo.isActiveInOtherGames;
				if (isConsidered)
				{
					var score = null;
					if (TournamentConnection.instance != null)
					{
						var promoHolder = TournamentConnection.instance.FindPromoHolder(this.details[i].uid);
						if (promoHolder != null)
							score = promoHolder.score;
					}

					if (score != null && score.roundsOverLimit)
					{
						visible = true;
						if (this.label != null)
						{
							this.label.text = PromotionsWarning.GetRoundLimitMessage(score.roundsLimitType);
							this.promoTitleLabel.text = promo.name;
						}
					}
					else
					{
						var prizePool = this.details[i].prizePoolTotal != null ? this.details[i].prizePoolTotal : this.details[i].prizePool;
						if (prizePool != null)
							if (minBetLimit < 0 || minBetLimit < prizePool.minBetLimit)
							{
								minBetLimit = prizePool.minBetLimit;
								promoTitle = promo.name;
							}

						visible = totalBet < minBetLimit;
						if (visible)
						{
							this.label.text = PromotionsWarning.GetMessage(minBetLimit);
							this.promoTitleLabel.text = promoTitle;
						}
					}
				}
			}

			this.SetVisible(visible);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchMaxBetAndTopGamesOverflow",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{

				var maxBetPath = "GUI_mobile/Interface_Portrait/ContentInterface/Windows/BetsWindow/Content/BetInCoins/MaxBet/MaxBetLabel";
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				var maxBetTransform = localizationRoot.transform.Find(maxBetPath);
				if (maxBetTransform != null)
				{
					var maxBetLabel = maxBetTransform.GetComponent(UILabel);
					if (maxBetLabel != null)
					{
						maxBetLabel.width = 320;
						maxBetLabel.init(true);
					}
				}

				var paths = [
					"GUI/Menu/Content/Single/Button/Label",
					"GUI/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_0/Label",
					"GUI/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_1/Label",
					"GUI/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_2/Label",
					"GUI/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_3/Label",
					"GUI_mobile/Menu/Content/Single/Button/Label",
					"GUI_mobile/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_0/Label",
					"GUI_mobile/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_1/Label",
					"GUI_mobile/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_2/Label",
					"GUI_mobile/Menu/Content/Multiple/Expanded/Content/Arrangeable/Buttons/Button_3/Label",
				];

				for (var i = 0; i < paths.length; i++)
				{
					var t = localizationRoot.transform.Find(paths[i]);
					if (t != null)
					{
						var label = t.GetComponent(UILabel);
						if (label != null)
						{
							label.overflow = UILabel.Overflow.ShrinkContent;
							label.width = 174;
							label.init(true);
						}
					}
				}

		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "MultiLobbyGameButtonHidePHP",
	ready:function()
	{
		return (window["MultiLobbyGameButton"] != undefined);
	},
	apply:function()
	{
		var oMLGB_FVTZD = MultiLobbyGameButton.FormatValueTrimZeroDecimals;
		MultiLobbyGameButton.FormatValueTrimZeroDecimals = function(/**number*/ value, /**string*/ currency)
		{
			if (currency == "PHP")
				currency = "GNR";
			return oMLGB_FVTZD.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "BuyFeature_InterfaceLink",
	ready:function()
	{
		return (window["BuyFeature_InterfaceLink"] != undefined);
	},
	apply:function()
	{
		BuyFeature_InterfaceLink.prototype.RevertToInitialBet = function()
		{
			XT.TriggerEvent(Vars.Evt_Internal_BetChanged); // !!! not in trunk

			var nextBet = CoinManager.GetNextBet()
		
			if (Vars.EnableSmallBets != undefined)
				XT.SetBool(Vars.EnableSmallBets, false);

			if (this.initialBet == nextBet)
				return;
	
			if (XT.GetBool(Vars.FromServer_AllowCoins))
			{
				XT.SetInt(Vars.NextBetIndex, this.initialBetIndex);
				CoinManager.instance.SetCoinValueIndex(this.initialCoinIndex);
				XT.TriggerEvent("Evt_SetSmartBetFinished");
			}
			else
			{
				CoinManager.SetBetIndex(this.initialBetIndex);
			}
		};

		BuyFeature_InterfaceLink.prototype.Start = function()
		{
			var fpDisplayer = null;
			var fpV2 = null;
			var fspDisplayer = null;

			if ((fpDisplayer = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseDisplayer, true)[0]) != null)
			{
				this.purchaseType = "fp_V1";

				for (var i = 0; i < fpDisplayer.ftPurchaseItems.length; i++)
				{
					var costsAtI = [];
					var lblOnScreen = 0;
					this.allFPLabels.push(costsAtI);
					var costLbl = null;

					if (fpDisplayer.purchaseCosts.length > i && fpDisplayer.purchaseCosts[i] != null)
					{
						costLbl = fpDisplayer.purchaseCosts[i];

						if (costsAtI.indexOf(costLbl) < 0)
						{
							costsAtI.push(costLbl);

							if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
							{
								lblOnScreen++;
								this.initiallyActiveFPLabels.push(costLbl);
							}
						}
					}

					costLbl = fpDisplayer.ftPurchaseItems[i].costLabel;

					if (costLbl != null && costsAtI.indexOf(costLbl) < 0)
					{
						costsAtI.push(costLbl);

						if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
						{
							lblOnScreen++;
							this.initiallyActiveFPLabels.push(costLbl);
						}
					}

					if (fpDisplayer.ftPurchaseItems[i].costLabels != null)
					{
						for (var j = 0; j < fpDisplayer.ftPurchaseItems[i].costLabels.length; j++)
						{
							costLbl = fpDisplayer.ftPurchaseItems[i].costLabels[j];

							if (costLbl != null && costsAtI.indexOf(costLbl) < 0)
							{
								costsAtI.push(costLbl);

								if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
								{
									lblOnScreen++;
									this.initiallyActiveFPLabels.push(costLbl);
								}
							}
						}
					}

					this.currentFPLabelsCount.push(lblOnScreen);
					this.defaultFPLabelsCount.push(lblOnScreen);
				}

				var fpOptions = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseOption, true);

				for (var i = 0; i < fpOptions.length; i++)
				{
					if (fpOptions[i].type == 1)
					{
						this.windowOption = fpOptions[i];
						XT.RegisterCallbackObject(FeaturePurchaseVars.FeaturePurchase_SelectedOption, this.OnSelectedOption, this);
						if (fpOptions.length > 1)
							continue;
					}

					var optIndex = fpOptions[i].purchaseIndex;

					while (this.allFPLabels.length <= optIndex)
					{
						this.allFPLabels.push([]);
						this.defaultFPLabelsCount.push(0);
						this.currentFPLabelsCount.push(0);
					}

					var costsAtI = this.allFPLabels[optIndex];
					var lblOnScreen = 0;
					var costLbl = null;

					for (var j = 0; j < fpOptions[i].costLabels.length; j++)
					{
						costLbl = fpOptions[i].costLabels[j];

						if (costLbl != null && costsAtI.indexOf(costLbl) < 0)
						{
							costsAtI.push(costLbl);

							if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
							{
								lblOnScreen++;
								this.initiallyActiveFPLabels.push(costLbl);
							}
						}
					}

					this.currentFPLabelsCount[optIndex] += lblOnScreen;
					this.defaultFPLabelsCount[optIndex] += lblOnScreen;
				}
			}
			else if ((fpV2 = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseV2, true)[0]) != null)
			{
				this.purchaseType = "fp_V2";

				for (var i = 0; i < fpV2.purchaseOptions.length; i++)
				{
					var costsAtI = [];
					var lblOnScreen = 0;
					this.allFPLabels.push(costsAtI);
					var costLbl = null;

					for (var j = 0; j < fpV2.purchaseOptions[i].cost.length; j++)
					{
						var costVD = fpV2.purchaseOptions[i].cost[j];

						if (costVD != null)
							costLbl = costVD.label;

						if (costLbl != null && costsAtI.indexOf(costLbl) < 0)
						{
							costsAtI.push(costLbl);

							if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
							{
								lblOnScreen++;
								this.initiallyActiveFPLabels.push(costLbl);
							}
						}
					}

					this.currentFPLabelsCount.push(lblOnScreen);
					this.defaultFPLabelsCount.push(lblOnScreen);
				}
			}
			else if ((fspDisplayer = globalRuntime.sceneRoots[1].GetComponentsInChildren(FreeSpinsPurchaseDisplayer, true)[0]) != null)
			{
				this.purchaseType = "fsp";

				for (var i = 0; i < fspDisplayer.fsPurchaseCosts.length; i++)
				{
					var costsAtI = [];
					var lblOnScreen = 0;
					this.allFPLabels.push(costsAtI);
					var costLbl = fspDisplayer.fsPurchaseCosts[i];

					if (costLbl != null && costsAtI.indexOf(costLbl) < 0)
					{
						costsAtI.push(costLbl);

						if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
						{
							lblOnScreen++;
							this.initiallyActiveFPLabels.push(costLbl);
						}
					}

					costLbl = fspDisplayer.fsPurchaseItems[i].costLabel;

					if (costLbl != null && costsAtI.indexOf(costLbl) < 0)
					{
						costsAtI.push(costLbl);

						if (costLbl.gameObject.activeInHierarchy || this.WouldBeActiveInOtherLayout(costLbl.gameObject.transform))
						{
							lblOnScreen++;
							this.initiallyActiveFPLabels.push(costLbl);
						}
					}

					this.currentFPLabelsCount.push(lblOnScreen);
					this.defaultFPLabelsCount.push(lblOnScreen);
				}
				if (this.allFPLabels.length > 0 && fspDisplayer.fsPurchaseItems.length > 0 && fspDisplayer.fsPurchaseItems[0].localizedLabel != null)
					this.allFPLabels[0].push(fspDisplayer.fsPurchaseItems[0].localizedLabel);
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "BuyFeature_BetButtons",
	ready:function()
	{
		return (window["BuyFeature_BetButtons"] != undefined);
	},
	apply:function()
	{
		BuyFeature_BetButtons.prototype.OnIntroClosedOrSkipped = function()
		{
			this.gameObject.GetComponent("UIPanel").alpha = 1;
		};

		var oBFBB_XTRC = BuyFeature_BetButtons.prototype.XTRegisterCallbacks;
		BuyFeature_BetButtons.prototype.XTRegisterCallbacks = function()
		{
			oBFBB_XTRC.apply(this, arguments);
			XT.RegisterCallbackEvent(Vars.Evt_CodeToData_IntroClosedOrSkipped, this.OnIntroClosedOrSkipped, this);
			this.gameObject.AddComponent("UIPanel");
			var pos = this.transform.localPosition();
			this.transform.localPosition(pos.x, pos.y, -6969);
			Globals.SetLayerRecursively(this.gameObject, 2);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchGUIRKAndNormalGUIStopButtonbkg",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (window["BuyFeature_InterfaceLink"] == undefined)
			return;
		this.OnXTGameInit = function()
		{
			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
			if (localizationRoot == null)
				return;
			if (!Globals.isMobile && !Globals.isMini)
			{
				var totalBetTitle = localizationRoot.transform.Find("GUI/Interface/Windows/MenuWindow/Content/MenuBets/BetInCoins/SmartBet/BetTitleText/TotalBetLabel");
				var newTotalBetTitle = localizationRoot.transform.Find("GUI/Interface/TopBar/Buy_BetButtons/Content/Buy_TotalBetTitle/Buy_TotalBetLabel");
				if (totalBetTitle != null && newTotalBetTitle != null)
				{
					var oldLabel = totalBetTitle.GetComponent(UILabel);
					var newLabel = newTotalBetTitle.GetComponent(UILabel);
					if (oldLabel != null && newLabel != null)
					{
						newLabel.text = oldLabel.text;
						newLabel.fontName = oldLabel.fontName
						newLabel.wasInitCalled = false;
						newLabel.Prepare();
					}
				}

				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") == -1)
						{
							var t = localizationRoot.transform.Find("GUI/Interface/TopBar/RightGroup/SpinButtons/StopSpin_Button/Background/Icon/Background");
							if (t != null)
							{
								var sprite = t.GetComponent(UISprite);
								if (sprite != null)
								{
									sprite.color.a = 1;
								}
							}
							return;
						}
					}
				}

				//rk part
				var goodLabelTransform = localizationRoot.transform.Find("GUI/Interface/BottomBar/Elements/AutoplayButtonsHolder/AutoplayButtons/AutoplayClose/Text/AutoplayCloseLabel");
				var brokenLabelTransform = localizationRoot.transform.Find("GUI/Interface/BottomBar/Elements/AutoplayButtonsHolder/AutoplayButtons/AutoplayOpenContainer/AutoplayOpen/Text/AutoplayOpenLabel");
				if (goodLabelTransform != null && brokenLabelTransform != null)
				{
					var goodLabel = goodLabelTransform.GetComponent(UILabel);
					var brokenLabel = brokenLabelTransform.GetComponent(UILabel);
					if (goodLabel != null && brokenLabel != null)
					{
						brokenLabel.transform.localPosition(0, 0, 0);
						brokenLabel.fontName = goodLabel.fontName;
						brokenLabel.fontSize = goodLabel.fontSize;
						brokenLabel.init(true);
					}
				}
			}

			if (Globals.isMobile && !Globals.isMini)
			{
				//landscape
				var totalBetTitle = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/MenuWindow/Content/MenuBets/BetInCoins/SmartBet/BetTitleText/TotalBetLabel");
				var newTotalBetTitle = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/BottomBar/Buy_BetButtons/Content/Buy_TotalBetTitle/Buy_TotalBetLabel");
				if (totalBetTitle != null && newTotalBetTitle != null)
				{
					var oldLabel = totalBetTitle.GetComponent(UILabel);
					var newLabel = newTotalBetTitle.GetComponent(UILabel);
					if (oldLabel != null && newLabel != null)
					{
						newLabel.text = oldLabel.text;
						newLabel.fontName = oldLabel.fontName
						newLabel.wasInitCalled = false;
						newLabel.Prepare();
					}
				}
				//portrait
				totalBetTitle = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/BetSettings/BetInCoins/Title/TotalBetLabel");
				newTotalBetTitle = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/TopBar/Buy_BetButtons/Content/Buy_TotalBetTitle/Buy_TotalBetLabel");
				if (totalBetTitle != null && newTotalBetTitle != null)
				{
					var oldLabel = totalBetTitle.GetComponent(UILabel);
					var newLabel = newTotalBetTitle.GetComponent(UILabel);
					if (oldLabel != null && newLabel != null)
					{
						newLabel.text = oldLabel.text;
						newLabel.fontName = oldLabel.fontName
						newLabel.wasInitCalled = false;
						newLabel.Prepare();
					}
				}

				var mobilePaths = [
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredLeft/Buttons/AutoplayButton/Buttons/ButtonOpen/Background",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredLeft/Buttons/AutoplayButton/Buttons/ButtonClose/Background",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredLeft/Buttons/BetButton/ButtonBetsOpen/Background",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredLeft/Buttons/BetButton/ButtonBetsClose/Background",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Normal/SpinButtons/StartSpin_Button/Background/bkg/Sprite",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Normal/SpinButtons/StartSpin_Button/ButtonHeldAnim/bkg",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Normal/SpinButtons/StartSpin_Fake/bkg",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Autoplay/AutoplayStop_Button/Background/bkg",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Position/Controller/Buttons/StartSpin/bkg",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Position/Controller/Buttons/StartSpin_Fake/bkg",
					"GUI_mobile/Interface_Landscape/ContentInterface/DynamicContent/AnchoredRight/Position/Controller/Buttons/AutoplayStop/Background/bkg",
					"GUI_mobile/Interface_Portrait/ContentInterface/BetsButton/Buttons/Open/Background",
					"GUI_mobile/Interface_Portrait/ContentInterface/BetsButton/Buttons/Close/Background",
					"GUI_mobile/Interface_Portrait/ContentInterface/AutoplayButton/Buttons/Open/Background",
					"GUI_mobile/Interface_Portrait/ContentInterface/AutoplayButton/Buttons/Close/Background",
					"GUI_mobile/Interface_Portrait/ContentInterface/DynamicContent/ContentScale/Normal/SpinButtons/StartSpin_Button/ButtonHeldAnim/AnimatedBkg",
					"GUI_mobile/Interface_Portrait/ContentInterface/DynamicContent/ContentScale/Position/Controller/Buttons/AutoplayStop/Background/bkg"
				];

				var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI_mobile/PragmaticPlay/PPAnchorLand/PPArrangeableLand/PragmaticPlayLabel");
				if (pragmaticPlayLabelTransform != null)
				{
					var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
					if (pragmaticPlayLabel != null)
					{
						if (pragmaticPlayLabel.text.indexOf("REEL") == -1)
						{window.cancerSprite = [];
							for (var i = 0; i < mobilePaths.length; i++)
							{
								var t = localizationRoot.transform.Find(mobilePaths[i]);
								if (t != null)
								{
									var sprite = t.GetComponent(UISprite);
									window.cancerSprite.push(sprite);
									if (sprite != null)
									{
										if (i == 2 || i == 11)
										{
											var oOWRO = sprite.OnWillRenderObject;
											sprite.OnWillRenderObject = function()
											{
												if (this.color.a != 1)
													this.color.a = 1;
												oOWRO.apply(this, arguments);
											}
										}

										if (i == 1 || i == 3 || i == 12 || i == 14)
										{
											var oSSN = sprite.SetSpriteName;
											t.localScale(0.9, 0.9, 0.9);
											sprite.SetSpriteName = function(newName)
											{
												newName = "circle";
												oSSN.apply(this, arguments);
											}
										}
										else
										{
											sprite.color.a = 1;
										}
									}
								}
							}
							return;
						}
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchMiniPLN",
	ready:function()
	{
		return (window["GUIArranger"] != undefined);
	},
	apply:function()
	{
		var oGARC = GUIArranger.prototype.XTRegisterCallbacks;
		GUIArranger.prototype.XTRegisterCallbacks = function()
		{
			oGARC.apply(this, arguments);
			if (Globals.isMini == true)
			{
				this.bPortraitPLNActiveOnUIRoot = false;
				this.bLandscapeLLNActiveOnUIRoot = false;
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFTFixAfterNP",
	ready:function()
	{
		return ((window["ResponseHandler_FT"] != undefined) && (window["TumblingManager_RG"] != undefined));
	},
	apply:function()
	{
		TumblingManager_RG.prototype.XTRegisterCallbacks = function()
		{
			FOXLink.prototype.XTRegisterCallbacks.call(this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnGameInit, this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_InjectRQIWhileShowingAllLines, this.HighlightCoinsWon, this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_InjectRQIAfterLinesShow, this.HideCoinsWon, this);
			XT.RegisterCallbackEvent(Vars.Evt_FromServer_SpinResultReceived, this.OnResponseReceived, this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_SpinEnded, this.OnSpinEnded, this);
			XT.RegisterCallbackEvent(Vars.StartDifferentSpin, this.OnStartDifferentSpin, this);
		};

		TumblingManager_RG.prototype.HandleInitResponse = function(/**Object*/ param)
		{
			this.ParseResponse(param);

			this.isTumbleSpin = this.tumblingData != null;
			XT.SetBool(Vars.IsDifferentSpinType, this.isTumbleSpin);
			XT.SetBool(ResultDisplayerVars.ResultDisplayer_SkipDelayBeforeEndOfDisplayLoop, this.isTumbleSpin);
		};

		TumblingManager_RG.prototype.HandleSpinResponse = function(/**Object*/ param)
		{
			this.ParseResponse(param);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPromotionsInOtherGamesNotification",
	ready:function()
	{
		return (window["PromotionsInOtherGamesNotification"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOPOG"))
		{
			PromotionsInOtherGamesNotification.prototype.XTRegisterCallbacks = function(){};
			return;
		}
		var oPIOGN_XTRC = PromotionsInOtherGamesNotification.prototype.XTRegisterCallbacks;
		PromotionsInOtherGamesNotification.prototype.XTRegisterCallbacks = function()
		{
			oPIOGN_XTRC.apply(this, arguments);
			if (this.landscapeMessage != null)
				this.landscapeMessage.effectStyle = 0;
			if (this.portraitMessage != null)
				this.portraitMessage.effectStyle = 0;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchServerLagIndicator",
	ready:function()
	{
		return (window["ServerLagIndicator"] != undefined);
	},
	apply:function()
	{
		var oSLIOSS = ServerLagIndicator.prototype.OnSpinStarted;
		ServerLagIndicator.prototype.OnSpinStarted = function()
		{
			if (XT.GetBool(Vars.Jurisdiction_SpinLimit))
			{
                this.spinLag = Math.max(this.spinLag, XT.GetFloat(Vars.Jurisdiction_SpinLimit_Value) + 1);
				this.differentSpinLag = Math.max(this.differentSpinLag, XT.GetFloat(Vars.Jurisdiction_SpinLimit_Value) + 1);
			}
			oSLIOSS.apply(this, arguments);
		};

	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRankIDNIcon",
	ready:function()
	{
		return (window["TournamentsRank"] != undefined);
	},
	apply:function()
	{
		TournamentsRank.prototype.OnXTGameInit = function()
		{
			var IDNSM = [];
			var IDNEX = [];
			if (!Globals.isMobile)
			{
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI/Tournament/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNSM"));
				IDNEX.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI/Tournament/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNEX"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI/Tournament/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNSSM"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI/Tournament/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNSME"));
			}
			else
			{
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Land/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNSM"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Land/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNSSM"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Land/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNSME"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/T/IDNSM"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/T/IDNSSM"));
				IDNSM.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/T/IDNSME"));
				IDNEX.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Land/ScreenAnchor/Holder_Rank/Rank/Content/T/IDNEX"));
				IDNEX.push(globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/T/IDNEX"));

				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot != null)
				{
					var displayStyleCATTransform = localizationRoot.transform.Find("GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/DisplayStyleCAT");
					if (displayStyleCATTransform != null)
					{
						var displayStyleCAT = displayStyleCATTransform.GetComponentsInChildren(CAT_Container, true)[0];
						if (displayStyleCAT != undefined)
						{
							for (var i = 0; i < 5; i++)
							{
								var targetTransform = localizationRoot.transform.Find("GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/T/IDNSSM");
								if (targetTransform != null)
									displayStyleCAT.events[i].actions[0].ToDisableList.push(targetTransform.gameObject);
								targetTransform = localizationRoot.transform.Find("GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/T/IDNSME");
								if (targetTransform != null)
									displayStyleCAT.events[i].actions[0].ToDisableList.push(targetTransform.gameObject);
								targetTransform = localizationRoot.transform.Find("GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/PD/Icon/IDNSSM")
								if (targetTransform != null)
									displayStyleCAT.events[i].actions[0].ToDisableList.push(targetTransform.gameObject);
								targetTransform = localizationRoot.transform.Find("GUI_mobile/Tournament/Ear/Port/ScreenAnchor/Holder_Rank/RankArranged/Rank/Content/PD/Icon/IDNSME")
								if (targetTransform != null)
									displayStyleCAT.events[i].actions[0].ToDisableList.push(targetTransform.gameObject);
							}
						}
					}
				}
			}

			for (var i = 0; i < IDNSM.length; i++)
			{
				if (IDNSM[i] != null)
				{
					IDNSM[i].localPosition(0, 35, 0);
				}
			}

			for (var i = 0; i < IDNEX.length; i++)
			{
				if (IDNEX[i] != null)
				{
					IDNEX[i].localPosition(0, 35, 0);
					IDNEX[i].localScale(0.225, 0.225, 1);
				}
			}
		}

		var oTR_XTRC = TournamentsRank.prototype.XTRegisterCallbacks;
		TournamentsRank.prototype.XTRegisterCallbacks = function()
		{
			if (this.prizeWon != null && this.prizeWon.cat == null)
				this.prizeWon = null;
			oTR_XTRC.apply(this, arguments);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchVerifyGameKOImage",
	ready:function()
	{
		return (window["VerifyGameAuthenticityManager"] != undefined);
	},
	apply:function()
	{
		VerifyGameAuthenticityManager.styleDesktop.push(
			'#appImgKO',
			'{',
			'    margin-bottom: -10px;',
			'    content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAAoCAYAAABXadAKAAABamlDQ1BJQ0MgcHJvZmlsZQAAKJF1kL1Lw1AUxU+rUtA6iA4dHDKJQ9TSCnZxaCsURTBUBatTmn4JbXwkKVJxE1cp+B9YwVlwsIhUcHFwEEQHEd2cOim4aHjel1TaIt7H5f04nHO5XMAbUBkr9gIo6ZaRTMSktdS65HuDh55TqmayqKIsCv79u+vz0fXeT4hZTbt2ENlPXJfOLpd2ngJTf/1d1Z/Jmhr939RBjRkW4JGJlW2LCd4lHjFoKeKq4LzLx4LTLp87npVknPiWWNIKaoa4SSynO/R8B5eKZa21g9jen9VXl8Uc6lHMYRMmGIpQUYEEBeF//NOOP44tcldgUC6PAizKREkRE7LE89ChYRIycQhB6pC4c+t+D637yW1t7xWYbXDOL9raQgM4naGT1dvaeAQYGgBu6kw1VEfqofbmcsD7CTCYAobvKLNh5sIhd3t/DOh74fxjDPAdAnaV868jzu0ahZ+BK/0HFylqvA0bSh4AAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnCwcJOTgExYaZAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAG79JREFUeNrtnXm8XVWV579r73Pu8F6Sl3kgIxASpoRBgsQIFBgGKQRLKeUTrLZK6iONRdGitGnho00JBVbh1FhUg9gWxBmkURBsxYagTFoyJJKBEBJeBpKYOXl5wz1nr9V/7HPvey/vvQBqmopk53Pu5+Xee/bZZ5+11/6t3xqunPOR+YgkSKmKNA2haeRoKJUxX+Lez3+hMn7a5CnHTp/2OSklF4XRkyRpaqZcLiGmSMhItEbbjq1k2zaSakaoZQP2F8Sj4gFDsOJVEDHEBBBAMQAEq7/GNyje7tWU/psAYiAChsPq59leXUh3L9ZvTw7p5wMrXm2As/ofUc//SZ976dn5a/UrA453X1fdn83+oLMFwfW8b1NClrFndxu6py2rta54cX3rqvvW/PtL//aeW76wesB+nnv2Odra2tj4u82sWr2al1e/zJJVa1n5qrvkmFPP+GoyfsqwdMhQQvH4HBmd2zewo/Ulkldf5rBhKZPGj2P2KaeQJgkTJkzot78w4jCaJx1JZeyh5D4BEQKGSQKS4bSMUw9SwyRgpKjEiRLjYHsLtPoilf4+cVDu7GDXkkVsXrn048sWPnjn3Ft/sLPPN1U1ai0njXU25z9//hPDJh32xdLgUbQ7o7OsNHV20LXlVZ554gk+cuw4LjjvbKYfO40Ro0ZTTsrd69SsT38bNm/h1Vdf5aknn+Sunz2BTJnJiMnH4NJmTAIhrk8UT+7AUSPVAJai4t6AFjzY/lQFPVFwZqhXKh1trHzs0W//9oGv/P3cWxdu7yvQxWnOydgLr73jYx1jxn0mTwaTqsN8Du0bWf3kw/zlEWO55EPzmHbkUSTegSpYAKcoHsH3GkZjtQlAQPBs27qVBx98kJu/+SPGzT6b0tgj2CMVvHXhUIKUUTEcNRIVME+Qgw/1rS7QDiPHgziwnErXLna/8OyKX3zjupPn3rpwZ7dAm9YRHWf+/S3/POjw6f+1o5RgllJ2Odn6F9nw8I+45R+v4dRT30FS9gQMZ4aYAxFyM8QJYoZIAyFiFl9ECmxsDlDEGcuWLOO2O7/N45tyxs06i640wSu44Ml8Qs1DqjneDOWgRL+VmwnkTkk1QYKAE4J00Zx1sPHpp1f8+3dvmDX31oW7CoGO2/msC6+8ffxpcz/a0TQSCYEyHbStep5Du17hc9dew/hRE8hS8ETVj0Sjrqcm7mmoyF62gtVtIItK3RLY1d7Bv976VX7wzFomzTmH3ckQUgMjkLkUTPAW/mCD42A78Js6I9Fo6NfESJ0nzQyr5Sx96Ac/nvr+i98D4AQYdcJ7p48/7qSP1ipNYDkpgc2/fYpZ1e185eabGHnIIYQkIOQIUaNjDjFBUBw5QuglyNaftV1/0yuYMqha4aqPX8VnLp7Ly48+QLN2kLscUEohx1tkKA62gy3RqDqDU5xzqELNe7JKmeNP+7PzX7j1C5dHTgo46pRZ1+i4Q6i5Zpzk1DYu5vjSdq6/9joGVYaQmOCApBBiJGpckzoB52NXNhBvZGCKCQQBFUMsJ0GpJAl/8d4L+ejc41j1+P1U8i4CFZx5HF0g2cGnebABRi4OJUXUIwiBDFyNfNRIJhxzzL/+/O/mVf2TckTSPGrMHVlpSDVgpFtbWffoj7jzX77E4KGDQaTgdA3ERwmVKLumiojDjIiTpQf9Yr2luye2drgCV8f3FeXE405gz7oVLF6xiubRkzCE3IFJgdXfJGMkNSN3DpEAIpg4HAISMBHiv7gXmgsIiorHJMWZ4VFwkDuhZKAG6uu8+0BXjQpE+jkifIvGUdwZHZEATTDxOBSHFgx/76NvTweSOEf5iqggamsn8a6Cc7QMGcnmV1rXu9WP/eSqZNCw4YKjmu/kt0/8lO/+zy8zetRwEC3kNwLxnnPhGsrX+hfgHjReFF6311S6YoFEzZ6mKZdfdhmVjStg21oUjcKi7k2cRAh4vDq0mDxn0nD8OANnDqyEWSUelPAmeDNwDhOPWiQl1dzrgFBR8BRfHK7H31GhpFrDW17seB4TwZNT0i5MlNy5fg+VgQDhAcJ2GAXk1ejSMsAcpkI6dBijxh86ITn6lD+bnAk4zdjduoQr3z2bo486DCQgJI17D7huId5LgNva2li2bFlD6wKoKiNGjGDq1Kk9hLr/5swRCAxpHsTNn72Gc//bF5n1nr8iUwFJGr7DN0NH5y4hsRoUu4QzQwUUhycUO4jHRTcR8ZMQz6WME0diGUEznJQRU3J7DQ0pAQqbpN9FJhbHYwmJubgjoBFfmsMNoARM7E+S01cxauY4fNrhpyXb99Q+1mRQ6mqnc8WzXHTFjTgBRXBWYIt+5qcuoO3t7Vx33XXcd999fYR20KBB3HXXXRx//PGv8QAL+KEw4+gjmHfMCJZsWY8fNREzbXz+ZmkFpEaqKblzBGd4FVSEXDyGkGCUNEcFulwJExfZGcsZmkLFBX5Xcxw2vEzLkEH8ZtW66CHts3wKaFBo/YEoLC3gm0ncQ1QEsQTwCIqIDqw80AYI+ZPhqZ2QqeEqpTmJlaqSmLFr3UrmnXUaEydOJseBuEYsBIAnoCosf/FFli5d2tDQv/71r7n33nv55Cc/yezZsxERzIy2tjY+9alPccUVV/Cxj32MUqmEmTFs2DDmzJlDpVLp8ZAERwICScnzoQ/N44LP3M6Ms98PaQnszZp8o+xzjh5WYdm2AAEybziJ0EPFEFGqiWfy0GacOLokJSWgtQ5W7KxxwXETmTB2ODf8eDEzJwxi8sRD+M2K1UiaRDtEXLFwohA6gYq3uCv0BxDEMDHyXOjUhMSEXIyy5DSXPU7j2PYiT6NR5Rw7apCrNewB0GLRamMXOgABNiZCLU0kcV4QrbGtdSnnXXY1zidkYnjr9vJZEU+xZs0ajj766D793XTTTVx22WUNoa1r8Ntvv51zzjmHSy65pPHdMWPGcM0113DllVc2vqtAYvVreaYeMZVZlR2EbA9dafrmrXyM0U3C1X85h4/c8Qg+d+QWmRqvhlgJL8KUYSUuPu0oqtTIJWGQU5qbyvzNXY9TtkCTRQhS0holzRGs36AqJ0ZzUxN/c/YxDLFswM2suVrhJ48v5tE1bdRcGciYPrzER957Gu272wbUvW2+xJfvfYr2WsDEFQvFMXCI14HRnIGZECpVEkcXIWQc1ZQx4ZBxiBVObIuirxJRl8ezprWViRMnsmDBAqZOndrocOTIkaSF4NVhh5lx/PHHs3jxYvI8x8zw3vPhD3+YhQsXcuWVVzbO9ygUEXFijpZBLbzz1Lfzo1Uv0XTk7DcN9wnGpMElygaTmyu8UstRKaLCxEi0k1wSntsSeO57v4zGSoA/nzqcC049ho48LyhN8KYE8QSR/g3DGBZIR/sevvbjZ5Fe99z9d8VyrrloFoNSweEIqjgRyqL40MlNd/+C3ZQHvKMkxjeipkWko3QzUweqQGsASchxJE5gz+ZXedcJM2kaPAjqj8B6xllGJsIMQgiMGTOGCRMm9DIM169fzwMPPMBLL71ES0sLZ5xxBnPmzGHMmDG9cHe5XKY7fqQ+zY7uOKtovZ511rl8//N3MkjzIuR0/9FBhkMkL67uEYPUckKe864Tp7KxrY3zTjiUWx5ejvNlvGXkAs4lCIHzpg1nwuDhWCmlqdzEoWNaWNa6iZJLUYwEmFI2KqkjiBTqIUTIYRaNOov2O3mGmSPgqAclCDkqDiVETYQjMyGYYt6TiZA5KT4rEfrB51GTBdTAXMHYNLB0pF4PYB2NmSICSabgdm3g0Le9rSFeQrch6Pbi6XoKsZnhnOORRx5h/vz5rF+/nl27dlGtVlmwYAHz5s1j/vz5NDc39zqnJyyhsOd9wwALmDmaK820b2qlbDVyqe5nTRwwy0F8wVBE1ucvTj6c6qAKX7j3MT75gTO5cMZo7l+2JY6RlIwET8akURXGNJV5ZUsbumUVk6bP4ZafvIpPSnhTDhk9nHnnzWJ0k6d1Z1bQnQmIRjqwmNcUZXi1zPCKp6kKqS9T9SlDywlNzWWGNkPFPKOaypDneAQLhnOKFhhcVBBnfejTON/x7oIZzgmo4S1icjuAVbQWsUJOISk5x6ZtW5k5c8ZAwaj9a7ZCmFtbW7niiis44ogj+NrXvsaRRx7Jzp07WbBgAbfffjtTpkzh0ksv7cNT9+GspYfGNMeoESMYXVJEc/an99tJjlmGc02oObBORpUzLj79OCaMGsot9zzBq7Uq/+v+X/G3F85mzOgW7nt8CVvUUXMJDs+dT68E9ZRT4zPveTsLl2xgza4a5hxOhNaN2/inh57h4hmHcMjkKaiE6Bxp4FfFi+JCYOa0SZw4fSJ51kmeKS7PIWSEkEOokXflILBLBZMKXkHzjG7iMEfM9+MRqO+6hncO1YDHxdAFMxRr8NwHcksIgdruXSReCrX9xqTnnnvuIc9zrr/+embOnImZUalU+MQnPsHSpUv5xje+wQUXXMDIkSP3IdBaGIcFvhRoaRnMiKYU0/3r+hYTRMrk6hheMi6ZcxTTJozgld/t5J/vfpydmUOsxPNblZvueZwPn3EMn/3gqSxq3cyCX71CLRhowhHDPZeefRIbdnVx22MrsDK4YAQzai6hwzcTJEXEIaKYZNGTqIaz6CDJXYWHF6/lkd+2IqoEcYwtO9qDsc0El8BElKOmT2FdWw11OeoK36vBkLLnfW+bQGZpt1j2kM9OX2HhC63s7OhEfIqaIETqUSVGUB7ozYkqVc1JS+k++cuBeOjnn3+ewYMHM3369F5a2HvP+eefz8qVK9m5c2cPV7f0i2L7idNj0ODB7Glr28+MjwdLcCi1PGNru/Cdh57ltgefYUvu6HRg1BAnbGwL/NOPF3H3L5awjZTOYKBl5p00jcsumMPzKzZz20MvQJJS0i68UYS+GknI4sI1w4JB4aoOImQ+evKCOBKXouLJ04RcM/76z2dx+jGTqGpOUlOGVpuplD3b9+Q4c3gzvAkbdiX8n2fWkvkSlghaP3z34SRH1cAlBHWYRS+kFZ7cP4WWYKCSxC3tdWw3daGte/9aWlrI85z29nbSNO0luJs2bWLIkCENBmRgwBEjnUT2tumNtJQO4DP7Y+EvUAmkoUYI8L2nl6A+gbQKkpAGa9gVwTtcSHmitYZftwJxOVma8ssXW3lsxUqytMSEcU2s3LQbFyqo86g4gihealF4cOASMG0s5xi+7oqMSkWIcb+iOYMt0GRKMFBXoj2psnzjVtpqDg/kFiHExg7je79ZB/uIHhcKw9Glhbvc8JbjNAcxQsGBHNAa2jtPV67kQXv4+l+fhjYzzjnnHHbv3s0Pf/jDXsK8cuVKvv71r3PyySf3Yjr615KuIdquxwNpa2unVG7a/6w8oK5MTRKcBFK6cARKoYYnxkdAwIci57HciVmORynlgVfalTXtxlnTR3DRSYehIaGegfnkKzv4+aI1qHi25GU2dUSPokiGIyO1QBqM1ASxAGQgXYjk5D4aeEEETR1IxurtW7npoecRSXCWI0mpYDu6cNKBl4AT6/fw5JQkI7WMBC0WlRXW+J+GUzwBx9Bhw9ixY+cbij2usxXnnnsuZ5xxBjfeeCNLlizh9NNPZ+PGjdxxxx20t7czf/78Xl7BfWpqi1SHCGzevIV1W3Yxzvn9u6KDUHKCaCenzJhISzWhpFqYS0UWDlBLlFLuUA+5GKLChp01fr1iG0kwgnMMUSiZoi6Q+Rhqu2RHB6VtNcxKPLZsPSxfQ+LLBIsR5EFiVpHTDmZMGsXEEVWSEBDxdCmMLCccPmY450qM1otRLwZWYUeW8dRLrcw+ajyjmpMiKlH70Ns9Wy7Cxp0Zv3lxHcGVCSTkkmBieD1wHSxS0DSJmceNHMOq1as4/oQTGnxwb0SrfbAzgHOONE350pe+xB133MGCBQu4++67qVarHHvssdx2223MmDGjF03XM1Cp+32LTzUA3gjBaGvbzW5XZbiU9q9+dhBQUgsMLXnGVoWkCMSKkRKusYvsvX91dHoCGTVfpapKJ45cHONsD53SjNBJEEG8kGhA1Ki5El3qUMkbWtyb4kwZXk0ZPyQlJSnKPMCS9ZtR4NAWH7Mx8DElySDtTKjmnbRUU4Y3eVKs4cjpj7bTIkWjvSs6FRRDnSIW6bsDleEwhFQ9gpHgHM0jxvHCC0u46H3v7zUR1oO4rgu1iOCc6wUvWlpauPrqq5k3bx47duygVCoxceJEyuVyn0g751wv41Gke7OLBIvgPWzbsZ3Bk6fBftbQJo4aCXnieeC5tUXwjmKFR8/pvspnCOJTPDmpdZBnXYwf1sRV759D5lMS1QgXBLCIjndkynd/+gQ7OksEUoLEOITceR5fsY6nl+eoOXQA50g9ZDeII7gS+JHc/9wmvGVFupoMGPqSaMATYlBVUmq4VlyRI3rA5m5KN+OcqECpZSw/uu/7fPyKrQwdPqzX2u5et45SqYSIcNdddzVwsYigWk+L0V4CW9fIPYV53bp1nHjiib2NzKLwhkndlRNYuHAhzaMnoPtZcTgLJOTFw3QEfCNgKGrwHjmN1le4nCrqHR2+zPcXb+GexZsxnxah91rEUMdEAW8QzNOpQ1A0hp4WAmouJbOEmq/gpUi8HEigtVAsBKwgOxGJi2DvIiY9/ltLUlQlwjq6nRGujy4/0DS0oc4QMxLTQCgNpmvs4SxbvpzZ73hHD0GTXnMyc+ZMLrroIm666abf++KzZ8/m8ssv7w1BiuvVPYY7d23jp48/Q/W0eWT7eaJVAuYCajH2GrUiniVGoQVxA2quOjCJLmWhXX3MIAkU3HJ3mGZGiG5uR8yAKTJdxGLgl4SAkwQ1wZwN6LazaMqDKU60yJaRYvx+wIVQ31FUBO8cpjmuGF3U0RywrkJDCQglhEQ79+BcwiHTj+Whnz/KrLefghNXpLv0wLtAU1MTN998M9dff/0AnHJfem/v5r2nWq32csfSIMYMFF5evZ711UOYnDTtd83hzEOIqNkKDNRtQWgRiDSwgCAx6F+KXEmjvhgMJYlwrYAIsX5JoR0tYnJnWpifFvlucZHC3IdQmhhSBOvXsbaIFIh8Hz5sU0SsuGY0pGLUndRDlg5IoXYITgTt6CSpJrI+0zC+PGYSN/zgUf7TJa0cfthhmGn092M9xY0kSRg0aNBrCnQfTbgXHOn9oUPJ8S4hCxl3fusHTJnxtoj1/j94r6LQxodpFhN8gsQNytnAzKxJKJIrfVwOZoUruYhRcTnOfGP2BCOxHFFPr0I8SMGHGybxfKfSf86x2F6BRNIAh3tn3vfrRrJuc99Euqv6SRF9dkBCaMNM8XmO27Jh/bqKNzrTJs6acybf+vZ3yULAu7qd333IH5A5UhdmEenTT0wNi673Rx/9v/zy1T0wZDQ5tt9j+1Vi0H4QRYvUJ1dgTCMpQj5dv4cVOFjFgUUr28TIHWTO461ekCdOexCJEEascFsrwUW3t5Iglsb0KXPF9/o5cA1HjIpHJSlSsIr3Bxhr/Yh9JCgJoWBE4iLMD1zyWWOdji0bNqhbu2L5M75WAypUxx7Od3+zil8ufCzu/hZDFrEYttjt1+t2V79+Ot66jUSLg8A0plhhqAnr1m/gsmtuYPxxJ9FBiQS//7OvrK6gpMjYcN01RyxmkkSc28/Rw3SO6VAezBNToRxmPt5qYajVK6z2zMOuv3RrWek9sH6PIqu7x1jq7zPQWOsLq0cZVtlXWdf/aDLbyLDv5t0cEJyAK+NCF1t/t/Eut2l163c6Nq1FLKczbWLqqWfzgU9cywu/XVQE3CeN+bUe/jwaBo+AvRb0soarVxtVR7sLOyJG3tHOF2/5KtPmvg8ZPLZw6+p+h3RSQI7uzat7qb5mJoe5QkAKqq8+Q6aF148exlZh/Fn3udKzxm+BX+31qYZe4QG9MP0bWcWN0cl/+II+MYMqKlCTCAkNSBXEAtmG9Wx8+aX7nO54/qmuTWsfaLKcgCM0j+Jt7/9bPnr1fNa1ri78/zGrWIst2ookWu2HGhpYbHyxsgIigYA2Qig7Ojr5h3+4gUc3dZFMnkHQJkwVkoN1Rw+2gl+2SFFq4asQqysjo2qd7Fi57OF3fvbGB5yZ6cK7FtzcuW51uw9GsJRk1GEMescHufyqT/PiiqXRm+akKGLSjx6Q16cPsByxgogrDL6ujj38989dzyMba0w56SxqlKg5i9RUnuNEDz7Rt3wrUgElwkJnjlRjyGzule2rlrF26aIr61AEwqpfrf3Vkz8pdbbFbAcTZPQ08hnv5gMf/TuWLlkEodgug0IocJsZwUK09vcheHGDrMW/rAyWYKrs3rObT3/2Wh5e18HYk+dSk8EkONTXYo3oIg3pYHuri3OERIqPJeLMU3NGLjmV9j2sf+7Zfzv68vnLGwJtZrXlj9x//YuP3f9EuXMXwWKZlHT0eMae8WFOvvQz3PKVW9i9pxN8/SclIk70YqhZ9Ojta1CSkBXYO2RdLHrm15x/8V/zQjKFQ95xPl1SxUl0ZDhTnGXR/WzJwSd6EHI06AinAgTU1Shlu3nxwftXvPzogqsa3+0dVyETjrzwii8fPueci6y5TE0Mr1UqYQ8bFz3G1hee4sZPX8XZZ55Jy5DBQGiUY6pX7O9XmAvCdU97Oy+//DLf/Na3uPP59cx657nY8El0OSGxUNiXQqJaAP+kcDIc1NNveS0t4DU6v7wLVPbsYOnDDy5Z8bOvz+lV8LxvUUVJDzvrI9+eOPu0c4eOGTe4nQQlJXU1yttXs3rJIoZse5V5F76b006dw7ChLYweNZok7V+T7ty1i00bN7F86TK+f8/3eWKbctTbz0RGTCH31aKgeU5wDhXFq+IsKWq2aWQM3vBqpg8H8Ebs/9drHrwWq7C/iDDb5zXlDzjX3uDs1vuM9E3/BSj3fgL7KAlH9883Rbxc/E+E4KCcB8qi7Fj3CjtfeOFzix74HzefdetjvVKa5F9uu408z1mzdh3t7Z2sWv87fva/v1NqGn/CB4+b++7TR02ZdqkfPZ7dkoAzkjwj6dpD26a1bF63msr2DRwxvMSEiRMYPXYMTZVKn/7WZCkt4w9l3JQjyJqG0Zk2EUiK9KHi54h63KfYH69YUh0K9f7lK9mLUnyNubbusqoi3aFdttc4GzRknQ7scZ0/psdTB5IzY59Fvl6bjOrnB5oanvQepTat7xyaaCxHYT2vttcvfdnAD7Zel1alzulHO81LjElPNCds3sjO1cvWLn7kkRtmX/v5r/XXn8z94H8B52kaMpS02oyvNhOSlM60xIOf/SsZeeipR444ZuYlw6dMfHs1HfIul6aSlFN8IiSmJLUaJTXat25iT9u2ONsD9KfmQRKCGl4iTncWSwL8vvpMZd/7lOtH79hr6Fnbh8bbuyzXvn5zrjdbbHufvPfO+PqFX/Ylsvo6NO3vs6e8xmcm9fjfASbT+pmvvt+NEYiGBaXW1UHW2Un7ju3sXPvK02sWLb+ja+uT3zzvunuygfr7f9yl3naTjbEmAAAAAElFTkSuQmCC");',
			'}',
			'#close',
			'{',
			'    font-family: Courier;',
			'}',
			'h1',
			'{',
			'    font-size: 32px;',
			'}',
		);
		VerifyGameAuthenticityManager.styleMobile.push(
			'#close',
			'{',
			'    font-family: Courier;',
			'}',
			'#closePort',
			'{',
			'    font-family: Courier;',
			'}',
			'h1',
			'{',
			'    font-size: 32px;',
			'}',
		);
		VerifyGameAuthenticityManager.textPayloadsDesktop.ko.para3 = VerifyGameAuthenticityManager.textPayloadsDesktop.ko.para3.replace("appImg","appImgKO");
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchCoins_V2",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		var ignoreGame = 
			["vs20terrorv","vs5drmystery","vs432congocash","vs20gorilla","vs25champ","vs3train","vs40wanderw","vs10snakeladd","vs20rainbowg","vs20ltng","vs75bronco",
			 "vs20terrorv_cv69","vs5drmystery_cv64","vs432congocash_cv63","vs20gorilla_cv51","vs25champ_cv21","vs3train_cv5","vs40wanderw_cv75","vs10snakeladd_cv77",
			 "vs20rainbowg_cv79","vs20ltng_cv88","vs75bronco_cv47","vs5drmysterygr_cv64","vs20gorillagr_cv58","vs25champgr_cv61","vs75broncogr_cv58"].indexOf(UHT_CONFIG.SYMBOL) > -1;
		if (IsRequired("COINS_V2") && !ignoreGame)
		{
			if (UHT_GAME_CONFIG.amountType != "CURRENCY")
				UHT_GAME_CONFIG.amountType = "COINS_V2";
		}
		if (ignoreGame && UHT_GAME_CONFIG.amountType == "COINS_V2")
			UHT_GAME_CONFIG.amountType = "COINS";
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchReplayIFrameSameHostname",
	ready:function()
	{
		return (window["ReplayWatchWinning"] != undefined);
	},
	apply:function()
	{
		var oSTA = null;
		
		var RWWOR = ReplayWatchWinning.prototype.OpenRound;
		ReplayWatchWinning.prototype.OpenRound = function()
		{
			oSTA = window.sendToAdapter;
			window.sendToAdapter = null;
			RWWOR.apply(this, arguments);
		}

		var RWWCR = ReplayWatchWinning.prototype.CloseRound;
		ReplayWatchWinning.prototype.CloseRound = function()
		{
			if (oSTA != null)
				window.sendToAdapter = oSTA;
			oSTA = null;
			RWWCR.apply(this, arguments);
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchExtraTimeAGCCLikeNYX",
	ready:function()
	{
		return window["ClientLoader"] != undefined;
	},
	apply:function()
	{
		if (IsRequired("AGCCD"))
		{
			UHT_GAME_CONFIG["jurisdictionMsg"] = "imageAGCC";
			
			var oCLU = ClientLoader.prototype.Update;
			ClientLoader.prototype.Update = function()
			{
				oCLU.call(this);
				if ((this.shouldHide==0))
				{
					oCLU.call(this);
					
					this.gameObject.SetActive(true);
					ClientLoader.prototype.Update = function(){};
					
					var I = this;
					setTimeout(function(){I.gameObject.SetActive(false)}, 5000);
				}
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchQueuedMouseEvent",
	ready:function()
	{
		return window["QueuedMouseEvent"] != undefined;
	},
	apply:function()
	{
		window["QueuedMouseEvent"] = function(type, evt)
		{
			this.m_type = type;
			this.m_event =
			{
				type : evt.type,
				data :
				{
					global :
					{
						x : evt.data.global.x,
						y : evt.data.global.y
					}
				}
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFRBReloadBalanceAfter2sec",
	ready:function()
	{
		return (window["BonusRoundsController"] != undefined && window["BalanceManager"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		var forceUpdateBalanceFRBEnd = function()
		{
			if (BalanceManager.I != null)
				BalanceManager.I.balanceRequestTimer = 28;
		}
		XT.RegisterCallbackEvent(Vars.Evt_CodeToData_BonusRoundsFinished, forceUpdateBalanceFRBEnd, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHotGamesAndV3",
	ready:function()
	{
		return window["MultiLobbyConnection"] != undefined;
	},
	apply:function()
	{
		if (UHT_GAME_CONFIG_SRC.lobbyVersion == 'V3')
		{
			UHT_GAME_CONFIG_SRC.multiProductMiniLobby = true;
		}
		
		MultiLobbyConnection.IsHotSlot = function(/**string*/ uid)
		{
			return false;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchTournamentAnnouncementDisplayer",
	ready:function()
	{
		return window["TournamentAnnouncementDisplayer"] != undefined;
	},
	apply:function()
	{
		var oTAD_OSA = TournamentAnnouncementDisplayer.prototype.OnShowAnnouncement;
		TournamentAnnouncementDisplayer.prototype.OnShowAnnouncement = function()
		{
			oTAD_OSA.apply(this, arguments);
			for (var i = 0; i < this.message.length; i++)
			{
				var promotionId = this.message[i].text.match(/#.+#/);
				if (promotionId != null && promotionId.length > 0)
					this.message[i].text = this.message[i].text.replace(promotionId[0], "");
				
				var endDate = this.message[i].text.match(/@.+@/);
				if (endDate != null && endDate.length > 0)
					this.message[i].text = this.message[i].text.replace(endDate[0], "");
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRedPocketLabel",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
			var paths = [
				{
					redPocketPath: "UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Asia/Content/Texts/YouWonPrizeDrop/MLA/RedPocketLabel",
					youHaveWonpath: "UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Asia/Content/Texts/YouWonPrizeDrop/MLA/YouHaveWonLabel_0"
				},
				{
					redPocketPath: "UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Asia/Content/Texts/YouWonPrizeDrop/MLA/RedPocketLabel",
					youHaveWonpath: "UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Asia/Content/Texts/YouWonPrizeDrop/MLA/YouHaveWonLabel_0"
				}
			];

			for (var i = 0; i < paths.length; i++)
			{
				var tRedPocket = globalRuntime.sceneRoots[1].transform.Find(paths[i].redPocketPath);
				if (tRedPocket == null)
					continue;
				var redPocketLBL = tRedPocket.GetComponentsInChildren(LabelMultipleLayers, true)[0];
				var tYouHave = globalRuntime.sceneRoots[1].transform.Find(paths[i].youHaveWonpath);
				if (tYouHave == null)
					continue;
				var youHaveWonLBL = tYouHave.GetComponentsInChildren(LabelMultipleLayers, true)[0];
				var redPocketLabel = tRedPocket.GetComponentsInChildren(UILabel, true)[0];
				redPocketLabel.multipleLayers = redPocketLBL;
				redPocketLabel.multipleLayers.layers = youHaveWonLBL.layers;
				redPocketLabel.multipleLayers.currentFontSize = -1;
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchRoundId",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined) && (window["FOXVars"] != undefined) && (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (!IsRequired("NORID"))
		{
			var prepared = false;
			var ppLabels = [];
			this.UpdateRoundId = function(args)
			{
				var response = XT.GetObject(FOXVars.FOX_Response);
				if (response.rid != undefined)
				{
					if (!prepared) //You are not prepared!
					{
						var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
						if (localizationRoot == null)
							return;

						var ppLabelGOPaths = [
							"GUI_mobile/PragmaticPlay/Port/Arrangeable/PragmaticPlayLabel", //mobile label portrait
							"GUI_mobile/PragmaticPlay/PPAnchorLand/PPArrangeableLand/PragmaticPlayLabel", //mobile label landscape
							"GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel", //desktop label
						];
						var ppLabelGOXPos = 
						[
							85,
							0,
							-90,
						]
						var ppLabelGOXAnchor = 
						[
							0,
							1,
							1,
						]
						for (var i = 0; i < ppLabelGOPaths.length; ++i)
						{
							var go = localizationRoot.transform.Find(ppLabelGOPaths[i]);
							if (go != null)
							{
								var oActive = go.gameObject.activeSelf;
								go.gameObject.SetActive(false);
								copyGO = instantiate(go.gameObject);					
								go.gameObject.SetActive(oActive);
								copyGO.transform.SetParent(go.parent.transform, false);
								var pos = copyGO.transform.localPosition();
								pos.x = ppLabelGOXPos[i];
								copyGO.transform.localPosition(pos);
								copyGO.transform.localRotation(UHTMath.Quaternion.euler(UHTMath.Vector3.zero));
								copyGO.transform.localScale(UHTMath.Vector3.one);
								copyGO.SetActive(true);
								
								var newlabel = copyGO.GetComponent(UILabel);
								newlabel.text = "";
								newlabel.anchorX = ppLabelGOXAnchor[i];
								newlabel.color.a = 0.8;
								if (i == 0)
									newlabel.portraitLabel = true;
								ppLabels.push(newlabel);
							}
						}
						if (window["JurisdictionGameTitle"] != undefined)
						{
							var jurisdictionGameTitle = globalRuntime.sceneRoots[1].GetComponentsInChildren(JurisdictionGameTitle,true)[0];
							if (jurisdictionGameTitle != null)
							{
								var jurisdictionGameTitleLabels = jurisdictionGameTitle.GetComponentsInChildren(UILabel, true);
								var portraitGT = localizationRoot.transform.Find("GUI_mobile/PragmaticPlay/Port/Arrangeable/GT");
								if (portraitGT != null)
								{
									var portraitGTLabel = portraitGT.gameObject.GetComponentsInChildren(UILabel, true)[0];
									portraitGTLabel.textIsUnprocessed = true;
									var o_pPT = portraitGTLabel.processPixiText;
									portraitGTLabel.processPixiText = function()
									{
										o_pPT.apply(this, arguments);
										var width = this.GetWidth();
										if (width > 407)
										{
											this.fontSize = Math.floor(this.fontSize * (407 / width));
											this.init(true);
											o_pPT.apply(this, arguments);
										}

										for (var i = 0; i < ppLabels.length; i++)
										{
											if (ppLabels[i].portraitLabel)
											{
												ppLabels[i].transform.localPosition(this.GetWidth() + this.transform.localPosition().x + 10, -2, 0)
												ppLabels[i].anchorX = 0;
												ppLabels[i].init(true);
											}
										}
									}
								}

								for (var i = 0; i < jurisdictionGameTitleLabels.length; i++)
								{
									var go = jurisdictionGameTitleLabels[i];
									var oActive = go.gameObject.activeSelf;
									go.gameObject.SetActive(false);
									copyGO = instantiate(go.gameObject);
									go.gameObject.SetActive(oActive);
									copyGO.transform.SetParent(go.transform, false);
									jurisdictionGameTitleLabels[i].textIsUnprocessed = true;
									var o_pPT = jurisdictionGameTitleLabels[i].processPixiText;
									jurisdictionGameTitleLabels[i].processPixiText = function()
									{
										o_pPT.apply(this, arguments);
										for (var i = 0; i < ppLabels.length; i++)
										{
											if (ppLabels[i].requiresPositionUpdate)
											{
												if (this.anchorX < 0.1)
												{
													ppLabels[i].transform.localPosition(-10,0,0);
												}
												else if (this.anchorX > 0.9)
												{
													ppLabels[i].transform.localPosition(-this.GetWidth() - 10,0,0);
												}
												ppLabels[i].requiresPositionUpdate = false;
											}
										}
									}
									copyGO.transform.localRotation(0,0,0);
									copyGO.transform.localScale(1,1,1);
									copyGO.SetActive(true);

									var newlabel = copyGO.GetComponent(UILabel);
									newlabel.anchorX = 1;
									newlabel.text = "";
									newlabel.color.a = 0.8;
									newlabel.effectStyle = 0;
									newlabel.requiresPositionUpdate = true;
									ppLabels.push(newlabel);
								}
							}
						}
						prepared = true;
					}
				
					for (var i = 0; i < ppLabels.length; ++i)
					{
						ppLabels[i].text = response.rid;
					}
				}
			};

			XT.RegisterCallbackEvent(FOXVars.Evt_FOX_InitReceived, this.UpdateRoundId, this);
			XT.RegisterCallbackEvent(FOXVars.Evt_FOX_SpinReceived, this.UpdateRoundId, this);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchDisableReplayBBHSMForSky",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		var gameSymbols = "vswaysbbhas,vswaysbbhas_cv90,vs20lampinf,vs20lampinf_cv90".split(",");
		if (gameSymbols.indexOf(UHT_CONFIG.SYMBOL)>-1)
		{
			var styleNameList = "sky_skybet,sky_skybingo,sky_skyvegasdirect,sky_skystaging,sky_skytest".split(",");
			for (var i = 0; i < styleNameList.length; i++)
			{
				if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
				{
					window["UHT_REPLAY_DISABLED"] = true;
					break;
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideIDNLoader",
	ready:function()
	{
		return (window["UHTEngine"] != undefined && window["UHTEngine"]["HideFirstLoader"] != undefined);
	},
	apply:function()
	{
		var oUHTE_HL = UHTEngine.HideFirstLoader;
		UHTEngine.HideFirstLoader = function()
		{
			var gameSymbols = "vs20supermania,vs20saiman,vs5gemstone,vs20giftcndblz".split(",");
			if (gameSymbols.indexOf(UHT_CONFIG.SYMBOL)>-1)
			{
				var mustHide = true;
				var stylenames = "idn2_idn2101,idn2_idntotob2b24,idn2_idn2107,idn2_idntotob2b25,idn_idn2109,idn_oxplay3,idn2_idn2110,idn2_idntotob2b26,idn2_idn2111,idn2_idntotob2b27,idnplay_adline1,idnplay__adline2,idn_streaming,idnsport_stream,jokerbolastreaming,kerabolastreaming,nagabolastreaming,idn2_idntotob2b16,t1idn_t1ap6,t1idn_idnsport_3_idr,idn2_idn2ap7,idn2_idntotob2b_6,bh_bh001,bh_bh0010,bh_bh0011,bh_bh0012,bh_bh0013,bh_bh0014,bh_bh0015,bh_bh0016,bh_bh0017,bh_bh0018,bh_bh0019,bh_bh002,bh_bh0020,bh_bh0021,bh_bh0022,bh_bh0023,bh_bh0024,bh_bh0025,bh_bh0026,bh_bh0027,bh_bh0028,bh_bh0029,bh_bh003,bh_bh0030,bh_bh004,bh_bh005,bh_bh006,bh_bh007,bh_bh008,bh_bh009,bh_idnup2,idn2_idnin2,idn2_idntotob2b_9,idn2_idnin3,idn2_idntotob2b_8,idnubo_xaa_idr,idnubo_xab_idr,idnubo_xac_idr,idnubo_xad_idr,idnubo_xae_idr,idnubo_xaf_idr,idnubo_xag_idr,idnubo_xai_idr,idnubo_xaj_idr,idnubo_xak_idr,idnubo_xal_idr,idnubo_xam_idr,idnubo_xan_idr,idnubo_xao_idr,idnubo_xap_idr,idnubo_xaq_idr,idnubo_xar_idr,idnubo_xas_idr,idnubo_xau_idr,idnubo_xav_idr,idnubo_xax_idr,idnubo_xay_idr,idnubo_xba_idr,idnubo_xbb_idr,idnubo_xbc_idr,idnubo_xbd_idr,idnubo_xbf_idr,idnubo_xbh_idr,idnubo_xbi_idr,idnubo_xbj_idr,idnubo_xbk_idr,idnubo_xbl_idr,idnubo_xbm_idr,idnubo_xbo_idr,idnubo_xbp_idr,idnubo_xbq_idr,idnubo_xbr_idr,idnubo_xbs_idr,idnubo_xbt_idr,idnubo_xbu_idr,idnubo_xbv_idr,idnubo_xbw_idr,idnubo_xbx_idr,idnubo_xby_idr,idnubo_xbz_idr,idnubo_xca_idr,idnubo_xcb_idr,idnubo_xcc_idr,idnubo_xcd_idr,idnubo_xce_idr,idn_idn_idnsport_2_idr,t1idn_dewabet_cny,t1idn_t1idndewabetcnysw,t1idn_dewabet_idr,t1idn_t1idndewabetidrsw,t1idn_dewabet_myr,t1idn_t1idndewabetmyrsw,t1idn_dewabet_thb,t1idn_t1idndewabetthbsw,t1idn_dewabet_vnd,t1idn_t1idndewabetvndsw,t1idn_dewagg_idr,t1idn_t1idndewaggidrsw,t1idn_idngoal_idr,t1idn_t1idnidnsport1idrsw,t1idn_idnsport2_idr,t1idn_t1idnidnsport2idrsw,t1idn_idnsport2_ld_idr,t1idn_t1idnidnsport2ldswidr,t1idn_idnsport_cny,t1idn_idnsport_idr,t1idn_idnsport_ld_idr,t1idn_t1idnidnsportldswidr,t1idn_idnsport_myr,t1idn_idnsport_thb,t1idn_idnsport_vnd,t1idn_kdslots_idr,t1idn_t1idnkdslotsidrsw,t1idn_kdslots_vnd,t1idn_t1idnkdslotsvndsw,t1idn_lemacau_idr,t1idn_t1idnlemacauidrsw,t1idn_unovegas_idr,t1idn_t1idnunovegasidrsw,idn_303vip_idr,idn_7meter_idr,idn_7winbet,idn_airasiabet_idr,idn_ajaibslots,idn_alexavegas_idr,idn_alphaslots88,idn_amergg,idn_anekaslots,idn_areaslots,idn_arunabet,idn_asialive88,idn_asianwin88,idn_asiaroyal88,idn_bcoin,idn_bestoto88,idn_betcrypto88,idn_betcrypto88_usd,idn_bethoki77,idn_betslots88,idn_bettogel,idn_bigdewa,idn_bola88_idr,idn_bolagg,idn_bolatangkas_idr,idn_brobet77,idn_bslots88,idn_capital303,idn_caspo777,idn_cemeslot,idn_cocobet,idn_coin303,idn_dash86,idn_dewabetcnysw,idn_dewabetidrsw,idn_dewabetmyrsw,idn_dewabetthbsw,idn_dewabetvndsw,idn_dewacash_idr,idn_dewacasino,idn_dewagg,idn_dewaggsw,idn_dewascore_idr,idn_dewataslot_idr,idn_dewaterbang,idn_dewavegas_sw,idn_dnabet,idn_dragonslot,idn_enterslots,idn_eraplay88,idn_exabet88,idn_galaxybet88,idn_gaskuenbet,idn_gladiator88,idn_gobetasia,idn_golbos_idr,idn_holyslot88,idn_ibetoto,idn_ibwin,idn_idn001,idn_idn002,idn_idn003,idn_idn004,idn_idn005,idn_idn006,idn_idn007,idn_idn008,idn_idn009,idn_idn010,idn_idn011,idn_idn012,idn_idn013,idn_idn014,idn_idn015,idn_idn016,idn_idn017,idn_idn018,idn_idn019,idn_idn020,idn_idn021,idn_idn022,idn_idn023,idn_idn024,idn_idn025,idn_idn026,idn_idn027,idn_idn028,idn_idn029,idn_idn030,idn_idn031,idn_idn032,idn_idn033,idn_idn034,idn_idn035,idn_idn036,idn_idn037,idn_idn038,idn_idn039,idn_idn040,idn_idn041,idn_idn042,idn_idn043,idn_idn044,idn_idn045,idn_idn046,idn_idn047,idn_idn048,idn_idn049,idn_idn050,idn_idn051,idn_idn052,idn_idn053,idn_idn054,idn_idn055,idn_idn056,idn_idn057,idn_idn058,idn_idn059,idn_idn060,idn_idn061,idn_idn062,idn_idn063,idn_idn064,idn_idn065,idn_idn066,idn_idn067,idn_idn068,idn_idn069,idn_idn070,idn_idn071,idn_idn072,idn_idn073,idn_idn074,idn_idn075,idn_idn076,idn_idn077,idn_idn078,idn_idn079,idn_idn080,idn_idn081,idn_idn082,idn_idn083,idn_idn084,idn_idn085,idn_idn086,idn_idn087,idn_idn088,idn_idn089,idn_idn090,idn_idn091,idn_idn092,idn_idn093,idn_idn094,idn_idn095,idn_idn096,idn_idn097,idn_idn098,idn_idn099,idn_idn100,idn_idn101,idn_idn102,idn_idn103,idn_idn104,idn_idn105,idn_idn106,idn_idn107,idn_idn108,idn_idn109,idn_idn110,idn_idn111,idn_idn112,idn_idn113,idn_idn114,idn_idn115,idn_idn116,idn_idn117,idn_idn118,idn_idn119,idn_idn120,idn_idn121,idn_idn122,idn_idn123,idn_idn124,idn_idn125,idn_idn126,idn_idn127,idn_idn128,idn_idn129,idn_idn130,idn_idn131,idn_idn132,idn_idn133,idn_idn134,idn_idn135,idn_idn136,idn_idn137,idn_idn138,idn_idn139,idn_idn140,idn_idn141,idn_idn142,idn_idn143,idn_idn144,idn_idn145,idn_idn146,idn_idn147,idn_idn148,idn_idn149,idn_idn150,idn_idn151,idn_idn152,idn_idn153,idn_idn154,idn_idn155,idn_idn156,idn_idn157,idn_idn158,idn_idn159,idn_idn160,idn_idn161,idn_idn162,idn_idn163,idn_idn164,idn_idn165,idn_idn166,idn_idn167,idn_idn168,idn_idn169,idn_idn170,idn_idn171,idn_idn172,idn_idn173,idn_idn174,idn_idn175,idn_idn176,idn_idn177,idn_idn178,idn_idn179,idn_idn180,idn_idn181,idn_idn182,idn_idn183,idn_idn184,idn_idn185,idn_idn186,idn_idn187,idn_idn188,idn_idn189,idn_idn190,idn_idn191,idn_idn192,idn_idn193,idn_idn194,idn_idn195,idn_idn196,idn_idn197,idn_idn198,idn_idn199,idn_idn200,idn_idncash,idn_idngg,idn_idngoal_idr,idn_idnseamless_idnsport_ld,idn_idntogel,idn_idnup_b2_krw,idn_igamble247,idn_ihokibet,idn_ilucky88,idn_indogame,idn_indogg,idn_indopride88,idn_indoslots,idn_indosport88,idn_indoxl,idn_jagoslots,idn_javabet,idn_javaslots,idn_jawaratoto88,idn_kdcambodia,idn_kdslotsidrsw,idn_kdslotsvndsw,idn_kedaislot,idn_kemonbet,idn_kerabatslot,idn_kingjr99,idn_klik99,idn_klikfifa_idr,idn_klikslots,idn_klubslot,idn_knslots,idn_koinid,idn_kointoto,idn_koinvegas,idn_landslot88,idn_lemacausw,idn_ligaplay88,idn_maniatogel,idn_megahoki88,idn_mejahoki_idr,idn_mildcasino_idr,idn_mnaslot,idn_nagagg,idn_nagaikan,idn_narkobet,idn_ngbet,idn_nyalabet,idn_ox001,idn_ox002,idn_ox003,idn_ox004,idn_ox005,idn_ox006,idn_ox007,idn_ox008,idn_ox009,idn_ox010,idn_ox011,idn_ox012,idn_ox013,idn_ox014,idn_ox015,idn_ox016,idn_ox017,idn_ox018,idn_ox019,idn_ox020,idn_ox021,idn_ox022,idn_ox023,idn_ox024,idn_ox025,idn_ox026,idn_ox027,idn_ox028,idn_ox029,idn_ox030,idn_ox031,idn_ox032,idn_ox033,idn_ox034,idn_ox035,idn_ox036,idn_ox037,idn_ox038,idn_ox039,idn_ox040,idn_ox041,idn_ox042,idn_ox043,idn_ox044,idn_ox045,idn_ox046,idn_ox047,idn_ox048,idn_ox049,idn_ox050,idn_ox051,idn_ox052,idn_ox053,idn_ox054,idn_ox055,idn_ox056,idn_ox057,idn_ox058,idn_ox059,idn_ox060,idn_ox061,idn_ox062,idn_ox063,idn_ox064,idn_ox065,idn_ox066,idn_ox067,idn_ox068,idn_ox069,idn_ox070,idn_ox071,idn_ox072,idn_ox073,idn_ox074,idn_ox075,idn_ox076,idn_ox077,idn_ox078,idn_ox079,idn_ox080,idn_ox081,idn_ox082,idn_ox083,idn_ox084,idn_ox085,idn_ox086,idn_ox087,idn_ox088,idn_ox089,idn_ox090,idn_ox091,idn_ox092,idn_ox093,idn_ox094,idn_ox095,idn_ox096,idn_ox097,idn_ox098,idn_ox099,idn_ox100,idn_ox101,idn_ox102,idn_ox103,idn_ox104,idn_ox105,idn_ox106,idn_ox107,idn_ox108,idn_ox109,idn_ox110,idn_ox111,idn_ox112,idn_ox113,idn_ox114,idn_ox115,idn_ox116,idn_ox117,idn_ox118,idn_ox119,idn_ox120,idn_ox121,idn_ox122,idn_ox123,idn_ox124,idn_ox125,idn_ox126,idn_ox127,idn_ox128,idn_ox129,idn_ox130,idn_ox131,idn_ox132,idn_ox133,idn_ox134,idn_ox135,idn_ox136,idn_ox137,idn_ox138,idn_ox139,idn_ox140,idn_ox141,idn_ox142,idn_ox143,idn_ox144,idn_ox145,idn_ox146,idn_ox147,idn_ox148,idn_ox149,idn_ox150,idn_ox151,idn_ox152,idn_ox153,idn_ox154,idn_ox155,idn_ox156,idn_ox157,idn_ox158,idn_ox159,idn_ox160,idn_ox161,idn_ox162,idn_ox163,idn_ox164,idn_ox165,idn_ox166,idn_ox167,idn_ox168,idn_ox169,idn_ox170,idn_ox171,idn_ox172,idn_ox173,idn_ox174,idn_ox175,idn_ox176,idn_ox177,idn_ox178,idn_ox179,idn_ox180,idn_ox181,idn_ox182,idn_ox183,idn_ox184,idn_ox185,idn_ox186,idn_ox187,idn_ox188,idn_ox189,idn_ox190,idn_ox191,idn_ox192,idn_ox193,idn_ox194,idn_ox195,idn_ox196,idn_ox197,idn_ox198,idn_ox199,idn_ox200,idn_oxplay,idn_oxplayb2c,idn_paiza99_idr,idn_pandawa88,idn_permatabet88,idn_pionbet,idn_playslots88,idn_powernet,idn_pphoki,idn_proplay88,idn_qq88bet,idn_santagg,idn_shenpoker,idn_shenpokerlc,idn_shiobet,idn_shnslot,idn_simplebet8,idn_skor88_idr,idn_slotasia,idn_slotid88,idn_slotogel,idn_slotsgg,idn_starslots88,idn_stasiunplay,idn_tangkas_idr,idn_tiketslot,idn_togelasiabet,idn_tokohoki78,idn_totogg88,idn_totoid88,idn_totowin88,idn_trdsbet,idn_uboxaivipbet88,idn_uboxbaubocash,idn_unogg,idn_unovegassw,idn_vegas4d,idn_vegas88_idr,idn_vegasgg,idn_vegashoki88,idn_visabet88,idn_winslots8,idn_x2casino,idn2_idntotob2b19,t1idnsg18,t1idn_idnsport_2_idr,idn2_bolagila,idn2_dewalive,idn2_dewapoker,idn2_dewatogel,idn2_domino88,idn2_dominobetn,idn2_idn19,idn2_idnpokerb2b,idn2_kartupoker,idn2_lapak303,idn2_naga303,idn2_nagapoker,idn2_poker88,idn2_remipoker,idn2_togel88,idn2_totogel,idn2_idn25,idn2_idntototb2b,idn2_idn26,idn2_idntotob2b_2,idn2_idn30,idn2_idntotob2b_3,idn2_idn31,idn2_idntotob2b_4,idn2_idntotob2b_5,idn2_idnsg40,idn2_idntotob2b_7,idn_oxplayrk,idn_oxplay001,idn_oxplay1,idn2_idnsg42,idn2_idntotob2b4,idn2_idntotob2b_10,idn2_idnsg48,idn2_idntotob2b_10,idn_idnsg50,idn_idnidnsportidr,idn_idnsg51,idn_idnsport4idr,idn2_idnsg52,idn2_idntotob2b15,idn2_idnsg55,idn2_idntotob2b_12,idn2_idnsg58,idn2_idntotob2b_11,idn2_idnsg66,idn2_idntotob2b13,idn2_idnsg69,idn2_idntotob2b14,idn2_idnsg71,idn2_idntotob2b17,idn_idnsg74,idn_idnidnsport3idr,id2_idnsg75,id2_idntotob2b18,idn2_idnsg78,idn2_idntotob2b20,idn2_idnsg79,idn2_idntotob2b_21,idn2_idnsg80,idn2_idntotob2b22,idn_idnsg81,idn_oxplay2enhance,idn_oxplay2,idn2_idnsg82,idn2_idntotob2b23".split(",");
				if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME)>-1)
					mustHide = false;

				if (mustHide)
				{
					var customLoader = globalRuntime.sceneRoots[0].transform.Find("UI Root/LoaderParent/Loader/CustomContent");
					if (customLoader != null && customLoader.gameObject != null)
					{
						customLoader.gameObject.SetActive(false);
					}
				}
			}

			//IDNUP
			var gameSymbols = "vs40killdieh,vs20swbombdrop,vs20olyh,vs20puresweeth,vswaysdogbank,vs4096bison,vs20sunjewel,vs20purefruith,vswaysladydh,vswaysrisphon".split(",");
			if (gameSymbols.indexOf(UHT_CONFIG.SYMBOL)>-1)
			{
				var mustHide = true;
				var stylenames = "bh_idnupmeritroyal,bh_idnupkingroyal".split(",");
				if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME)>-1)
					mustHide = false;

				if (mustHide)
				{
					var customLoader = globalRuntime.sceneRoots[0].transform.Find("UI Root/LoaderParent/Loader/CustomContent");
					if (customLoader != null && customLoader.gameObject != null)
					{
						customLoader.gameObject.SetActive(false);
					}
				}
			}
			oUHTE_HL.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
	interval: 50
});

UHTPatch({
	name: "PatchKeyboardOnMobile",
	ready:function()
	{
		return (window["KeyboardManager"] != undefined);
	},
	apply:function()
	{
		if (!IsRequired("MOBK"))
			return;
	
		if (!UHT_DEVICE_TYPE.MOBILE)
			return;
	
		window["MyKMInitCalled"] = false;
		var oKMI = KeyboardManager.Init;
		KeyboardManager.Init = function()
		{
			var oUDTM = UHT_DEVICE_TYPE.MOBILE;
			UHT_DEVICE_TYPE.MOBILE = false;
			
			window["MyKMInitCalled"] = true;
			
			oKMI.apply(this, arguments);
			
			UHT_DEVICE_TYPE.MOBILE = oUDTM;
		}
		
		var oKMU = KeyboardManager.Update;
		KeyboardManager.Update = function()
		{
			if (!window["MyKMInitCalled"])
				KeyboardManager.Init();
			
			var oUDTM = UHT_DEVICE_TYPE.MOBILE;
			UHT_DEVICE_TYPE.MOBILE = false;
			
			oKMU.apply(this, arguments);

			UHT_DEVICE_TYPE.MOBILE = oUDTM;
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchErrorReporting",
	ready:function()
	{
		return true;
	},
	apply:function()
	{
		if (window["gtag"] != undefined)
		{
			if (gaMapping['LoadingTracker'])
				window["gtag"]("event", "E_0_game_icon_clicked",
					{
						'send_to':window['gaMapping']['LoadingTracker'],
						'event_category': "uht_loading",
						'event_label': URLGameSymbol,
						'value': 1
					});
			
			if (gaMapping['BehaviourTracker'])
				window.addEventListener("error", function(event){
					if (!UHT_SEND_ERRORS)
						return;
					UHT_HAD_ERRORS = true;
					
					event["filename"] = String(event["filename"]).split("?").shift().split("/").pop();
					var msg = event["message"] + " at " + event["filename"] + ":" + event["lineno"] + ":" + event["colno"];

					window["gtag"]("event", msg,
						{
							'send_to':window['gaMapping']['BehaviourTracker'],
							'event_category': "uht_errors",
							'event_label': URLGameSymbol,
							'value': 1
						});
					window.onerror = null;
				});
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchMultiLobbyConnection_140824",
	ready:function()
	{
		return (window["MultiLobbyConnection"] != undefined);
	},
	apply:function()
	{
		MultiLobbyConnection.prototype.UpdateCategoryLists = function(/**LobbyCategory*/ category, /**boolean*/ updateTextures)
		{
			var games = category.games;
			if (games == null)
				return;

			var gamesLand = games;
			var gamesPort = games;

			if (category.symbol == MultiLobbyCategorySymbol.LandingPage && category != this.searchCategory)
			{
				gamesLand = category.gamesLand;
				gamesPort = category.gamesPort;
			}

			var listLand = category.listLandscape = [];
			var listPort = category.listPortrait = [];

			var listL = null;
			var listP = null;

			var textures = updateTextures ? this.GetTextures(this.textureSuffix) : null;
			for (var j = 0; j < games.length; ++j)
			{
				var game = games[j];

				if (updateTextures)
					this.UpdateTexture(textures, game);

				var idxL = j % this.gamesPerLineLandscape;
				var idxP = j % this.gamesPerLinePortrait;

				if (idxL == 0)
				{
					if (listL != null)
						listLand.push(listL);

					listL = [];
				}

				if (idxP == 0)
				{
					if (listP != null)
						listPort.push(listP);

					listP = [];
				}

				listL.push(gamesLand[j]);
				listP.push(gamesPort[j]);
			}

			if (listL != null)
				listLand.push(listL);

			if (listP != null)
				listPort.push(listP);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentLeaderboardItem_140772",
	ready:function()
	{
		return (window["TournamentLeaderboardItem"] != undefined);
	},
	apply:function()
	{
		var ignoredFlags = ["ph"];
		var reqIF = IsRequired("TIF");
		if (reqIF != false)
			for (var i=0; i<reqIF.length; i++)
				ignoredFlags.push(reqIF[i]);

		var reqEF = IsRequired("TEF");
		if (reqEF != false)
			for (var i=0; i<reqEF.length; i++)
				window["TOURNAMENT_ENFORCED_FLAG"] = reqEF[i];

		window["TOURNAMENT_IGNORED_FLAGS"] = ignoredFlags;
		TournamentLeaderboardItem.prototype.UpdateValue = function(/**TournamentProtocol.LeaderboardItem*/ lbi)
		{
			this.gameObject.SetActive(lbi != null);

			if (lbi == null)
				return;

			var isYou = lbi.isPlayer;
			var color = isYou ? this.colorYou : this.colorNotYou;

			this.placeLabel.text = String(lbi.position);
			this.scoreLabel.text = PromotionsHelper.FormatScore(lbi.score, lbi.leaderboard);
			this.playerLabel.text = isYou ? this.localizedYouLabel.text : String(lbi.playerID);

			if (this.useColor)
			{
				this.placeLabel.SetColor(color);
				this.scoreLabel.SetColor(color);
				this.playerLabel.SetColor(color);
			}

			if (this.oddContents != null)
				this.oddContents.SetActive(this.valueIdx % 2 == 1);

			if (this.youContent != null)
				this.youContent.SetActive(isYou);

			if (isYou)
			{
				if (this.capitalizeYou)
					this.playerLabel.text = this.playerLabel.text.toUpperCase();

				if (this.formatYou)
					this.playerLabel.text = this.youFormat.replace("{0}", this.playerLabel.text);
			}
			else if (this.replaceAsterisksInPlayerID)
				this.playerLabel.text = this.playerLabel.text.replace(/\*/g, this.playerIDAsteriskReplacement);

			if (this.countryFlag != null)
			{
				if (this.playerWidth < 0)
				{
					this.scoreWidth = this.scoreLabel.width;
					this.playerWidth = this.playerLabel.width;
					this.playerLocalPos = this.playerLabel.transform.localPosition();
				}

				var hasFlag = !_string.IsNullOrEmpty(lbi.countryID);
				var playerOffset = new UHTMath.Vector3(hasFlag ? this.countryFlagPlayerOffset : 0, 0, 0);

				this.playerLabel.width = this.playerWidth - playerOffset.x;
				this.playerLabel.transform.localPosition(UHTMath.Vector3.add(this.playerLocalPos, playerOffset));

				this.countryFlag.gameObject.SetActive(hasFlag);
				if (hasFlag)
				{
					var countryID = lbi.countryID;

					var data = this.countryFlag.atlas.getTextureInfoForSprite(this.countryFlag, countryID);
					var ignoreList = window["TOURNAMENT_IGNORED_FLAGS"] || ["ph"];
					if ((data == null) || (ignoreList.indexOf(countryID) > -1))
						countryID = TournamentLeaderboardItem.defaultCountryID;
					countryID = window["TOURNAMENT_ENFORCED_FLAG"] || countryID;

					this.countryFlag.SetSpriteNameForAnimation(countryID);
				}

				if (this.countryFlagPlayerLabel != null)
				{
					this.CountryFlagAdjustPlayerScoreWidths(hasFlag);

					this.countryFlagPlayerLabel.text = this.playerLabel.text;
					this.countryFlagPlayerLabel.SetColor(this.playerLabel.GetColor());

					this.playerLabel.gameObject.SetActive(!hasFlag);
					this.countryFlagPlayerLabel.gameObject.SetActive(hasFlag);
				}
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBetLevelManagerNOAB",
	ready:function()
	{
		return (window["BetLevelManager"] != undefined);
	},
	apply:function()
	{
		BetLevelManager.prototype.OnBetLevelSettings = function(blSettings)
		{
			this.betLevelSettings = blSettings;

			if ((!this.isSuperSpin && XT.GetBool(Vars.Jurisdiction_DisableAnteBet))
			|| (this.isSuperSpin && XT.GetBool(Vars.Jurisdiction_DisableSuperSpin)))
			{
				this.SetBetLevel("0");
				this.betLevelSettings = null;
			}

			if (this.betLevelSettings == null)
			{
				XT.UnregisterCallbackEvent(this.OnGameInit, this);
				XT.UnregisterCallbackObject(this.OnBetLevelSettings, this);
				Globals.SetLayerRecursively(this.gameObject, 0);
				this.xtEnabled = false;
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchHideCashInfo",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (IsRequired("SNEX"))
		{
			var paths;
			var startPath;

			if (!Globals.isMobile)
			{
				paths = [
					"UI Root/XTRoot/Root/Paytable/Pages/Common_Info2/BetMenu/Title",
					"UI Root/XTRoot/Root/Paytable/Pages/Common_Info2/BetMenu/Rules/Rule1",
					"UI Root/XTRoot/Root/Paytable/Pages/Common_Info1/MainGameInterface/Rules/Rule4",
				];

				startPath = "UI Root/XTRoot/Root/Paytable/Pages";
			}
			else //mobile
			{
				paths = [
					"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_Info4/Content/RealContent/BetMenu/Title",
					"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_Info4/Content/RealContent/BetMenu/Rules/Rule1",
					"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_Info4/Content/RealContent/BetMenu/Title",
					"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_Info4/Content/RealContent/BetMenu/Rules/Rule1",
					"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_Info2/Content/RealContent/Rules_MainGameInterface/Rule7",
					"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_Info2/Content/RealContent/Rules_MainGameInterface/Rule7"
				];

				startPath = "UI Root/XTRoot/Root/Paytable_mobile";
			}

			for (var i = 0; i < paths.length; i++)
			{
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null)
				{
					var uilabel = t.gameObject.GetComponent(UILabel);
					if (uilabel != null)
						uilabel.dontIgnoreLocalScale = true;
					t.localScale(0, 0, 0);

				}
			}

			var t = globalRuntime.sceneRoots[1].transform.Find(startPath);
			var allValD = t.GetComponentsInChildren(ValueDisplayer, true);
			var malfunctionText = null;
			for(var i in allValD)
			{
				var name = allValD[i].vdVariable.variable.name;
				if (name == "MinTotalBetFromServer")
				{
					var parent = allValD[i].gameObject.transform.parent;
					var anchor = parent.GetComponentsInChildren(MultipleLabelAnchor, true);
					if(anchor != null)
					{
						var toHide = parent.gameObject.transform.parent;
						toHide.localScale(0, 0, 0);

						var malfunctionPath = toHide.gameObject.transform.parent;
						var labels = malfunctionPath.GetComponentsInChildren(UILabel, true);
						for(var j in labels)
						{
							if(String(labels[j].gameObject.name).startsWith("Malfunction"))
							{
								malfunctionText = labels[j].text;
								break;
							}
						}
					}
				}
			}

			if(malfunctionText != null)
			{
				var allLabels = t.GetComponentsInChildren(UILabel, true);
				//hide all labels with the malfunction text
				for(var i in allLabels)
				{
					if(allLabels[i].text == malfunctionText)
					{
						allLabels[i].dontIgnoreLocalScale = true;
						allLabels[i].gameObject.transform.localScale(0, 0, 0);
					}
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchHideJackpotPlaySeedAndContribution",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (IsRequired("NOJPC"))
		{
			var paths = [
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P1_2",
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P1_3",
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P7_3",
				"UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P7_4",

				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P1_2",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P1_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot3/Content/RealContent/P7_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot3/Content/RealContent/P7_4",

				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P1_2",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P1_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot2/Content/RealContent/P7_3",
				"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot3/Content/RealContent/P7_4"
			];

			for (var i = 0; i < paths.length; i++)
			{
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null)
				{
					t.localScale(0, 0, 0);
				}
			}

			var pathsForMoving = [
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P1_4", 100],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P2", 80],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P4", 60],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P7", 40],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot1/P7_1", 20],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/TitleHolder2", 300],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P1", 260],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P2", 220],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P2_1", 180],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P3", 140],
				["UI Root/XTRoot/Root/Paytable/Pages/Common_PlayJackpot2/P4", 100],

				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P1_4", 100],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot1/Content/RealContent/P2", 80],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot2/Content/RealContent/P4", 60],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot2/Content/RealContent/P7", 40],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot2/Content/RealContent/P7_1", 20],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/TitleHolder2", 300],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P1", 260],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P2", 220],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P2_1", 180],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P3", 120],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Common_PlayJackpot4/Content/RealContent/P4", 60],

				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P1_4", 200],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P2", 100],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot1/Content/RealContent/P4", 0],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot2/Content/RealContent/P7", -100],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot2/Content/RealContent/P7_1", -200],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot3/Content/RealContent/TitleHolder2", 650],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P1", 450],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P2", 300],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P2_1", 150],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P3", 50],
				["UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Common_PlayJackpot4/Content/RealContent/P4", 0],
			];

			for (var i = 0; i < pathsForMoving.length; i++)
			{
				var t = globalRuntime.sceneRoots[1].transform.Find(pathsForMoving[i][0]);
				if (t != null)
				{
					var pos = t.localPosition();
					t.localPosition(pos.x, pos.y + pathsForMoving[i][1], pos.z);
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchDisableSTILLCHECKMONEYONSPIN",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("DMC"))
		{
			delete UHT_STILLCHECKMONEYONSPIN;
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});


UHTPatch({
	name: "PatchPromotionsAnnouncerInstantBonus",
	ready:function()
	{
		return (window["PromotionsAnnouncer"] != undefined && window["globalRuntime"] != undefined);
	},
	apply:function()
	{
		TournamentProtocol.Dictionary.Details.entryFeatureSettings = "entryFeatureSettings";
		
		var oTPTPPTD = TournamentProtocol.TournamentParser.ParseTournamentDetails;
		TournamentProtocol.TournamentParser.ParseTournamentDetails = function()
		{
			var res = oTPTPPTD.apply(this, arguments);
			if (res != null)
			{
				for (var r = 0; r < res.length; ++r)
					for (var i = 0; i < arguments[0].length; ++i)
						if (arguments[0][i] != null && res[r].id == _number.otoi(arguments[0][i][TournamentProtocol.Dictionary.Details.id]))
						{
							var dict = arguments[0][i];
							if (dict[TournamentProtocol.Dictionary.Details.entryFeatureSettings] != undefined)
							{
								var details = res[r];
								details.entryFeatureSettings = dict[TournamentProtocol.Dictionary.Details.entryFeatureSettings];
								if (details.entryFeatureSettings["availableGameName"] != undefined)
									details.entryFeatureSettings["availableGameName"] = details.entryFeatureSettings["availableGameName"].replace(/ /g, " ");
							}
						}
			}
			return res;
		};

		var oPAOSW = PromotionsAnnouncer.prototype.OnShowWin;
		PromotionsAnnouncer.prototype.OnShowWin = function()
		{
			var availableGameName = "";
			
			var details = PromotionsHelper.FindDetails(XT.GetString(TournamentVars.Promotion_WinID));
			if (XT.GetString(TournamentVars.PrizeDropWin_FreeRoundsType) == "F")
				if (XT.GetInt(TournamentVars.PrizeDropWin_PrizeType) == TournamentProtocol.PrizeType.FreeRounds && details != null && details.entryFeatureSettings != null && details.entryFeatureSettings["availableGameName"] != null)
				{
					availableGameName = details.entryFeatureSettings["availableGameName"];
					if (availableGameName != undefined)
					{
						var trimmedGameTitleFromPromo = availableGameName.replace(/GR\sCV/, "").replace(/\sCV/, "").replace(/\sJP/, "").replace(/\s/g, "").toLowerCase();
						var trimmedGameTitle = XT.GetString(Vars.GameTitle).replace("™", "").replace(/\s/g, "").toLowerCase();
						var pageTitle = document.title.replace(/GR\sCV/, "").replace(/\sCV/, "").replace(/\sJP/, "").replace(/\s/g, "").toLowerCase();
						if (trimmedGameTitleFromPromo == trimmedGameTitle || pageTitle == trimmedGameTitleFromPromo)
							availableGameName = "";
					}
				}

			oPAOSW.apply(this, arguments);

			if (XT.GetString(TournamentVars.PrizeDropWin_FreeRoundsType) == "F")
				XT.SetString(TournamentVars.PrizeDropWin_FreeRoundGames, availableGameName)
		};
		
		//campaignId & campaignEndDate
		
		TournamentProtocol.Dictionary.Tournament.campaignId = "campaignId";
		TournamentProtocol.Dictionary.Tournament.campaignEndDate = "campaignEndDate";
		
		var oTPTPPT = TournamentProtocol.TournamentParser.ParseTournaments;
		TournamentProtocol.TournamentParser.ParseTournaments = function()
		{
			var res = oTPTPPT.apply(this, arguments);
			if (res != null)
			{
				for (var r = 0; r < res.length; ++r)
				{
					for (var i = 0; i < arguments[0].length; ++i)
						if (arguments[0][i] != null && res[r].id == _number.otoi(arguments[0][i][TournamentProtocol.Dictionary.Details.id]))
						{
							var dict = arguments[0][i];
							if (dict[TournamentProtocol.Dictionary.Tournament.campaignId] != undefined)
								res[r].campaignId = dict[TournamentProtocol.Dictionary.Tournament.campaignId];

							if (dict[TournamentProtocol.Dictionary.Tournament.campaignEndDate] != undefined)
								res[r].campaignEndDate = _number.otoi(dict[TournamentProtocol.Dictionary.Tournament.campaignEndDate]);
						}
					var tournamentName = res[r].name;
					var endDate = tournamentName.match(/@.+@/);
					if (endDate != null && endDate.length > 0)
					{
						res[r].name = res[r].name.replace(endDate[0], "");
						res[r].campaignEndDate = _number.otoi(endDate[0].replace(/@/g,""));
					}
				}
			}
			return res;
		};
		
		/*
		PromotionsHelper.GetAnnouncements = function()
		{
			var ret = [];
			var list = TournamentConnection.instance.FindNewPromoHolders();
			for (var i = 0; i < list.length; ++i)
			{
				if (list[i].promotion.isActiveInOtherGames)
					continue;
				var item = new PromotionsHelper.AnnouncementInfo;
				item.uid = list[i].uid;
				item.type = list[i].type;
				item.prizesCount = list[i].details.prizePool.totalCount;
				item.prizesAmount = list[i].details.prizePool.totalAmount;
				item.description = list[i].details.shortHtmlRules;
				if (list[i].promotion.campaignId)
					item.campaignId = list[i].promotion.campaignId;
				ret.push(item)
			}
			
			//debugger;//ret.sort ????????????? list.sort before?????????????????????
			
			return ret
		};
		*/

		var TUTS_names = [
		"PromotionDisplayerLeft",
		"PromotionDisplayerRight",
		"PromotionDisplayerCombined"
		];
		
		var TUTS = Tournament.prototype.UpdateTournamentStatus;
		Tournament.prototype.UpdateTournamentStatus = function()
		{
			if (this.tournamentData == null)
				return;
			
			var oEndDate = this.tournamentData.endDate;

			var useCampaignEndDate = (TUTS_names.indexOf(this.gameObject.name) != -1);

			if (useCampaignEndDate && (this.tournamentData.campaignEndDate > 0))
				this.tournamentData.endDate = this.tournamentData.campaignEndDate;
			
			TUTS.apply(this, arguments);
			
			this.tournamentData.endDate = oEndDate;
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPromotionsAnnouncer_137889",
	ready:function()
	{
		return (window["PromotionsAnnouncer"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (Globals.isMini)
		{
			var pa = globalRuntime.sceneRoots[1].GetComponentsInChildren(PromotionsAnnouncer, true);
			for (var i = 0; i < pa.length; i++)
			{
				var lp = pa[i].transform.localPosition();
				pa[i].transform.localPosition(lp.x, lp.y, -320);
			}

		}
	},
	retry:function()
	{
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	}
});


UHTPatch({
	name: "PatchNoJackpotTooltip",
	ready:function()
	{
		return (window["JackpotVisualMystery"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (IsRequired("NOJPT"))
		{
			if (window["UHT_GAME_CONFIG"]["GAME_SYMBOL"].indexOf("vsprg") == 0)
			{
				this.HideOnGameInit = function()
				{
					var jvm = globalRuntime.sceneRoots[1].GetComponentsInChildren(JackpotVisualMystery, true);
					for (var i = 0; i < jvm.length; i++)
					{
						var colliders = jvm[i].GetComponentsInChildren(Collider, true);
						for (var j = 0; j < colliders.length; j++)
						{
							colliders[j].enabled = false;
						}
					}
				};

				XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.HideOnGameInit, this);
			}
		}

		if (IsRequired("NOJPTW"))
		{
			if (window["UHT_GAME_CONFIG"]["GAME_SYMBOL"].indexOf("vsprg") == 0)
			{
				this.OnMinorBigWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("BiggestWinIDJackpotMinor" , "​")
				};

				this.OnMajorBigWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("BiggestWinIDJackpotMajor" , "​")
				};

				this.OnMegaBigWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("BiggestWinIDJackpotMega" , "​")
				};

				this.OnGrandBigWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("BiggestWinIDJackpotGrand" , "​")
				};

				this.OnMinorLatestWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("LatestWinIDJackpotMinor" , "​")
				};

				this.OnMajorLatestWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("LatestWinIDJackpotMajor" , "​")
				};

				this.OnMegaLatestWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("LatestWinIDJackpotMega" , "​")
				};

				this.OnGrandLatestWinnerId = function(param)
				{
					if (param != "")
						XT.SetString("LatestWinIDJackpotGrand" , "​")
				};

				XT.RegisterCallbackString("BiggestWinIDJackpotMinor", this.OnMinorBigWinnerId, this);
				XT.RegisterCallbackString("BiggestWinIDJackpotMajor", this.OnMajorBigWinnerId, this);
				XT.RegisterCallbackString("BiggestWinIDJackpotMega", this.OnMegaBigWinnerId, this);
				XT.RegisterCallbackString("BiggestWinIDJackpotGrand", this.OnGrandBigWinnerId, this);
				XT.RegisterCallbackString("LatestWinIDJackpotMinor", this.OnMinorLatestWinnerId, this);
				XT.RegisterCallbackString("LatestWinIDJackpotMajor", this.OnMajorLatestWinnerId, this);
				XT.RegisterCallbackString("LatestWinIDJackpotMega", this.OnMegaLatestWinnerId, this);
				XT.RegisterCallbackString("LatestWinIDJackpotGrand", this.OnGrandLatestWinnerId, this);
			}
		}
	},
	retry:function()
	{
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	}
});

UHTPatch({
	name: "PatchSpaceAndEnter",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UILabel"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOST"))
		{
			var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
			var labelsToHide = [];
			for (var i = 0; i < labels.length; i++)
			{
				if (labels[i].text.indexOf("SPACE and ENTER buttons on the keyboard can be used to start and stop") != -1)
					labelsToHide.push(labels[i].gameObject);
			}

			this.HideOnGameInit = function()
			{
				for (var i = 0; i < labelsToHide.length; i++)
				{
					labelsToHide[i].SetActive(false);
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.HideOnGameInit, this);
		}
	},
	retry:function()
	{
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	},
	interval: 50
});

UHTPatch({
	name: "Patch_134875",
	ready:function()
	{
		return (window["TournamentRule"] != undefined);
	},
	apply:function()
	{
		TournamentRule.prototype.SplitWords = function(res, words, paragraphIdx)
		{
			var text = "";
			var labelTxt = "";

			for (var i = 0; i < words.length; ++i)
			{
				labelTxt = this.sampleLabel.text;
				this.sampleLabel.text = words[i];

				if (this.sampleLabel.GetWidth() <= this.maxLabelWidth)
				{
					this.sampleLabel.text = labelTxt + words[i];
					if (this.sampleLabel.GetWidth() <= this.maxLabelWidth)
					{
						text = this.sampleLabel.text;
						this.sampleLabel.text += " ";
					}
					else
					{
						res.push(text);
						if (res.length >= this.maxNumberOfLines)
						{
							this.StopAt(null, 0, words, i, paragraphIdx);
							return;
						}

						this.sampleLabel.text = "";
						text = "";
						i--;
					}
				}
				else if (words[i].indexOf("\u00A0") != -1)
				{
					var processedWords = words[i].replace(/\u00A0/g, " ").split(' ');
					words.splice(i, 1);
					_array.InsertRange(words, i, processedWords);
					i--;
				}
				else
				{
					this.sampleLabel.text = labelTxt;
					text = "";
					this.SplitChars(res, text, words[i], paragraphIdx, words, i);

					if (this.isStopped)
						return;
				}
			}

			if (text != "")
			{
				res.push(text);
				if (res.length >= this.maxNumberOfLines)
					this.StopAt(null, 0, null, 0, paragraphIdx);
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFreeRoundsBonusConnection",
	ready:function()
	{
		return (window["FreeRoundsBonusConnection"] != undefined);
	},
	apply:function()
	{
		FreeRoundsBonusConnection.prototype.ParseFreeRoundData = function(/** ? */ data)
		{
			if ((XT.GetObject(Vars.BonusRoundsEvents) != null && XT.GetObject(Vars.BonusRoundsEvents).length > 0) || XT.GetObject(Vars.TumblingData) != null)
				return;

			var brData = new VsFreeRound();
			var brEvents = new VsFreeRoundEvent();

			brEvents.PromoType = (data["promoType"] != null) ? data["promoType"] : "";
			brData.Type = VsFreeRound.RoundType.Spins;
			var type = data["freeRoundsType"];
			switch (type)
			{
				case "N":
					brData.Type = VsFreeRound.RoundType.Spins;
					break;
				case "T":
					brData.Type = VsFreeRound.RoundType.Timed;
					break;
				case "F":
					brData.Type = VsFreeRound.RoundType.BonusBoost;
					break;
				default:
					break;
			}
			brData.RoundsLeft = _number.otoi(data["freeRoundsNumber"]);
			brEvents.RoundsLeft = _number.otoi(data["freeRoundsNumber"]);
			brEvents.Bet = _number.otod(data["betPerLine"]);
			brEvents.Lines = _number.otoi(data["numberOfLines"]);
			brEvents.TurboSpinMode = _bool.Parse(data["turboSpinMode"]);
			brEvents.PlayLaterAvailable = _bool.Parse(data["playLaterAvailable"]);
			brEvents.EndDateTimestamp = _number.otod(data["expirationDate"]);
			brEvents.IsFreeRoundPending = _bool.Parse(data["freeRoundPending"]);
			brEvents.PromoLocalizedName = (data["promoLocalizedName"] != null) ? data["promoLocalizedName"] : "";
			brEvents.Type = VsFreeRoundEvent.EventType.Start;

			this.cachedInitBonusCode = data["bonusCode"];

			var events = [];
			events.push(brEvents);

			XT.SetObject(Vars.BonusRoundsData, brData);
			XT.SetObject(Vars.BonusRoundsEvents, events);
			this.shouldUpdatePlayLater = false;
			XT.SetBool(Vars.UserChoseToPlayLater, false);
			XT.TriggerEvent(Vars.Evt_Internal_BonusRoundsInfoUpdated);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	// changes
	// "FREE PROMOTION, NO ADDITIONAL COST TO PARTICIPATE AND NO OPTION TO OPT-IN LATER.\r\n\r\nARE YOU SURE YOU WANT TO OPT OUT?"
	// to
	// "THERE IS NO ADDITIONAL COST TO PARTICIPATE AND NO OPTION TO OPT-IN LATER.\r\n\r\nARE YOU SURE YOU WANT TO OPT OUT?"

	name: "PatchPromoOptOut",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (UHT_GAME_CONFIG_SRC.lang != "en")
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/LocalizedLabelsEU/FreeConfirmOptOutLabel",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/TournamentArrangeable/Tournament/LocalizedLabelsEU/FreeConfirmOptOutLabel",
		];

		for (var i = 0; i < paths.length; i++)
		{
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
			{
				var l = t.gameObject.GetComponent(UILabel);
				l.text = "THERE IS NO ADDITIONAL COST TO PARTICIPATE AND NO OPTION TO OPT-IN LATER.\r\n\r\nARE YOU SURE YOU WANT TO OPT OUT?";
			}
		}
	},
	retry:function()
	{
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	},
});



UHTPatch({
	name: "PatchDeRTP",
	ready:function()
	{
		return (window["JurisdictionShowOdds"] != undefined);
	},
	apply:function()
	{
		if (!IsRequired("SHOEXC"))
			return;

        var oJSO_HIR = JurisdictionShowOdds.prototype.HandleInitResponse;
		var PatchDeRTP_labels = [];
		JurisdictionShowOdds.prototype.HandleInitResponse = function()
        {
            oJSO_HIR.apply(this, arguments);
			PatchDeRTP_labels.push(this.chanceLabel);
        };
		
		var oSI_ICOS = StageInit.prototype.OnIntroClosedOrSkipped;
		StageInit.prototype.OnIntroClosedOrSkipped = function()
        {
            oSI_ICOS.apply(this, arguments);

			var isMobile = false;
			var paytables = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
			if (paytables.length == 0)
			{
				paytables = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
				isMobile = true;
			}
			var paytable = paytables[0];
			XT.TriggerEvent(Vars.Evt_Internal_PaytableOpen);
			var pageFlippers = [];
			if (isMobile)
			{
				pageFlippers = globalRuntime.sceneRoots[1].GetComponentsInChildren(PageFlipper, true);
				for (var i = 0; i < pageFlippers.length; i++)
				{
					pageFlippers[i].savedActiveState = pageFlippers[i].gameObject.activeInHierarchy;
					pageFlippers[i].gameObject.SetActive(true);
				}
			}

			var initialPage = -69;
			if (!isMobile)
				initialPage = paytable.pageIdx;
			
			var minRTPVarD = [];
			var minRTPValD = [];
			
			var RTPs = [];

			var RTPVarD=[];

			var allVarD = globalRuntime.sceneRoots[1].GetComponentsInChildren(VarDisplayer, true);
			for (var i = 0; i < allVarD.length; i++)
			{
				var name = allVarD[i].variable.name;
				if (name == "ReturnToPlayer" || 
					name == "ReturnToPlayerMin" || 
					name == "ReturnToPlayerWithJackpot" || 
					name == "ReturnToPlayerMinWithJackpot")
				RTPVarD.push(allVarD[i]);
				minRTPVarD.push(name == "ReturnToPlayerMin");
			}

			var RTPValD=[];
				
			var allValD = globalRuntime.sceneRoots[1].GetComponentsInChildren(ValueDisplayer, true);
			for (var i = 0; i < allValD.length; i++)
			{
				var name = allValD[i].vdVariable.variable.name;
				if (name == "ReturnToPlayer" || 
					name == "ReturnToPlayerMin" || 
					name == "ReturnToPlayerWithJackpot" || 
					name == "ReturnToPlayerMinWithJackpot")
				RTPValD.push(allValD[i]);
				minRTPValD.push(name == "ReturnToPlayerMin");
			}
				
				
			do
			{
				var avtt = paytable.GetComponentsInChildren(AddVariablesToText, false);
				
				for (var i = 0; i < avtt.length; i++)
					for (var j = 0; j < avtt[i].someVariables.length; j++)
					{
						var variable = avtt[i].someVariables[j];
						var name = variable.variable.name;
						if (name == "ReturnToPlayer" || 
							name == "ReturnToPlayerMin" || 
							name == "ReturnToPlayerWithJackpot" || 
							name == "ReturnToPlayerMinWithJackpot")
						{
							if (name == "ReturnToPlayerMin")
							{
								avtt[i].baseLabel.gameObject.SetActive(false);
								Globals.SetLayerRecursively(avtt[i].baseLabel.gameObject, 0);
								avtt[i].baseLabel.text = " ";
							}
							else
								RTPs.push(XT.GetDouble(name));
						}
						if (variable.gameInfo_Name == "rtps")
						{
							var gameInfo = XT.GetObject("GameInfo");
							if ((gameInfo != undefined) && (gameInfo[variable.gameInfo_Name] != undefined) && (gameInfo[variable.gameInfo_Name][variable.gameInfo_Key] != undefined))
							{
								var currentRTP = XT.GetObject("GameInfo")[variable.gameInfo_Name][variable.gameInfo_Key];
								if (currentRTP != undefined)
									RTPs.push(currentRTP);
							}
						}
					}
				
				var lbl = paytable.GetComponentsInChildren(UILabel, false);
				for (var i = 0; i < lbl.length; i++)
				{
					for (var j = 0; j < RTPVarD.length; j++)
						if (lbl[i] == RTPVarD[j].label)
							if (minRTPVarD[j])
								Globals.SetLayerRecursively(lbl[i].gameObject, 0);
							else
								RTPs.push(XT.GetDouble(RTPVarD[j].variable.name));
					for (var j = 0; j < RTPValD.length; j++)
						if (lbl[i] == RTPValD[j].label)
							if (minRTPValD[j])
								Globals.SetLayerRecursively(lbl[i].gameObject, 0);
							else
								RTPs.push(XT.GetDouble(RTPValD[j].vdVariable.variable.name));
				}
				if (!isMobile)
					paytable.OnPressedPaytableNext();
			}
			while (!isMobile && (paytable.pageIdx != initialPage))
			XT.TriggerEvent(Vars.Evt_Internal_PaytableClose);

			if (isMobile)
			{
				for (var i = 0; i < pageFlippers.length; i++)
				{
					pageFlippers[i].gameObject.SetActive(pageFlippers[i].savedActiveState);
					delete pageFlippers[i].savedActiveState;
				}
			}

			if (RTPs.length>0)
			{
				var sum = 0;
				for (var i = 0; i < RTPs.length; i++)
					sum += _number.otod(RTPs[i]);
				
				var avg = sum / RTPs.length;
				avg = ((avg * 100) + 0.1) | 0;
				avg /= 100;
					
				for (var i=0; i<PatchDeRTP_labels.length; i++)
				{
					PatchDeRTP_labels[i].text += " RTP: " + avg + "%";
					PatchDeRTP_labels[i].init();
				}
			}

			if (!isMobile)
			{
				var JSOs = globalRuntime.sceneRoots[1].GetComponentsInChildren(JurisdictionShowOdds, true);
				if (JSOs.length>0)
				{
					var jso = JSOs[0];
					jso.chanceLabel.maxLines = 1;
					jso.chanceLabel.width = 580;
					jso.chanceLabel.height = 100;
					jso.chanceLabel.gameObject.transform.localPosition(0, 5, 0);
					jso.chanceLabel.init();
					var uis = jso.GetComponentsInChildren(UISprite, true)[0];
					uis.gameObject.transform.localPosition(0, 5, 0);
					uis.gameObject.transform.SetAllDirtyUserFlags();
					uis.width = 480;
				}
			}
        };
		
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});



UHTPatch({
	name: "PatchFRBAvailableFor",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (!IsRequired("NOFRBA"))
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsStartWindow/PlayLaterTexts/EndDate",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsStartWindow/PlayLaterTexts/EndDate"
		];

		for (var i = 0; i < paths.length; i++)
		{
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
			{
				t.localScale(0, 0, 0);
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchGameChangeEvent",
	ready:function()
	{
		return (window["LobbyGameButton"] != undefined);
	},
	apply:function()
	{
		var oLGB_SG = LobbyGameButton.prototype.StartGame;
		LobbyGameButton.prototype.StartGame = function(gameData)
		{
			if (UHTInterfaceBOSS.enabled)
			{
				var gameSymbol = gameData.symbol;
				if (gameSymbol == "")
					gameSymbol = gameData.uid;

				var args = 
				{
					event : "gameChange",
					params : 
					{
						gameCode: gameSymbol
					}
				};

				UHTInterfaceBOSS.PostMessageRec(window.parent, args);
			}
			oLGB_SG.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchPP28465",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnXTGameInit = function()
		{
			if (!Globals.isMobile)
			{
				var pathsDesktop = [
					"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/Utils/PromotionDisplayerLeft",
					"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/Utils/PromotionDisplayerRight"
				];

				for (var i = 0; i < pathsDesktop.length; i++)
				{
					var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
					if (t != null)
					{
						var pcs = t.GetComponent(PromotionContentSwitcher);
						if (pcs != null)
						{
							pcs.switchesByType = false;
							pcs.switchesByStyle = false;
						}
					}
				}
			}
			else if (!Globals.isMini)
			{
				var pathsMobile = [
					"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/Utils/PromotionDisplayerLeft",
					"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/Utils/PromotionDisplayerRight",
					"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/Utils/PromotionDisplayerCombined"
				];

				for (var i = 0; i < pathsMobile.length; i++)
				{
					var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobile[i]);
					if (t != null)
					{
						var pcs = t.GetComponent(PromotionContentSwitcher);
						if (pcs != null)
						{
							pcs.switchesByType = false;
							pcs.switchesByStyle = false;
						}
					}
				}
			}
		}
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);

	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchTranslation",
	ready:function()
	{
		return (window["ModificationsManager"] != undefined);
	},
	apply:function()
	{
		if (window["UHT_CONFIG"].LANGUAGE == "hy")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				if (copyFrom.text.toLowerCase() == 'ծահում')
					copyFrom.text = 'ՇԱՀՈՒՄ';
				MMCFLTL.apply(this, arguments);
			};
		}
		if (window["UHT_CONFIG"].LANGUAGE == "ar")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				copyFrom.text = copyFrom.text.replaceAll(':', ' ');
				MMCFLTL.apply(this, arguments);
			};
		}
		if (window["UHT_CONFIG"].LANGUAGE == "de")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				if (copyFrom.text == "Alle Symbole zahlenangefangen bei der äußerst linken Rolle von links nach rechts für alle nebeneinanderliegenden Rollen.")
					copyFrom.text = "Alle Symbole werden von links nach rechts auf benachbarten Rollen ausgezahlt,\n beginnend mit der Rolle ganz links.";
				MMCFLTL.apply(this, arguments);
			};
		}

		if (window["UHT_CONFIG"].LANGUAGE == "pt")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			var isFAT = null;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				if (copyFrom.text == "PRIMA A TECLA DE ESPAÇO PARA ROTAÇÃO TURBO")
					copyFrom.text = "PRESSIONE A TECLA DE ESPAÇO PARA ROTAÇÃO TURBO";

				if (globalRuntime.sceneRoots.length > 1 && isFAT == null)
				{
					isFAT = false;
					var localizationRoot = globalRuntime.sceneRoots[1].GetComponentsInChildren(LocalizationRoot)[0];
					if (localizationRoot != undefined)
					{
						var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI/PragmaticPlayAnchor/PragmaticPlayArrangeable/PragmaticPlayLabel");
						if (pragmaticPlayLabelTransform != null)
						{
							var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
							if (pragmaticPlayLabel != null)
							{
								if (pragmaticPlayLabel.text.indexOf("FAT") != -1)
									isFAT = true;
							}
						}

						var pragmaticPlayLabelTransform = localizationRoot.transform.Find("GUI_mobile/PragmaticPlay/PPAnchorLand/PPArrangeableLand/PragmaticPlayLabel");
						if (pragmaticPlayLabelTransform != null)
						{
							var pragmaticPlayLabel = pragmaticPlayLabelTransform.GetComponent(UILabel);
							if (pragmaticPlayLabel != null)
							{
								if (pragmaticPlayLabel.text.indexOf("FAT") != -1)
									isFAT = true;
							}
						}
					}
				}

				if (isFAT)
				{
					if (copyFrom.text == "MANTER PREMIDO PARA RODADA TURBO ")
						copyFrom.text = "MANTER APERTADO PARA A RODADA TURBO";
				}
				MMCFLTL.apply(this, arguments);
			};
		}

		if (window["UHT_CONFIG"].LANGUAGE == "uk")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				if (copyFrom.text == "BAC")
					copyFrom.text = "ВИ";
				if (copyFrom.text.indexOf("sРАУНДИ") != -1)
					copyFrom.text = copyFrom.text.replace("sРАУНДИ", "РАУНДИ");
				if (copyFrom.text == "ЦЕЙ БОНУС ДОСТУПНИЙ ЗА")
					copyFrom.text = "ЦЕЙ БОНУС ДОСТУПНИЙ ПРОТЯГОМ";
				MMCFLTL.apply(this, arguments);
			};
		}

		if (window["UHT_CONFIG"].LANGUAGE == "lt")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				if (copyFrom.text == "Nepakanka lėšų statymui. Įdėkite pinigų į sąskaita arba sumažinkite staymą.")
					copyFrom.text = "Nepakanka lėšų statymui. Įdėkite pinigų į sąskaita arba sumažinkite statymą.";
				MMCFLTL.apply(this, arguments);
			};
		}

		if (window["UHT_CONFIG"].LANGUAGE == "zh")
		{
			var MMCFLTL = ModificationsManager.CopyFromLabelToLabel;
			ModificationsManager.CopyFromLabelToLabel = function(copyFrom, copyTo, alsoCopyText, copyEffects)
			{
				if (copyFrom.text == " 後開始")
					copyFrom.text = " 即将开始";
				MMCFLTL.apply(this, arguments);
			};
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});


UHTPatch({
	name: "Patch120747",
	ready:function()
	{
		return (window["TournamentsManager"] != undefined);
	},
	apply:function()
	{
		TournamentsManager.prototype.UpdateTournaments = function(/**Array<TournamentProtocol.Tournament>*/ tournamentsData)
		{
			this.visibleTournamentsCount = tournamentsData != null ? tournamentsData.length : 0;
			if (this.visibleTournamentsCount > 0)
			{
				this.EnableTournaments();
				if (this.ShouldCustomSort(tournamentsData))
				{
					tournamentsData.sort(function(x,y) 
					{ 
						return (x.status != y.status) ? x.status - y.status : x.isActiveInOtherGames - y.isActiveInOtherGames
					});
				}
				this.scrollableList.UpdateValues(tournamentsData.slice());

				if (_string.IsNullOrEmpty(XT.GetString(TournamentVars.SelectedTournamentID)))
					XT.SetString(TournamentVars.SelectedTournamentID, tournamentsData[0].uid);

				if (this.isHiddenMode)
					this.DisableTournaments();

				return;
			}

			this.scrollableList.UpdateValues(null);
			this.DisableTournaments();
		};

		TournamentsManager.prototype.ShouldCustomSort = function(tournamentsData)
		{
			for (var i = 0; i < tournamentsData.length; i++)
			{
				if (tournamentsData[i].isActiveInOtherGames && tournamentsData[i].status != TournamentProtocol.StatusCode.Closed && tournamentsData[i].status != TournamentProtocol.StatusCode.Invalid)
					return true;
			}
			return false;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "Patch120311",
	ready:function()
	{
		return (window["TournamentConnection"] != undefined);
	},
	apply:function()
	{
		TournamentConnection.prototype.GetPromotions = function(/**boolean*/ sort)
		{
			var ret = [];

			if (sort)
				this.promoHolders.sort(TournamentConnection.PromoHolder.Compare);

			for (var i = 0; i < this.promoHolders.length; ++i)
				if (this.promoHolders[i].promotion != null && this.promoHolders[i].promotion.clientMode == TournamentProtocol.ClientMode.Visible)
				{
					if (this.promoHolders[i].promotion.isActiveInOtherGames && this.promoHolders[i].promotion.status == TournamentProtocol.StatusCode.Closed)
						continue;

					if (_string.IsNullOrEmpty(this.promoHolders[i].promotion.uid))
						this.promoHolders[i].promotion.uid = this.promoHolders[i].uid;

					ret.push(this.promoHolders[i].promotion);
				}

			return ret.length > 0 ? ret : null;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchShowModalFullscreen",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (!window["UHT_GAME_CONFIG_SRC"]["showFullScreenModalForMaintenance"])
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/SystemNotifications/Intrusive/Content/Background/bkg",
			"UI Root/XTRoot/Root/GUI_mobile/SystemNotifications/IntrusiveArrangeable/Intrusive/Content/Land/Background/bkg",
			"UI Root/XTRoot/Root/GUI_mobile/SystemNotifications/IntrusiveArrangeable/Intrusive/Content/Port/Background/bkg"
		];

		for (var i = 0; i < paths.length; i++)
		{
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
				t.localScale(69,69,1);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLobbyConnectionTextureMissmatch",
	ready:function()
	{
		return (window["LobbyConnection"] != undefined);
	},
	apply:function()
	{
		var oLC_LT = LobbyConnection.prototype.LoadTexture;
		LobbyConnection.prototype.LoadTexture = function(symbol, data)
		{
			this.texturesToLoadCount++;
			oLC_LT.apply(this, arguments);
		};

		var oldTexturesToLoadCount = 0;
		var oLC_AT = LobbyConnection.prototype.AddTexture;
		LobbyConnection.prototype.AddTexture = function(suffix, symbol, force, forceUrl)
		{
			oldTexturesToLoadCount = this.texturesToLoadCount;
			oLC_AT.apply(this, arguments);
			if (oldTexturesToLoadCount != this.texturesToLoadCount)
				this.texturesToLoadCount--;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFSPurchaseManager",
	ready:function()
	{
		return (window["FreeSpinsPurchaseManager"] != undefined);
	},
	apply:function()
	{
        var oFSPM_UDO = FreeSpinsPurchaseManager.prototype.UpdateDisplayedOptions;
        FreeSpinsPurchaseManager.prototype.UpdateDisplayedOptions = function()
        {
            if (this.fsPurchaseConfig == null)
                return;
            oFSPM_UDO.call(this);
        };
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDGA",
	ready:function()
	{
		return (window["dga"] != undefined);
	},
	apply:function()
	{
		window["dga"] = {
			websocket : null,
			wsUrl : null,
			tableId : null,
			casinoId : null,
			tryToConnect : true,

			// public
			connect : function(wsUrl, casinoId, tableId) {
				var self = this;
				self.tryToConnect = true;
				self.wsUrl = wsUrl;
				console.log('connecting to ' + wsUrl);
				if(self.websocket !== null && self.websocket.readyState == 1){
					self.websocket.close();
					console.log('Socket open closing it');
				} 
				self.websocket = new WebSocket(wsUrl);
				self.websocket.onopen = function(evt) {
					self.onWsOpen(evt, casinoId, tableId)
				};
				self.websocket.onclose = function(evt) {
					self.onWsClose(evt)
				};
				self.websocket.onmessage = function(evt) {
					self.onWsMessage(evt)
				};
				self.websocket.onerror = function(evt) {
					self.onWsError(evt)
				};
				if (tableId) {
					self.tableId = tableId;
				}
				self.casinoId = casinoId;
			},
			// public
			onMessage : function(data) {
				XT.SetObject(DgaVars.DgaMessage, data);
				XT.TriggerEvent(DgaVars.Evt_Internal_DgaMessage);
			},
			// public
			onConnect : function() {
				XT.TriggerEvent(DgaVars.Evt_Internal_DgaConnected);
			},
			// public
			disconnect : function() {
				var self = this;
				self.tryToConnect = false;
				if (self.websocket.readyState == 1)
					self.websocket.close();
				console.log('Disconnected');
			},
			// public
			subscribe : function(casinoId, tableId, currency) {
				var subscribeMessage = {
					type : 'subscribe',
					key : tableId,
					casinoId : casinoId,
					currency : currency
				}
				console.log('subscribing' + tableId);

				var self = this;
				// console.log('Subscribing ' + tableId);
				var jsonSub = JSON.stringify(subscribeMessage);
				self.doWsSend(jsonSub);
			},
			
			// public
			available : function(casinoId) {
				var availableMessage = {
					type : 'available',
					casinoId : casinoId
				}
				console.log('checking availability');

				var self = this;
				// console.log('Subscribing ' + tableId);
				var jsonSub = JSON.stringify(availableMessage);
				self.doWsSend(jsonSub);
			},

			onWsOpen : function(evt) {
				var self = this;

				// console.log(evt.data);
				if (self.onConnect != null) {
					self.onConnect();
				}

				console.log('Connected to wss server');
				if (self.tableId) {
					self.subscribe(self.casinoId, self.tableId)
				}
			},

			onWsClose : function(evt) {
				console.log("DISCONNECTED");
				var self = this;
				if (self.tryToConnect === true) {
					console.log("RECONNECTING");
					self.connect(self.wsUrl, self.casinoId, self.tableId);
				}
			},

			onWsMessage : function(evt) {
				var self = this;
				var data = JSON.parse(evt.data);
				// console.log(evt.data);
				if (self.onMessage != null) {
					self.onMessage(data);
				}
			},

			onWsError : function(evt) {
				console.log('ERROR: ' + evt.data);
			},

			ping : function() {
				var self = this;
				var pingMessage = {
					type : 'ping',
					pingTime : Date.now().toString()
				}
				var jsonSub = JSON.stringify(pingMessage);
				self.doWsSend(jsonSub);
			},

			doWsSend : function(message) {
				var self = this;
				console.log("SENT: " + message);
				if (self.websocket.readyState == 1)
					self.websocket.send(message);
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchBetwayLOGOUT",
	ready:function()
	{
		return (window["Runtime"] != undefined);
	},
	apply:function()
	{
		if (!window["UHT_GAME_CONFIG_SRC"])
			return;

		if (!window["BetwayAPI"])
			return;
			
		if (UHT_GAME_CONFIG_SRC["integrationType"] != "BETWAY")
			return;
	
		UHTInterfaceBOSS.PostMessage = function(/**string*/ message)
		{
			if (message == "gameLoadingEnded")
				BetwayAPI.PostMessage("BRIDGE_API_READY");
			else if (message == "gameRoundStarted")
				BetwayAPI.PostMessage("BUSY");
			else if (message == "gameRoundEnded")
				BetwayAPI.PostMessage("IDLE");
			else if (message == "openCashier")
				BetwayAPI.PostMessage("LAUNCH_BANKING");
			else if (message == "gameQuit")
				BetwayAPI.PostMessage("CLOSE_GAME");
		};

		UHTInterfaceBOSS.OnSystemMessage = function(type)
		{
			// if (type == "PleaseLogin")
			// 	BetwayAPI.PostMessage("LOGOUT", undefined, undefined, undefined, {reason: 106});
			if (type == "Timeout")
				BetwayAPI.PostMessage("LOGOUT", undefined, undefined, undefined, {reason: 104});
		};
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchNOPP",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (!IsRequired("NOPP"))
			return;

		var paths = [
			"UI Root/XTRoot/Root/GUI/PragmaticPlayAnchor",
			"UI Root/XTRoot/Root/GUI_mobile/PragmaticPlay"
		];

		for (var i = 0; i < paths.length; i++)
		{
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
			{
				t.localScale(0, 0, 0);
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchNOCLK",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined && window["ClockDisplayer"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (!IsRequired("NOCLK"))
			return;

		var clockDisplayers = globalRuntime.sceneRoots[1].GetComponentsInChildren(ClockDisplayer, true);
		for (var i = 0; i < clockDisplayers.length; i++)
			clockDisplayers[i].transform.localScale(0, 0, 0);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchReleaseJSONSMemory",
	ready:function()
	{
		return (window["Runtime"] != undefined);
	},
	apply:function()
	{
		var oR_ANSR = Runtime.prototype.addNewSceneRoot;
		Runtime.prototype.addNewSceneRoot = function(obj)
		{
			if (this.sceneRoots.length > 0) //already has client, so now it's adding game
				JsonsToImport = [];
			oR_ANSR.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Runtime"] == undefined);
	}
});

UHTPatch({
	name: "PatchAnimatedParticleFrames",
	ready:function()
	{
		return (window["Runtime"] != undefined);
	},
	apply:function()
	{
		if (!window["AnimatedParticleFrames"])
			return;
		
		var oAPF_BS = AnimatedParticleFrames.prototype.BuildSprites;
		AnimatedParticleFrames.prototype.BuildSprites = function()
		{
			this.atlas.initAtlas();
			oAPF_BS.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Runtime"] == undefined);
	}
});

UHTPatch({
	name: "PatchInfinityAutoplay",
	ready:function()
	{
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"] 
			&& window["ValueDisplayer"] != undefined && window["Slider"]!= undefined);
	},
	apply:function()
	{
		if (IsRequired("INFAP"))
		{
			if (!window["AutoplayControllerMobile"])
				return;
			var isInfinityAutoplay = false;
			var OnAutoSpinsLeft = function(value)
			{
				if (value < 99999998)
				{
					isInfinityAutoplay = false;
				}

				if (value != -1 && isInfinityAutoplay)
					XT.SetInt(Vars.AutoplaySpinsLeft, 99999999);
			};

			var OnAutoSpinsLeftDisplayed = function(value)
			{
				if (value != "∞" && isInfinityAutoplay)
					XT.SetInt(Vars.AutoplaySpinsLeftDisplayed, "∞")
			};

			var OnStopAutoplay = function()
			{
				isInfinityAutoplay = false;
			};

			var OnStoppedAutoplayByCondition = function()
			{
				isInfinityAutoplay = false;
			};

			XT.RegisterCallbackInt(Vars.AutoplaySpinsLeft, OnAutoSpinsLeft, this);
			XT.RegisterCallbackInt(Vars.AutoplaySpinsLeftDisplayed, OnAutoSpinsLeftDisplayed, this);
			XT.RegisterCallbackEvent(Vars.Evt_DataToCode_StopAutoplay, OnStopAutoplay, this);
			XT.RegisterCallbackEvent(Vars.Evt_Internal_StoppedAutoplayByCondition, OnStoppedAutoplayByCondition, this);

			var autoplayControllers = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true);
			var advanced = globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerAdvanced, true);
			autoplayControllers = autoplayControllers.concat(advanced);
			for (var i = 0; i < autoplayControllers.length; i++)
			{
				var sliders = autoplayControllers[i].GetComponentsInChildren(Slider, true);
				for (var j = 0; j < 1; j++)
				{
					sliders[j].values.push("∞");
					for (var k=0; k < sliders[j].valueDisplayers.length; k++)
					{
						sliders[j].valueDisplayers[k].allowDOG = false;
					}
				}
			}

			var oVD_OTVC = ValueDisplayer.prototype.OnTargetValueChanged;
			ValueDisplayer.prototype.OnTargetValueChanged = function(newVal) 
			{
				oVD_OTVC.apply(this, arguments);
				if (newVal == "∞")
				{
					isInfinityAutoplay = true;
					this.label.text = "∞";
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchBigWinLevelEvent",
	ready:function()
	{
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"]);
	},
	apply:function()
	{
		UHTInterfaceBOSS.OnBigWin = function(isBigWin)
		{
			if (!isBigWin)
				return;

			if (UHTInterfaceBOSS.enabled)
			{
				var args = 
				{
					event : "bigWinLevel",
					params : 
					{
						level: XT.GetInt(Vars.SpinResultBigWinLevel)
					}
				};

				UHTInterfaceBOSS.PostMessageRec(window.parent, args);
			}
		};
		XT.RegisterCallbackBool(Vars.SpinResultIsBigWin, UHTInterfaceBOSS.OnBigWin, UHTInterfaceBOSS);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchWidgetColorAnimatorAwake",
	ready:function()
	{
		return (window["WidgetColorAnimator"] != undefined);
	},
	apply:function()
	{
		WidgetColorAnimator.prototype.Awake = function()
		{
			this.Start();
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentConnectionPopulatePrizesTotalCount103698",
	ready:function()
	{
		return (window["TournamentConnection"] != undefined);
	},
	apply:function()
	{
		TournamentConnection.prototype.PopulatePrizesTotalCount = function(holder)
		{
			if (holder.details == null ||
				holder.details.prizePool == null ||
				holder.details.prizePool.prizesList == null ||
				holder.details.prizePoolTotal == null ||
				holder.details.prizePoolTotal.prizesList == null)
				return;

			var prizes = holder.details.prizePool.prizesList;
			var prizesTotal = holder.details.prizePoolTotal.prizesList;

			for (var i = 0; i < prizes.length; ++i)
			{
				var prize = prizes[i];
				var prizeTotal = this.FindPrizeByID(prizesTotal, prize.prizeID);
				if (prizeTotal != null)
					prize.totalCount = prizeTotal.count;
			}
		};
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideAutoplayInMini103530",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (Globals.isMini)
		{
			this.OnGameInit = function()
			{
				var pathsMini = [
					"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/AutoPlay",
				];

				for (var i = 0; i < pathsMini.length; i++)
				{
					var t = globalRuntime.sceneRoots[1].transform.Find(pathsMini[i]);
					if (t != null)
					{
						t.gameObject.SetActive(!XT.GetBool(Vars.Jurisdiction_DisableAutoplay));
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnGameInit, this);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLobbyCategoryDailyWins",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && window["UHT_GAME_CONFIG_SRC"]["region"] == "Asia")
		{

			this.OnXTGameInit = function()
			{
				var newText = "Daily Wins";
				if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "zh")
					newText = "天天送";
				
				if (!Globals.isMobile)
				{
					var pathsDesktop = [
						"UI Root/XTRoot/Root/MultiLobby/Lobby/Content/Holder_Categories/Static/Categories/Tabs/T_3/Content/Active/L",
						"UI Root/XTRoot/Root/MultiLobby/Lobby/Content/Holder_Categories/Static/Categories/Tabs/T_3/Content/Inactive/L"
					];

					for (var i = 0; i < pathsDesktop.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
						if (t != null)
						{
							var l = t.GetComponent(UILabel);
							if (l != null)
								l.text = newText;
						}
					}
				}
				else if (!Globals.isMini)
				{
					var pathsMobile = [
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Land/Static/Categories/Tabs/T_3/Content/Active/L",
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Land/Static/Categories/Tabs/T_3/Content/Inactive/L",
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Port/Static/Categories/Tabs/T_3/Content/Active/L",
						"UI Root/XTRoot/Root/MultiLobbyMobile/Lobby/Holder_Categories/Port/Static/Categories/Tabs/T_3/Content/Inactive/L"
					];

					for (var i = 0; i < pathsMobile.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobile[i]);
						if (t != null)
						{
							var l = t.GetComponent(UILabel);
							if (l != null)
								l.text = newText;
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchVerifyGameAuthenticity",
	ready:function()
	{
		return (window["VerifyGameAuthenticityManager"] != undefined);
	},
	apply:function()
	{
		var GA_SENT_AM_VISIBLE = false;
		var GA_SENT_AM_CLICKED = false;
		
		var VGAM_HOOKED = false;
		var COPY_CANVAS_COUNTER = 0;
		
		if (UHT_CONFIG.SYMBOL != "vs7monkeys_dev" && !IsRequired("VAPP"))
		{
			SystemMessageShowVerifySteps = function()
			{
				if (SystemMessageManager.IsMessageOpen())
					return;
				
				XT.TriggerEvent(InterfaceVars.Evt_DataToCode_CloseAllInterfaceWindows);
				
				if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "ko")
					CustomMsgManager.HandleResponse(null, {custom_msg:JSON.stringify([{
							title:"",
							text:'정품 Pragmatic Play 게임을 플레이하고 있는지 확인하기 위해, 다음과 같이 진행해 주십시오.\n \n1. 구글에서 "Pragmatic Play"검색 후 공식 홈페이지에 접속하십시오.\n \n2. Pragmatic Play 공식 페이지에서 녹색으로 표시 된 "게임 정품 인증"을 클릭하셔서 절차를 따라주세요.',
							nonIntrusive:false,
							options:
							[{	action:"continue",
								label:"OK" }]
					}])});
				else
					CustomMsgManager.HandleResponse(null, {custom_msg:JSON.stringify([{
							title:"",
							text:"To verify if you are playing a real Pragmatic Play game, please follow these steps:\n \n1.Visit our official website by searching 'Pragmatic Play' in Google search.\n \n2.On Pragmatic Play website, click on 'Game Authenticity' marked in green and follow the process.",
							nonIntrusive:false,
							options:
							[{	action:"continue",
								label:"OK" }]
					}])});
			}
			
			VerifyGameAuthenticityManager.prototype.OnTouchEnd = function()
			{
				if (!XT.GetBool(Vars.VerifyGameAuthenticity))
					return;

				for (var btnIdx = 0; btnIdx < this.buttons.length; btnIdx++)
				{
					if (this.buttons[btnIdx].activeInHierarchy)
					{
						var mask = new LayerMask();
						mask.mask = 1 << this.buttons[btnIdx].layer;
						var c = globalColliderInputManager.getHoveredCollider(this.cachedCamera.ScreenToWorldPoint(Input.mousePosition), mask);
						if(!this.wasTouchMove && (c == this.buttons[btnIdx].collider))
						{
							if (!this.IsWebView())
								SystemMessageShowVerifySteps();
							else 
								this.mustOpen = true;

							if (!GA_SENT_AM_CLICKED)
							{
								globalTracking.SendEvent("uht_behaviour", "VerifyGameAuthenticity_Clicked", 0, "BehaviourTracker");
								GA_SENT_AM_CLICKED = true;
							}
						}
					}
				}
			};
		}
		
		
		var bfCosts = null;
		
		var GetBuyFeatureCosts = function()
		{
			bfCosts = [];

			if (IsRequired("NOBF") || XT.GetBool(Vars.Jurisdiction_DisableBuyFeature))
				return;

			if (window["FreeSpinsPurchaseManager"])
				for (var fspm = globalRuntime.sceneRoots[1].GetComponentsInChildren(FreeSpinsPurchaseManager, true), i = 0; i < fspm.length; i++)
				{
					var fspc = fspm[i].fsPurchaseConfig;
					if (fspc != null)
						for (var j = 0; j < fspc.purchaseOptions.length; j++)
							bfCosts.push(fspc.purchaseOptions[j].bet);
				}
			if (window["FeaturePurchaseManager"])
				for (var fpm = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager, true), i = 0; i < fpm.length; i++)
					for (var j = 0; j < fpm[i].purchaseCosts.length; j++)
						bfCosts.push(fpm[i].purchaseCosts[j]);
			if (window["FeaturePurchaseV2"])
				for (var fpv2 = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseV2, true), i = 0; i < fpv2.length; i++)
					for (var j = 0; j < fpv2[i].featurePurchaseData.purchaseCosts.length; j++)
						bfCosts.push(fpv2[i].featurePurchaseData.purchaseCosts[j]);
			if (window["FeaturePurchaseManager_GRM"])
				for (var fpm_GRM = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager_GRM, true), i = 0; i < fpm_GRM.length; i++)
					for (var j = 0; j < fpm_GRM[i].purchaseCosts.length; j++)
						bfCosts.push(fpm_GRM[i].purchaseCosts[j]);
			if (window["FeaturePurchaseManager_BK"])
				for (var fpm_BK = globalRuntime.sceneRoots[1].GetComponentsInChildren(FeaturePurchaseManager_BK, true), i = 0; i < fpm_BK.length; i++)
					for (var j = 0; j < fpm_BK[i].purchaseCosts.length; j++)
						bfCosts.push(fpm_BK[i].purchaseCosts[j]);
		}
		
		var initialized = false;
		
		var costIdx = -1;
		
		
		var oVGAMOIF = VerifyGameAuthenticityManager.prototype.OpenIframe;
		VerifyGameAuthenticityManager.prototype.OpenIframe = function()
		{
			if (!initialized)
			{
				GetBuyFeatureCosts();

				if (document.getElementById("verifyWindow"))
					window.addEventListener("click", function(e)
						{
							if (!Globals.isMobile)
							{
								if (document.getElementById("verifyWindowContainer").classList.value.split(",").indexOf("active") != -1)
									if (!document.getElementById("verifyWindow").contains(e.target)) //clicked outside
										Globals.GamePaused = false;
							}
							else
							{
								if (VerifyGameAuthenticityManager.style == "land")
								{
									if (document.getElementById("verifyWindowContainer").classList.value.split(",").indexOf("active") != -1)
										if (!document.getElementById("verifyWindow").contains(e.target)) //clicked outside
											Globals.GamePaused = false;
								}
								else
								{
									if (document.getElementById("verifyWindowContainer").classList.value.split(",").indexOf("active") != -1)
										if (!document.getElementById("verifyWindowPort").contains(e.target)) //clicked outside
											Globals.GamePaused = false;
								}
							}
						}
					, true);
			
				if (document.getElementById("close"))
					document.getElementById("close").addEventListener("click", function() {Globals.GamePaused = false;}, false);
				if (document.getElementById("closePort"))
					document.getElementById("closePort").addEventListener("click", function() {Globals.GamePaused = false;}, false);
				
				if (Globals.isMobile)
				{
					var onNewClickAuth = function()
					{
						var currency = UHT_GAME_CONFIG_SRC["currency"];
						var bet = CoinManager.GetLastTotalBet();
						if (costIdx >= 0 && costIdx < bfCosts.length)
							bet = CoinManager.GetLastBet() * bfCosts[costIdx];
						var balance = XT.GetDouble(Vars.BalanceReceived) + XT.GetDouble(Vars.BonusBalanceReceived);
						_Clipboard.CopyText("PP||" + ServerOptions.mgckey + "||" + btoa(window["UHT_GAME_CONFIG_SRC"]["gameVerificationURL"]) + "||" + btoa(VerifyGameAuthenticityManager.rid + "||" + currency + "||" + bet + "||" + balance));
					}
					
					var but = document.getElementsByClassName("authButton")[0];
					var newBut = but.cloneNode(true);
					but.parentNode.replaceChild(newBut, but);

					var butPort = document.getElementsByClassName("authButtonPort")[0];
					var newButPort = butPort.cloneNode(true);
					butPort.parentNode.replaceChild(newButPort, butPort);

					newBut.addEventListener("click", onNewClickAuth, false);
					newButPort.addEventListener("click", onNewClickAuth, false);
				}

				if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "ko")
				{
					if (Globals.isMobile)
					{
						document.getElementsByTagName("h1")[0].innerHTML = '게임 정품 확인';
						
						document.getElementById("para1").innerHTML = 
						'1. 앱스토어 또는 구글플레이에서 <span class="orange">PRAGMATIC PLAY</span> 인증 앱을 설치합니다.<br>중요: 다운로드를 하시기 전에 게시자가 <span class="orange">PRAGMATIC PLAY</span>로 되어 있는지 확인하세요.'
						document.getElementById("para3").innerHTML =
						'2. 앱이 설치되면 아래의 인증 버튼을 클릭하세요.'
						document.getElementById("para4").innerHTML =
						'3 . 아래의 인증 버튼을 클릭하신 후, 앱을 실행하시고 앱 내에서 게임 인증을 완료해 주세요. 앱을 열 때 메시지가 표시되면 붙여넣기를 허용해 주세요.'

						document.getElementsByTagName("h1")[1].innerHTML = '게임 정품 확인';

						document.getElementById("para1Port").innerHTML =
						'1. 앱스토어 또는 구글플레이에서 <span class="orange">PRAGMATIC&nbsp;PLAY</span> 인증 앱을 설치합니다.<br>중요: 다운로드를 하시기 전에 게시자가 <span class="orange">PRAGMATIC&nbsp;PLAY</span>로 되어 있는지 확인하세요.'
						document.getElementById("para3Port").innerHTML =
						'2. 앱이 설치되면 아래의 인증 버튼을 클릭하세요.'
						document.getElementById("para4Port").innerHTML =
						'3 . 아래의 인증 버튼을 클릭하신 후, 앱을 실행하시고 앱 내에서 게임 인증을 완료해 주세요. 앱을 열 때 메시지가 표시되면 붙여넣기를 허용해 주세요.'
					}
					else
					{
						document.getElementsByTagName("h1")[0].innerHTML = '게임 정품 확인';
						document.getElementById("para1").innerHTML =
						'1. 앱스토어 또는 구글플레이에서 휴대폰에 <span class="orange">PRAGMATIC PLAY</span> 인증 앱을 설치합니다.<br>중요: 다운로드를 하시기 전에 게시자가 <span class="orange">PRAGMATIC PLAY</span>로 되어 있는지 확인하세요.';
						document.getElementById("para3").innerHTML =
						'2. 휴대폰에서 <span class="orange">PRAGMATIC PLAY</span> 인증 앱을 엽니다. 앱 내에서 <img id="appImg">을 클릭하면 카메라가 열립니다. 그럼 아래 QR코드를 스캔해보세요.<br>휴대폰에서 게임 인증을 완료해주세요.';
					}
				}
				else
				if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "pt")
				{
					if (Globals.isMobile)
					{
						document.getElementsByTagName("h1")[0].innerHTML = 'VERIFICAR AUTENTICIDADE DO JOGO';

						document.getElementById("para1").innerHTML =
						'1. Instale o app <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> da App Store ou do Google Play. Importante: antes de baixar, certifique-se de que a publicadora esteja listada como <span class="orange">PRAGMATIC PLAY</span>.';
						//document.getElementById("para1").fontFamily = 'Verdana';
						
						document.getElementById("para3").innerHTML =
						'2. Quando o app <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> estiver instalado, clique no botão AUTENTICAR abaixo.';
						//document.getElementById("para3").fontFamily = 'Verdana';
						
						document.getElementById("para4Port").innerHTML =
						'3. Após clicar no botão AUTENTICAR abaixo, abra o aplicativo e conclua a verificação do jogo no aplicativo. Se solicitado ao abrir o aplicativo, permita a colagem.';
						//document.getElementById("para4Port").fontFamily = 'Verdana';
						
						document.getElementsByClassName("authButton")[0].innerHTML = 'AUTENTICAR';

						document.getElementsByTagName("h1")[1].innerHTML = 'VERIFICAR AUTENTICIDADE DO JOGO';

						document.getElementById("para1Port").innerHTML =
						'1. Instale o app <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> da App Store ou do Google Play. Importante: antes de baixar, certifique-se de que a publicadora esteja listada como <span class="orange">PRAGMATIC PLAY</span>.';
						//document.getElementById("para1Port").fontFamily = 'Verdana';
						
						document.getElementById("para3Port").innerHTML =
						'2. Quando o app <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> estiver instalado, clique no botão AUTENTICAR abaixo.';
						//document.getElementById("para3Port").fontFamily = 'Verdana';
						
						document.getElementById("para4").innerHTML =
						'3. Após clicar no botão AUTENTICAR abaixo, abra o aplicativo e conclua a verificação do jogo no aplicativo. Se solicitado ao abrir o aplicativo, permita a colagem.';
						//document.getElementById("para4").fontFamily = 'Verdana';
						
						document.getElementsByClassName("authButtonPort")[0].innerHTML = 'AUTENTICAR';
					}
					else
					{
						document.getElementsByTagName("h1")[0].innerHTML = 'VERIFICAR AUTENTICIDADE DO JOGO';
						
						document.getElementById("para1").innerHTML =
						'1. Instale o app <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> no seu dispositivo móvel da App Store ou do Google Play<br>Importante: antes de baixar, certifique-se de que a publicadora esteja listada como <span class="orange">PRAGMATIC PLAY</span>';
						//document.getElementById("para1").fontFamily = 'Verdana';
						
						document.getElementById("para3").innerHTML =
						'2. Abra o app <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> no seu dispositivo móvel. Dentro do app, clique em <img id="appImg"> para abrir a câmera. Em seguida, leia o código QR abaixo.</p>';
						//document.getElementById("para3").fontFamily = 'Verdana';
						
						document.getElementById("para4").innerHTML = 
						'Por favor, conclua a verificação do jogo no seu dispositivo móvel';
						//document.getElementById("para4").fontFamily = 'Verdana';
					}
				}
				else
				{
					if (Globals.isMobile)
					{
						document.getElementById("para1").innerHTML =
						'1. Install the <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> app from the App Store or Google Play.<br>Important: Before downloading, ensure that the publisher is listed as <span class="orange">PRAGMATIC PLAY</span>.'
						document.getElementById("para3").innerHTML =
						'2. Once the <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> app is installed, click the AUTHENTICATE button below.'
						document.getElementById("para1Port").innerHTML =
						'1. Install the <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> app from the App Store or Google Play.<br>Important: Before downloading, ensure that the publisher is listed as <span class="orange">PRAGMATIC PLAY</span>.'
						document.getElementById("para3Port").innerHTML =
						'2. Once the <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> app is installed, click the AUTHENTICATE button below.'
					}
					else
					{
						document.getElementById("para1").innerHTML =
						'1. Install the <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> app on your mobile phone from the App Store or Google Play<br>Important: Before downloading, ensure that the publisher is listed as <span class="orange">PRAGMATIC PLAY</span>';
						document.getElementById("para3").innerHTML =
						'2. Open the <span class="orange">PRAGMATIC PLAY AUTHENTICATOR</span> app on your mobile phone. Inside the app click <img id="appImg"> and the camera will open. Then scan the QR Code below.</p>'
					}
				}
				
				initialized = true;
			}			

			Globals.GamePaused = true;
			oVGAMOIF.apply(this, arguments);
			if (!Globals.isMobile)
			{
				var currency = UHT_GAME_CONFIG_SRC["currency"];
				var bet = CoinManager.GetLastTotalBet();
				if (costIdx >= 0 && costIdx < bfCosts.length)
					bet = CoinManager.GetLastBet() * bfCosts[costIdx];
				var balance = XT.GetDouble(Vars.BalanceReceived) + XT.GetDouble(Vars.BonusBalanceReceived);
				VerifyGameAuthenticityManager.qrcode.makeCode(ServerOptions.mgckey + "||" + btoa(window["UHT_GAME_CONFIG_SRC"]["gameVerificationURL"]) + "||" + btoa(VerifyGameAuthenticityManager.rid + "||" + currency + "||" + bet + "||" + balance));
		        document.getElementById("qrcode").title = '';
			}
		};

		var oVGAMSRI = VerifyGameAuthenticityManager.prototype.SaveRoundId;
		VerifyGameAuthenticityManager.prototype.SaveRoundId = function()
		{
			oVGAMSRI.apply(this, arguments);
			
			var response = XT.GetObject(FOXVars.FOX_Response);
			if (response.puri != undefined)
				costIdx = response.puri * 1;
			else
				if (response.fs_bought != undefined)
					costIdx = 0;
				else
					costIdx = -1;
		}
		
		VerifyGameAuthenticityManager.prototype.Update = function()
		{
			if (!GA_SENT_AM_VISIBLE)
			{
				for (var btnIdx = 0; btnIdx < this.buttons.length; btnIdx++)
				{
					if (this.buttons[btnIdx].activeInHierarchy)
					{
						globalTracking.SendEvent("uht_behaviour", "VerifyGameAuthenticity_Visible", 0, "BehaviourTracker");
						GA_SENT_AM_VISIBLE = true;
					}
					if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "ko")
					{
						var newTextKO = "게임 정품 확인";
						var labels = this.buttons[btnIdx].GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							labels[i].text = newTextKO;
						}
					}
				}
			}
			if (this.mustOpen)
			{
				this.mustOpen = false;
				if (UHT_CONFIG.SYMBOL != "vs7monkeys_dev" && !IsRequired("VAPP"))
					SystemMessageShowVerifySteps();
				else
					this.OpenIframe();
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchMLA",
	ready:function()
	{
		return (window["MultipleLabelAnchor"] != undefined);
	},
	apply:function()
	{
		if (window["MultiLobbyConnection"] == undefined)
			return;
		
		MultipleLabelAnchor.prototype.Start = function()
		{
			if (this.scaleY == undefined)
				this.scaleY = true;
			if (this.isStarted)
				return;

			this.isStarted = true;
			this.initialScale = this.gameObject.transform.localScale();

			for (var i = 0; i < this.labels.length; i++)
			{
				this.cachedLabelWidths.push(-69);
				this.cachedActiveState.push(false);
			}
		};

		MultipleLabelAnchor.prototype.Update = function()
		{
			this.Start();

			var i = 0;
			var needUpdate = false;
			for (i = 0; i < this.labels.length; i++)
			{
		        if (typeof(this.labels[i].fontName) == "object")
					this.labels[i].OnWillRenderObject();
				var w = this.GetLabelWidth(this.labels[i]);
				if (w != this.cachedLabelWidths[i] || (this.ignoreInactiveLabels && this.labels[i].gameObject.activeInHierarchy != this.cachedActiveState[i]))
				{
					this.cachedLabelWidths[i] = w;
					this.cachedActiveState[i] = this.labels[i].gameObject.activeInHierarchy;
					needUpdate = true;
				}
			}

			if (needUpdate || this.mustForcedNextUpdate)
			{
				this.mustForcedNextUpdate = false;
				var offset = 0;
				var p;

				for (i = 0; i < this.labels.length; i++)
				{
					if (this.ignoreInactiveLabels && this.cachedActiveState[i] == false)
						continue;

					var x = ((this.alignment == MultipleLabelAnchor.Alignment.Left) ? -1 : 1) * offset;
					p = this.labels[i].gameObject.transform.localPosition();
					this.labels[i].gameObject.transform.localPosition(x, p.y, p.z);
					offset += this.cachedLabelWidths[i] + this.spacing;
				}

				var size = offset - this.spacing;

				if (this.alignment == MultipleLabelAnchor.Alignment.Center)
				{
					var halfSize = size / 2;

					for (i = 0; i < this.labels.length; i++)
					{
						if (this.ignoreInactiveLabels && this.cachedActiveState[i] == false)
							continue;

						var xOffset = this.labels[i].gameObject.transform.localPosition().x - halfSize;
						p = this.labels[i].gameObject.transform.localPosition();
						this.labels[i].gameObject.transform.localPosition(xOffset, p.y, p.z);
					}
				}

				if (this.anyPivots)
				{
					for (i = 0; i < this.labels.length; i++)
					{
						if (this.ignoreInactiveLabels && this.cachedActiveState[i] == false)
							continue;

						if (this.alignment == MultipleLabelAnchor.Alignment.Center || this.alignment == MultipleLabelAnchor.Alignment.Right)
						{
							if (this.IsPivot(MultipleLabelAnchor.pivotCenter, this.labels[i].anchorX))
							{
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x + this.GetLabelWidth(this.labels[i]) * 0.5, p.y, p.z);
							}
							else if (this.IsPivot(MultipleLabelAnchor.pivotRight, this.labels[i].anchorX))
							{
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x + this.GetLabelWidth(this.labels[i]), p.y, p.z);
							}
						}
						else
						{
							if (this.IsPivot(MultipleLabelAnchor.pivotCenter, this.labels[i].anchorX))
							{
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x - this.GetLabelWidth(this.labels[i]) * 0.5, p.y, p.z);
							}
							else if (this.IsPivot(MultipleLabelAnchor.pivotLeft, this.labels[i].anchorX))
							{
								p = this.labels[i].gameObject.transform.localPosition();
								this.labels[i].gameObject.transform.localPosition(p.x - this.GetLabelWidth(this.labels[i]), p.y, p.z);
							}
						}
					}
				}

				if (this.maxWidth > 0 && size > this.maxWidth)
				{
					var scale = this.maxWidth / size;
					this.gameObject.transform.localScale(scale, this.scaleY ? scale : this.initialScale.y, this.initialScale.z);
				}
				else
				{
					this.gameObject.transform.localScale(this.initialScale);
				}

				this.width = size;
			}
		};

		MultipleLabelAnchor.prototype.GetLabelWidth = function(/**UILabel*/ label)
		{
			return this.ignoreLabelsScale ? label.GetWidth(): Math.round(label.GetWidth() * label.transform.localScale().x);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFRBWindowText",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		//FRB Windows
		var frbPathsDesktop = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/Texts/ManuallyCredited",
		];

		var frbPathsLandscape = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/Texts/ManuallyCredited",
		];

		var frbPathsPortrait = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/Texts/ManuallyCredited",
		];

		var frbPathsDesktopAutomatic = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/Texts/AutomaticPayout",
		];

		var frbPathsLandscapeAutomatic = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/Texts/AutomaticPayout",
		];

		var frbPathsPortraitAutomatic = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/Texts/AutomaticPayout",
		];

		var frbPathsMini = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/ManuallyCredited",
		];

		var frbPathsMiniAutomatic = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsFinishedWindow/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/TimedBonusRoundsFinishedWindow/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BoostBonusRoundsFinishedWindow/AutomaticPayout",
		];

		//Prize Won Windows
		var prizeWonDesktop = [
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/AG/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/BM/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/ManuallyCreditedFBF",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/ManuallyCreditedFRT",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Asia/Content/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/AG/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/BM/Texts/AutomaticPayout"
		];

		var prizeWonLandscape = [
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/AG/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/BM/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/ManuallyCreditedFBF",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/ManuallyCreditedFRT",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/AG/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/BM/Texts/AutomaticPayout"
		];

		var prizeWonPortrait = [
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/AG/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/BM/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/ManuallyCreditedFBF",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/ManuallyCreditedFRT",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Asia/Content/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/AG/Texts/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/BM/Texts/AutomaticPayout"
		];

		var prizeWonMini = [
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/AG/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/BM/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/FR/FRN/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/FR/FRT/ManuallyCreditedFRT",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/FR/FRF/ManuallyCreditedFBF",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Asia/Content/ManuallyCredited",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/AG/AutomaticPayout",
			"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/Content/Europe/Texts/BM/AutomaticPayout"
		];

		var activate = function(t, param)
		{
			if (IsRequired("MAC") || window["UHT_GAME_CONFIG_SRC"]["manualPayout"] != undefined)
			{
				if (t != null)
				{
					var targetComponent = t.GetComponentsInChildren(XTVariable2CAT, true);
					if (targetComponent.length > 0)
					{
						if (param == "")
						{
							if (targetComponent[0].notEquals.cat != null)
								targetComponent[0].notEquals.Start();
						}
						else
						{
							var willRunCat = IsRequired("MAC");
							var targetCATparent = targetComponent[0].equals;
							if (window["TournamentVars"] != undefined && window["TournamentVars"]["PrizeDropManuallyCredited_FR"] != undefined)
							{
								willRunCat = true;
								if (param == "MR")
									targetCATparent = XT.GetBool("PrizeDropManuallyCredited_FR") ? targetComponent[0].equals : targetComponent[0].notEquals;
								else if (param == "TM")
									targetCATparent = XT.GetBool("TournamentManuallyCredited_FR") ? targetComponent[0].equals : targetComponent[0].notEquals;
								else if (param == "BB")
									targetCATparent = targetComponent[0].notEquals;
							}
							if (willRunCat && targetCATparent.cat != null)
								targetCATparent.Start();
						}
					}
				}
			}
		}

		var activateAutomatic = function(t, param)
		{
			if (t != null)
			{
				if (param == "")
				{
					t.localScale(0,0,0);
				}
				else
				{
					t.localScale(1,1,1);
				}
			}
		}

		var activateMini = function(t, param)
		{
			if (t != null)
			{
				if (param == "")
				{
					t.gameObject.SetActive(false);
				}
				else
				{
					t.gameObject.SetActive(IsRequired('MAC'));
				}
			}
		}

		var activateMiniAutomatic = function(t, param)
		{
			if (t != null)
			{
				t.gameObject.SetActive(!IsRequired('MAC'));
				if (param == "")
				{
					t.localScale(0,0,0);
				}
				else
				{
					t.localScale(1,1,1);
				}
			}
		}

		var OnBonusPromoRoundType = function(param)
		{
			var root = globalRuntime.sceneRoots[1];
			if (!Globals.isMobile)
			{
				for (var i = 0; i < frbPathsDesktop.length; ++i)
				{
					var t = root.transform.Find(frbPathsDesktop[i]);
					activate(t, param);
				}

				for (var i = 0; i < frbPathsDesktopAutomatic.length; ++i)
				{
					var t = root.transform.Find(frbPathsDesktopAutomatic[i]);
					activateAutomatic(t, param);
				}
			}
			else
			{
				for (var i = 0; i < frbPathsLandscape.length; ++i)
				{
					var t = root.transform.Find(frbPathsLandscape[i]);
					activate(t, param);
				}

				for (var i = 0; i < frbPathsPortrait.length; ++i)
				{
					var t = root.transform.Find(frbPathsPortrait[i]);
					activate(t, param);
				}

				for (var i = 0; i < frbPathsLandscapeAutomatic.length; ++i)
				{
					var t = root.transform.Find(frbPathsLandscapeAutomatic[i]);
					activateAutomatic(t, param);
				}

				for (var i = 0; i < frbPathsPortraitAutomatic.length; ++i)
				{
					var t = root.transform.Find(frbPathsPortraitAutomatic[i]);
					activateAutomatic(t, param);
				}
			}

			if (Globals.isMini)
			{
				for (var i = 0; i < frbPathsMini.length; ++i)
				{
					var t = root.transform.Find(frbPathsMini[i]);
					activateMini(t, param);
				}

				for (var i = 0; i < frbPathsMiniAutomatic.length; ++i)
				{
					var t = root.transform.Find(frbPathsMiniAutomatic[i]);
					activateMiniAutomatic(t, param);
				}
			}
		};

		var OnXTGameInit = function()
		{
			if (IsRequired("NOMAC"))
			{
				var root = globalRuntime.sceneRoots[1];
				var allPaths = frbPathsDesktop.concat(
					frbPathsDesktopAutomatic,
					frbPathsLandscape,
					frbPathsPortrait,
					frbPathsLandscapeAutomatic,
					frbPathsPortraitAutomatic,
					frbPathsMini,
					frbPathsMiniAutomatic,
					prizeWonDesktop,
					prizeWonLandscape,
					prizeWonPortrait,
					prizeWonMini
				);

				for (var i = 0; i < allPaths.length; ++i)
				{
					var t = root.transform.Find(allPaths[i]);
					if (t != null)
					{
						var labels = t.GetComponentsInChildren(UILabel, true);
						for (var j = 0; j < labels.length; j++)
						{
							labels[j].text = "";
						}
					}
				}
			}
			else
				OnBonusPromoRoundType("");
		}
		if (!IsRequired("NOMAC"))
			XT.RegisterCallbackString(Vars.BonusRoundPromoType, OnBonusPromoRoundType, this);
		XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchInterfaceControllerChangeState",
	ready:function()
	{
		return (window["InterfaceController"] != undefined);
	},
	apply:function()
	{
		var oIC_CS = InterfaceController.prototype.ChangeState;
		InterfaceController.prototype.ChangeState = function(newState)
		{
			oIC_CS.apply(this, arguments);
			switch (newState)
			{
				case VSGameState.Result:
					this.CloseCurrentOpenedWindow();
					break;
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchReplayManagerLabel",
	ready:function()
	{
		return (window["ReplayManager"] != undefined);
	},
	apply:function()
	{
		var oRM_OGI = ReplayManager.prototype.OnGameInit;
		ReplayManager.prototype.OnGameInit = function()
		{
			oRM_OGI.apply(this, arguments);
			var widgetColorAnimators = this.GetComponentsInChildren(WidgetColorAnimator, true);
			for (var wIdx = 0; wIdx < widgetColorAnimators.length; wIdx++)
			{
				var labels = widgetColorAnimators[wIdx].targetWidgets;
				for (var lIdx = 0; lIdx < labels.length; lIdx++)
				{
					labels[lIdx].anchorX = 1;
					var pos = labels[lIdx].transform.localPosition();
					labels[lIdx].transform.localPosition(130, pos.y, pos.z);
					labels[lIdx].init(true);
				}
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchReplayDirector",
	ready:function()
	{
		return (window["ReplayDirector"] != undefined);
	},
	apply:function()
	{
		ReplayDirector.prototype.PatchButtonAutoClickers = function(/*number*/ delayMultiplier)
		{
			var hotKeyClicker = globalRuntime.sceneRoots[1].GetComponentsInChildren(HotKeyClicker, true);
			for (var i = 0; i < hotKeyClicker.length; i++)
			{
				if (hotKeyClicker[i].transform.parent.gameObject.name == "ReplayLBLSkipper")
					continue;

				if (hotKeyClicker[i].transform.GetComponentsInChildren(ButtonAutoClicker, true).length == 0)
					hotKeyClicker[i].gameObject.AddComponent("ButtonAutoClicker");

				var buttons = hotKeyClicker[i].transform.GetComponentsInChildren(ButtonAutoClicker, true);
				for (var j = 0; j < buttons.length; j++)
				{
					buttons[j].transform.GetComponentsInChildren(ButtonAutoClicker, true)[0].delay = 3;
					buttons[j].transform.GetComponentsInChildren(ButtonAutoClicker, true)[0].delayInAutoplay = 3;
				}
			}
			var clickers = globalRuntime.sceneRoots[1].GetComponentsInChildren(ButtonAutoClicker, true);
			for (var i = 0; i < clickers.length; i++)
			{
				clickers[i].delay =  clickers[i].delayInAutoplay * delayMultiplier;
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchLoadOperatorAdapter",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		var shouldLoad=false;
		var evalExp = null;
		var scriptName = null;
		
		var reqIT = IsRequired("OVRIT");
		if (reqIT != false)
			for (var i=0; i<reqIT.length; i++)
				UHT_GAME_CONFIG_SRC.integrationType = reqIT[i];		
		
		if (IsRequired("COI"))
		{
			var operatorList = ["PLAYTECH","SISAL"];
			var operatorPayloads = ['UHT_GAME_CONFIG_SRC["extend_events_listener"] = "window";','UHT_GAME_CONFIG_SRC["extend_events_listener"] = "window";'];
            var applyPayloadOnIOS = [false , false];
			var operatorIndex = operatorList.indexOf(UHT_GAME_CONFIG_SRC.integrationType);
			scriptName = UHT_GAME_CONFIG_SRC.integrationType;
			if (operatorIndex != -1)
			{
				shouldLoad = true;
                if (UHT_GAME_CONFIG_SRC["embeddedRemappedSymbol"] == undefined || (UHT_GAME_CONFIG_SRC["embeddedRemappedSymbol"] != undefined && applyPayloadOnIOS[operatorIndex]))
                    evalExp = operatorPayloads[operatorIndex];
			}

			if (UHT_GAME_CONFIG.STYLENAME.indexOf("ggn_") == 0)
			{
				scriptName = "GGNET";
				shouldLoad = true;
			}
		}
		
		if (IsRequired("KZING"))
		{
			scriptName = "KZING";
			shouldLoad = true;
			UHT_GAME_CONFIG_SRC["extend_events_listener"] = "window";
			var timeoutPatchUHTIB = null;
			function PatchUHTIB()
			{
				if (window["UHTInterfaceBOSS"] == undefined)
				{
					timeoutPatchUHTIB = setTimeout(PatchUHTIB, 100);
					return;
				}
				UHTInterfaceBOSS.listener = window;
			}
			PatchUHTIB();
		}
			
		if (shouldLoad)
		{
			if (evalExp != null)
				eval(evalExp);
			
			var path = "";
			if (UHT_GAME_CONFIG_SRC.embeddedRemappedSymbol)
			{
				path=UHT_CONFIG.GAME_URL;
			}
			else
			{
				var split = UHT_CONFIG.GAME_URL.split("/");
				split.splice(split.indexOf(UHT_GAME_CONFIG.GAME_SYMBOL) - 2);
				path = split.join("/") + "/";
			}
			path += scriptName + ".js";

			var retryCounter = 0;
			var successCallback = function()
			{
				loadingComplete = true;
				if(window["onClientLoaded"] != undefined && savedText != "")
					onClientLoaded(savedText);
			};

			var errorCallback = function()
			{
				document.getElementsByTagName("HEAD")[0].removeChild(script);
				if (retryCounter < 5)
				{
					retryCounter++;
					setTimeout(function(){script = loadScript(path, successCallback, errorCallback);}, 2000);
				}
			};

			var loadScript = function(url, loadCallback, errorCallback)
			{
				var script = document.createElement("script");
				script.src = url;

				if(loadCallback != undefined)
					script.onload = loadCallback;

				if(errorCallback != undefined)
				{
					script.onabort = errorCallback;
					script.onerror = errorCallback;
				}

				document.getElementsByTagName("HEAD")[0].appendChild(script);

				return script;
			}

			var loadingComplete = false;
			var savedText = "";
			UHTPatch({
				name: "PatchOnClientLoaded",
				ready:function()
				{
					return (window["onClientLoaded"] != undefined);
				},
				apply:function()
				{
					var oCL = onClientLoaded;
					onClientLoaded = function(text)
					{
						savedText = text;
						if (loadingComplete)
							oCL.apply(this, arguments)
					}
				},
				retry:function()
				{
					return (window["Renderer"] == undefined);
				},
				interval: 10
			});
			var script = loadScript(path, successCallback, errorCallback);
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchTournamentPointsNotificationReplayAndDisable",
	ready:function()
	{
		return (window["TournamentPointsNotification"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOTPN"))
			TournamentPointsNotification.prototype.GenerateNotificationMessage = function(){};

		var oTPN_XTRC = TournamentPointsNotification.prototype.XTRegisterCallbacks;
		TournamentPointsNotification.prototype.XTRegisterCallbacks = function()
		{
			if (ServerOptions.isReplay)
				return;
			oTPN_XTRC.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTournamentButton",
	ready:function()
	{
		return window["TournamentButton"] != undefined;
	},
	apply:function()
	{
		var oTB_A = TournamentButton.prototype.Awake;
		TournamentButton.prototype.Awake = function()
		{
			if (this.IDNCSM != null)
			{
				var sprites = this.IDNCSM.GetComponentsInChildren(UISprite, true);
				for (var i = 0; i < sprites.length; i++)
					if (sprites[i].spriteName == "IDNCSM_lobby")
						sprites[i].spriteName = "IDNSM_lobby";
			}
			oTB_A.apply(this, arguments);
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchMouseWheelScrolling",
	ready:function()
	{
		return (window["CustomDragObject"] != undefined);
	},
	apply:function()
	{
		CustomDragObject.prototype.OnMouseWheel = function(e)
		{
			if (this.gameObject.activeInHierarchy && this.useScrollWheel)
				e.preventDefault();
			if (!this.gameObject.activeInHierarchy || !this.isHover || Globals.InputBlocked && !(this.cachedCamera != null && this.cachedCamera.ignoreInputBlocked))
				return;
			this.wheelDirection = e.wheelDelta ? -e.wheelDelta : e.detail;
			this.wheelDirection = UHTMath.clamp(this.wheelDirection, -1, 1)
		};
		ScrollableList.prototype.OnMouseWheel = function(e)
		{
			if (!this.isEnabled || !this.wasHover || Globals.InputBlocked && !(this.cachedCamera != null && this.cachedCamera.ignoreInputBlocked))
				return;
			e.preventDefault();
			this.wheelDelta = e.wheelDelta ? -e.wheelDelta : e.detail;
			this.wheelDelta = UHTMath.clamp(this.wheelDelta, -1, 1);
			this.scrollDelta = 0
		};
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTBeautifyAmount = function(value) // 198.84 -> 190
{
	var closest = 0.01;
	if (value < 0.1)
		closest = 0.01;
	else if (value < 1)
		closest = 0.1;
	else if (value < 10)
		closest = 1;
	else
		closest = Math.pow(10,Math.floor(Math.log10(value))) * 100 / 1000
	return Math.floor (value/closest) * 1000 * closest / 1000;
}

UHTPatch({
	name: "PatchConvertDynamicFields",
	ready:function()
	{
		return (window["PromotionsHelper"] != undefined);
	},
	apply:function()
	{
		var oPHCDF = PromotionsHelper.ConvertDynamicFields;
		PromotionsHelper.ConvertDynamicFields = function()
		{
			var details = arguments[0];
			if (details != null)
			{
				for (var dfName in details.dynamicFieldMap)
				{
					var dfi = details.dynamicFieldMap[dfName];
					var dfValue = dfi.defaultValue;
					if (dfi.valueMap[ServerOptions.currency] == undefined)
						if (dfi.valueMap[ServerOptions.realCurrency] != undefined)
							dfi.valueMap[ServerOptions.currency] = dfi.valueMap[ServerOptions.realCurrency]
				}

				if (details.prizePool.prizesList == null)
					details.prizePool.prizesList = [];
				
				
				var highestPrize = "";
				if (details.prizePool.prizesList != null && details.prizePool.prizesList.length > 0 && details.prizePool.prizesList[0].type == TournamentProtocol.PrizeType.Amount)
					highestPrize = LocaleManager.FormatValueWithCustomCurrency(UHTBeautifyAmount(details.prizePool.prizesList[0].amount), details.prizePool.currency);

				details.htmlRules = details.htmlRules.replace(/~highestPrizeBeautified/g, highestPrize);
				details.shortHtmlRules = details.shortHtmlRules.replace(/~highestPrizeBeautified/g, highestPrize);

				var totalPrizeAmount = "";
				if (details.prizePool.totalPrizeAmount > 0)
					totalPrizeAmount = LocaleManager.FormatValueWithCustomCurrency(UHTBeautifyAmount(details.prizePool.totalPrizeAmount), ServerOptions.currency);

				details.htmlRules = details.htmlRules.replace(/~totalPrizeAmountBeautified/g, totalPrizeAmount);
				details.shortHtmlRules = details.shortHtmlRules.replace(/~totalPrizeAmountBeautified/g, totalPrizeAmount);

				for (var dfName in details.dynamicFieldMap)
				{
					var dfi = details.dynamicFieldMap[dfName];
					var dfValue = dfi.defaultValue;
					if (dfi.valueMap[ServerOptions.realCurrency] != undefined)
					{
						var val = _number.otod(dfi.valueMap[ServerOptions.realCurrency]);
						dfValue = LocaleManager.FormatValueWithCustomCurrency(UHTBeautifyAmount(val), ServerOptions.currency);
					}

					details.htmlRules = details.htmlRules.replace(new RegExp('~'+dfName+'Beautified', 'g'), dfValue);
					details.shortHtmlRules = details.shortHtmlRules.replace(new RegExp('~'+dfName+'Beautified', 'g'), dfValue);
				}

			}
				
			oPHCDF.apply(this, arguments);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLoseStreakText",
	ready:function()
	{
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
		for (var i = 0; i < labels.length; i++)
		{
			if (labels[i].text == "You gained {0} points for a lose streak")
				labels[i].text = "You gained {0} points for consecutive spins without any win";
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

var SOCE_replacements =
[
	{src:"malfunction voids all pays and plays", dst:"malfunction voids all spins and plays"},
	{src:"win feature", dst:"play feature"},
	{src:"pay out", dst:"award"},
	{src:"paid out", dst:"awarded"},
	{src:"pays out", dst:"awards"},
	{src:"betting", dst:"spinning"},
	{src:"by paying", dst:"by playing"},
	{src:"paying", dst:"winning"},
	{src:"total bet", dst:"spin"},
	{src:"bet", dst:"spin", wordonly:true},
	{src:"bets", dst:"spins"},
	{src:"you will need to visit the cashier and add funds to your account", dst: "YOU NEED MORE COINS"},
	{src:"cash", dst:"coins"},
	{src:"payer", dst:"winner"},
	{src:"pay", dst:"win"},
	{src:"pays", dst:"wins"},
	{src:"paid", dst:"won"},
	{src:"money", dst:"coin"},
	{src:"buy", dst:"play"},
	{src:"bought", dst:"instantly triggered"},
	{src:"purchase", dst:"play"},
	{src:"at the cost of", dst:"for"},
	{src:"rebet", dst:"respin"},
	{src:"cost of", dst:"can be played for"},
];


UHTPatch({
	name: "PatchTableGamesRulesSOCE",
	ready:function()
	{
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("SOCE") && (UHT_CONFIG.LANGUAGE == "en"))
		{
			if (IsRequired("SOCE_V1"))
			{
				SOCE_replacements.push({src:"credited", dst:"added"});
				SOCE_replacements.push({src:"credits", dst:"coins"});
				SOCE_replacements.push({src:"credit", dst:"coins"});
			}
			if (IsRequired("SOCE_V2"))
			{
				SOCE_replacements.push({src:"gambled", dst:"chanced"});
				SOCE_replacements.push({src:"gamble", dst:"take a chance"});
				SOCE_replacements.push({src:"gambling", dst:"taking a chance"});
			}
			if (IsRequired("SOCE_V5"))
			{
				SOCE_replacements.splice(0,0,
					{src:"to place this bet, you will need to visit the cashier and add funds to your account", dst: "Insufficient coins to place the spin"},
					{src:"insufficient funds to place this bet.", dst: " "},
					{src:"please fund your account or lower the bet level.", dst: "Insufficient coins to place the spin"}
				);
				SOCE_replacements.push({src:"please fund your account", dst:"please buy more coins"});
				SOCE_replacements.push({src:"funds", dst:"coins"});
			}
			if (IsRequired("SOCE_V6"))
			{
				SOCE_replacements.splice(0,0,{src:"ante bet", dst:"higher chance spin"});
			}
			if (IsRequired("SOCE_V7"))
			{
				SOCE_replacements.splice(1,0,{src:"pay", dst:"play"});
				SOCE_replacements.push({src:"slot machine", dst:"video slot"});
			}

			TableGamesOnTouchEnd = function()
			{
				if (this.gameObject.activeInHierarchy)
				{
					var mask = new LayerMask();
					mask.mask = 1 << this.gameObject.layer;

					if (this.cachedCamera == null)
						this.cachedCamera = Globals.GetCameraForObject(this.gameObject);

					var c = globalColliderInputManager.getHoveredCollider(this.cachedCamera.ScreenToWorldPoint(Input.mousePosition), mask);
					if(!this.wasTouchMove && (c == this.gameObject.collider))
					{
						var url = UHT_CONFIG.GAME_URL + "extra/rules_" + ServerOptions.language + ".htm";
						var name = url.replace(/\//g, "_");

						var fo = new FormatOptions();
						fo.hasCurrency = true;
						var minValue = LocaleManager.FormatValue(XT.GetDouble(TGVars.MinBet), fo);
						var maxValue = LocaleManager.FormatValue(XT.GetDouble(TGVars.MaxBet), fo);
						var data = window.btoa(encodeURIComponent(minValue + "&" + maxValue))
						url += "?" + data;

						new ResourceRequest({
							url: url,
							complete: new EventHandler(null, function(/**ResourceRequest*/ request, /**string*/ unused)
							{
								var document = new DOMParser().parseFromString(request.Data, "text/html");
								var node, nodes = [], walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
								while (node = walker.nextNode()) nodes.push(node);

								for (var i = 0; i < SOCE_replacements.length; i++)
								{
									var soce = SOCE_replacements[i];
									var p = soce.wordonly?"\\b":"";
									var s = soce.wordonly?"\\b":"";
									for (var j = 0; j < nodes.length; j++)
									{
										//CamelCase
										var src = soce.src.split('');
										src[0] = src[0].toUpperCase();
										src = src.join('');
										var dst = soce.dst.split('');
										dst[0] = dst[0].toUpperCase();
										dst = dst.join('');
										nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p+src+s, 'g'), dst);
										//UPPER
										nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p+soce.src.toUpperCase()+s, 'g'), soce.dst.toUpperCase());
										//lower
										nodes[j].nodeValue = nodes[j].nodeValue.replace(new RegExp(p+soce.src+s, 'g'), soce.dst);
									}
								}

								var minBetValueContainer = document.getElementById("minBetValue");
								if (minBetValueContainer != null)minBetValueContainer.innerText = minValue;
								var maxBetValueContainer = document.getElementById("maxBetValue");
								if (maxBetValueContainer != null)maxBetValueContainer.innerText = maxValue;

								var wnd = window.open("", name);
								if (wnd)
								{
									wnd.document.write(document.documentElement.outerHTML);
									wnd.focus();
								}
							})});
					}
				}
			}
			//Blackjack and Baccarat
			if (window["BJRulesButton"] != undefined)
				BJRulesButton.prototype.OnTouchEnd = TableGamesOnTouchEnd;
			
			//Roulette
			if (window["RlRulesButton"] != undefined)
				RlRulesButton.prototype.OnTouchEnd = TableGamesOnTouchEnd;
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});


UHTPatch({
	name: "PatchUILabelText",
	ready:function()
	{
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (IsRequired("SOCE") && (UHT_CONFIG.LANGUAGE == "en"))
		{
			if (IsRequired("SOCE_V1"))
			{
				SOCE_replacements.push({src:"credited", dst:"added"});
				SOCE_replacements.push({src:"credits", dst:"coins"});
				SOCE_replacements.push({src:"credit", dst:"coins"});
			}
			if (IsRequired("SOCE_V2") || IsRequired("SOCE_V2X"))
			{
				if (IsRequired("SOCE_V2X"))
					SOCE_replacements = [];
				SOCE_replacements.push({src:"gambled", dst:"chanced"});
				SOCE_replacements.push({src:"gamble", dst:"take a chance"});
				SOCE_replacements.push({src:"gambling", dst:"taking a chance"});
			}
			if (IsRequired("SOCE_V3X"))
			{
				SOCE_replacements = [];
				SOCE_replacements.push({src:"slots", dst:"SpinaZonke"});
			}
			if (IsRequired("SOCE_V4X"))
			{
				SOCE_replacements = [];
				SOCE_replacements.push({src:"slots", dst:"SpinaWina"});
			}
			if (IsRequired("SOCE_V5"))
			{
				SOCE_replacements.splice(0,0,
					{src:"to place this bet, you will need to visit the cashier and add funds to your account", dst: "Insufficient coins to place the spin"},
					{src:"insufficient funds to place this bet.", dst: " "},
					{src:"please fund your account or lower the bet level.", dst: "Insufficient coins to place the spin"}
				);
				SOCE_replacements.push({src:"please fund your account", dst:"please buy more coins"});
				SOCE_replacements.push({src:"funds", dst:"coins"});
			}
			if (IsRequired("SOCE_V6"))
			{
				SOCE_replacements.splice(0,0,{src:"ante bet", dst:"higher chance spin"});
			}
			if (IsRequired("SOCE_V7"))
			{
				SOCE_replacements.splice(1,0,{src:"pay", dst:"play"});
				SOCE_replacements.push({src:"slot machine", dst:"video slot"});
			}
			if (IsRequired("SOCE_V8"))
			{
				SOCE_replacements.splice(1,0,
					{src:"paying symbols", dst:"symbols"},
					{src:"paying", dst:"purchasing"},
					{src:" pay ", dst:" tmp01 ", wordonly:true},
					{src:"pay", dst:"tmp00", wordonly:true},
					{src:"tmp01", dst:"pay", wordonly:true}
				);
				
				SOCE_replacements.push({src:"tmp00", dst:"purchase"});
			}

			if (IsRequired("SOCE_V8P"))
			{
				SOCE_replacements.splice(1,0,
					{src:"paying symbols", dst:"symbols"},
					{src:"paying", dst:"playing"},
					{src:" pay ", dst:" tmp01 ", wordonly:true},
					{src:"pay", dst:"tmp00", wordonly:true},
					{src:"tmp01", dst:"pay", wordonly:true}
				);
				
				SOCE_replacements.push({src:"tmp00", dst:"play"});
				SOCE_replacements.push({src:"slot machine", dst:"video slot"});
			}

			var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
			for (var i = 0; i < SOCE_replacements.length; i++)
			{
				var soce = SOCE_replacements[i];
				var p = soce.wordonly?"\\b":"";
				var s = soce.wordonly?"\\b":"";
				for (var j = 0; j < labels.length; j++)
				{
					//CamelCase
					var src = soce.src.split('');
					src[0] = src[0].toUpperCase();
					src = src.join('');
					var dst = soce.dst.split('');
					dst[0] = dst[0].toUpperCase();
					dst = dst.join('');
					labels[j].text = labels[j].text.replace(new RegExp("(?<!<)"+p+src+s, 'g'), dst);
					//UPPER
					labels[j].text = labels[j].text.replace(new RegExp("(?<!<)"+p+soce.src.toUpperCase()+s, 'g'), soce.dst.toUpperCase());
					//lower
					labels[j].text = labels[j].text.replace(new RegExp("(?<!<)"+p+soce.src+s, 'g'), soce.dst);
				}
				var smlt = SystemMessageManager.localizedTexts;
				for (var lt in smlt)
				{
					//CamelCase
					var src = soce.src.split('');
					src[0] = src[0].toUpperCase();
					src = src.join('');
					var dst = soce.dst.split('');
					dst[0] = dst[0].toUpperCase();
					dst = dst.join('');
					smlt[lt] = smlt[lt].replace(new RegExp(p+src+s, 'g'), dst);
					//UPPER
					smlt[lt] = smlt[lt].replace(new RegExp(p+soce.src.toUpperCase()+s, 'g'), soce.dst.toUpperCase());
					//lower
					smlt[lt] = smlt[lt].replace(new RegExp(p+soce.src+s, 'g'), soce.dst);
				}

				if (window["GUIMessageBase"] != undefined)
				{
					var gmb = globalRuntime.sceneRoots[1].GetComponentsInChildren(GUIMessageBase, true);
					if (gmb.length > 0)
					{
						for (var gmbIndex = 0; gmbIndex < gmb.length; gmbIndex++)
						{
							if (gmb[gmbIndex].messages != null)
							{
								for (var mIndex = 0; mIndex < gmb[gmbIndex].messages.length; mIndex++)
								{
									//CamelCase
									var src = soce.src.split('');
									src[0] = src[0].toUpperCase();
									src = src.join('');
									var dst = soce.dst.split('');
									dst[0] = dst[0].toUpperCase();
									dst = dst.join('');
									gmb[gmbIndex].messages[mIndex] = gmb[gmbIndex].messages[mIndex].replace(new RegExp(p+src+s, 'g'), dst);
									//UPPER
									gmb[gmbIndex].messages[mIndex] = gmb[gmbIndex].messages[mIndex].replace(new RegExp(p+soce.src.toUpperCase()+s, 'g'), soce.dst.toUpperCase());
									//lower
									gmb[gmbIndex].messages[mIndex] = gmb[gmbIndex].messages[mIndex].replace(new RegExp(p+soce.src+s, 'g'), soce.dst);
								}
							}
						}
					}
				}
			}

			var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
			if (paytable.length > 0 && !IsRequired("SOCE_V3X") && !IsRequired("SOCE_V4X"))
			{
				paytable = paytable[0];
				var targetTransform = paytable.transform.Find("Pages/Common_Info1/HowToPlay/Rules/Top/SpriteHolder/Rule1SpritePlus");
				if (targetTransform != null)
					targetTransform.localPosition(-345, -9.75, 0);

				targetTransform = paytable.transform.Find("Pages/Common_Info1/HowToPlay/Rules/Top/SpriteHolder/Rule1SpriteMinus");
				if (targetTransform != null)
					targetTransform.localPosition(-250, -9.75, 0);

				targetTransform = paytable.transform.Find("Pages/Common_Info1/MainGameInterface/Rules/Rule5/SpritesHolder/SpritePlus");
				if (targetTransform != null)
					targetTransform.localPosition(-570, -13, 0);

				targetTransform = paytable.transform.Find("Pages/Common_Info1/MainGameInterface/Rules/Rule5/SpritesHolder/SpriteMinus");
				if (targetTransform != null)
					targetTransform.localPosition(-440, -13, 0);
			}

			var paytableMobile = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
			if (paytableMobile.length > 0 && !IsRequired("SOCE_V3X") && !IsRequired("SOCE_V4X"))
			{
				paytableMobile = paytableMobile[0];
				var targetTransform = paytableMobile.transform.Find("Paytable_landscape/Common_Info1/Content/RealContent/HowToPlay/Rules/Rule1/SpriteHolder/Rule1SpritePlus");
				if (targetTransform != null)
					targetTransform.localPosition(62, -55.4, 0);

				targetTransform = paytableMobile.transform.Find("Paytable_landscape/Common_Info1/Content/RealContent/HowToPlay/Rules/Rule1/SpriteHolder/Rule1SpriteMinus");
				if (targetTransform != null)
					targetTransform.localPosition(185, -55.4, 0);

				targetTransform = paytableMobile.transform.Find("Paytable_landscape/Common_Info1/Content/RealContent/HowToPlay/Rules/Rule1/SpriteHolder/Rule1MobileBetIcon");
				if (targetTransform != null)
					targetTransform.localPosition(-398, -10, 0);
			}
			
			if (window["BJSoundLogic"] != undefined)
			{
				var bjsla = globalRuntime.sceneRoots[1].GetComponentsInChildren(BJSoundLogic, true);
				if (bjsla.length>0)
				{
					bjsl = bjsla[0];
					
					bjsl.clipPlaceYourBets.clipMale.clipNormal = null;
					bjsl.clipPlaceYourBets.clipMale.clipFast = null;
					bjsl.clipPlaceYourBets.clipMale.clipInstant = null;
					
					bjsl.clipPlaceYourBets.clipFemale.clipNormal = null;
					bjsl.clipPlaceYourBets.clipFemale.clipFast = null;
					bjsl.clipPlaceYourBets.clipFemale.clipInstant = null;
				}
			}
			
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchSocialUILabelText",
	ready:function()
	{
		return (window["UILabel"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (IsRequired("SOC"))
		{
			var SOC_replacements =
			{
				de: [
					{src:"um zwischen der ansicht\nder geld-", dst:"um zwischen\nder chips-"},
					{src:"geld", dst:"chips", wordonly:true},
					{src:"cash", dst:"chips"},
					{src:"geld", dst:"chips"},
				]
			};

			if (SOC_replacements[UHT_GAME_CONFIG_SRC.lang] != undefined)
			{
				var replacements = SOC_replacements[UHT_GAME_CONFIG_SRC.lang];
				var OnXTGameInit = function()
				{
					var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
					for (var i = 0; i < replacements.length; i++)
					{
						var soc = replacements[i];
						var p = soc.wordonly?"\\b":"";
						var s = soc.wordonly?"\\b":"";
						for (var j = 0; j < labels.length; j++)
						{
							//CamelCase
							var src = soc.src.split('');
							src[0] = src[0].toUpperCase();
							src = src.join('');
							var dst = soc.dst.split('');
							dst[0] = dst[0].toUpperCase();
							dst = dst.join('');
							labels[j].text = labels[j].text.replace(new RegExp(p+src+s, 'g'), dst);
							//UPPER
							labels[j].text = labels[j].text.replace(new RegExp(p+soc.src.toUpperCase()+s, 'g'), soc.dst.toUpperCase());
							//lower
							labels[j].text = labels[j].text.replace(new RegExp(p+soc.src+s, 'g'), soc.dst);
						}
					}
				}
				XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this);
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "Patch_Wurfl_VS_UAP",
	ready:function()
	{
		return (window["globalTracking"] != undefined);
	},
	apply:function()
	{
		if (window['WURFL'] != null && window["UHT_UA_INFO"] != null)
		{
			var device = UHT_UA_INFO.device;
			var mobile = device.type == "mobile" || device.type == "tablet";
			var UAPARSER_INFO =
			{
				MOBILE: mobile,
				DESKTOP: !mobile
			};

			var same = (UHT_DEVICE_TYPE.MOBILE == UAPARSER_INFO.MOBILE) && (UHT_DEVICE_TYPE.DESKTOP == UAPARSER_INFO.DESKTOP);
			globalTracking.SendEvent("DeviceInfo", same ? "_same_" : "_different_", 1, "RatingTracker");
			if (!same)
			{
				var stringToSend = "W_" + (UHT_DEVICE_TYPE.MOBILE?"mobile":"desktop") + "__UAP_" + (UAPARSER_INFO.MOBILE?"mobile":"desktop");
				globalTracking.SendEvent("DeviceInfoDiff", stringToSend, 1, "RatingTracker");
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchTournamentsManager",
	ready:function()
	{
		return (window["TournamentsManager"] != undefined);
	},
	apply:function()
	{
		TournamentsManager.prototype.ShowTournaments = function()
		{
			if (!this.isEnabled)
				return;

			if (!this.isVisible)
			{
				var rankUID = XT.GetString(TournamentVars.RankPromotionID);
				var rankType = PromotionsHelper.GetPromotionType(rankUID);
				var menuType = XT.GetInt(TournamentVars.MenuPromotionType);
				var canSetUID = (menuType == TournamentProtocol.PromoType.Invalid || menuType == rankType) && TournamentsManager.showTournamentsFrame != Time.frameCount && !_string.IsNullOrEmpty(rankUID);
				TournamentsManager.showTournamentsFrame = Time.frameCount;

				XT.SetInt(TournamentVars.MenuPromotionType, TournamentProtocol.PromoType.Invalid);
				if (canSetUID && XT.GetString(TournamentVars.SelectedTournamentID) != rankUID)
					XT.SetString(TournamentVars.SelectedTournamentID, rankUID);

				XT.TriggerEvent(TournamentVars.Evt_Internal_PromotionsOpen);
				this.isVisible = true;
				this.StopRunningEvents();

				var cat = this.catShowTournaments;
				if (this.showOnlyDetailsIfOneTournament && this.visibleTournamentsCount == 1)
					cat = this.catShowTournamentDetails;

				cat.Start();

				if (TournamentsManager.updateDefaultView)
				{
					TournamentsManager.updateDefaultView = false;

					if (this.useDefaultViewCats)
					{
						cat = this.visibleTournamentsCount == 1 ? this.catDefaultViewSingle : this.catDefaultViewMultiple;
						cat.Start();

						var type = PromotionsHelper.GetPromotionType(XT.GetString(TournamentVars.SelectedTournamentID));
						var idx = this.defaultViewType.indexOf(type);

						if (idx > -1)
							this.catDefaultViewByType[idx].Start();
					}
				}
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchItsNotASlot",
	ready:function()
	{
		return (window["UHTEngine"] != undefined);
	},
	apply:function()
	{
		var accpyt = IsRequired("ACCPYT");
		var accpyt_odds = IsRequired("ACCPYT_ODDS");
		if (accpyt || accpyt_odds)
		{
			if (UHT_GAME_CONFIG != undefined && UHT_GAME_CONFIG.GAME_SYMBOL != undefined && UHT_GAME_CONFIG.GAME_SYMBOL.substr(0, 2) != "vs" && UHT_GAME_CONFIG.GAME_SYMBOL.substr(0, 2) != "sc")
				return;

			var container = document.createElement("div");
			container.style.position = "absolute";
			container.style.width = "100%";
			container.style.height = "100%";
			container.style.backgroundColor = "black";
			container.style.top = "0";
			container.style.left = "0";
			container.style.zIndex = "100";
			container.style.fontFamily = "'Roboto Condensed', sans-serif";
			container.id = "notaslot";

			var center = document.createElement("center");
			center.style.height = "90%"
			var title = document.createElement("h1");
			title.style.color = "white";
			title.style.fontSize = "5vh";
			title.textContent = "Bet - Symbol Prediction";

			var img = document.createElement("img");
			if (accpyt_odds)
				img.src = "/gs2c/lobby/icons/_splash/odds/" + UHT_GAME_CONFIG.GAME_SYMBOL + ".jpg";
			else
				img.src = "/gs2c/lobby/icons/_splash/" + UHT_GAME_CONFIG.GAME_SYMBOL + ".jpg";
			img.id = "image";
			img.style.maxWidth = "100%";
			img.style.maxHeight = "100%";

			var footer = document.createElement("div");
			footer.style.height = "15%";
			footer.style.width = "100%";
			footer.style.background = "black";
			footer.id = "footerContainer";

			var footerTitle  = document.createElement("h2");
			footerTitle.style.color = "white";
			footerTitle.style.fontSize = "3vh";
			footerTitle.textContent = "Symbols predicted must result and display as per the dedicated paylines (if applicable) of the events in your game session.";

			var button = document.createElement("button");
			button.style.backgroundColor = "#4CAF50";
			button.style.border = "none";
			button.style.color = "white";
			button.style.padding = "15px 32px";
			button.style.textAlign = "center";
			button.style.textDecoration = "none";
			button.style.display = "inline-block";
			button.style.fontSize = "2vh";
			button.textContent = "I Accept";
			button.onclick = function()
			{
				container.remove();
			};
			var topContainer = document.createElement("div");
			topContainer.style.height = "15%";
			topContainer.id = "topContainer";
			var centerContainer = document.createElement("div");
			centerContainer.style.height = "60%";
			centerContainer.id = "centerContainer";

			footer.appendChild(footerTitle);
			footer.appendChild(button);
			topContainer.appendChild(title);
			center.appendChild(topContainer);
			centerContainer.appendChild(img);
			center.appendChild(centerContainer);
			center.appendChild(footer);
			container.appendChild(center);

			var oUHTE_SLIH = UHTEngine.SignalLoaderIsHidden;
			UHTEngine.SignalLoaderIsHidden = function()
			{
				oUHTE_SLIH.apply(this, arguments);
				document.body.appendChild(container);
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchNetPosition",
	ready:function()
	{
		return (window["NetPositionFOX"] != undefined);
	},
	apply:function()
	{
		var purchaseCosts = [];
		NetPositionFOX.costForJPBalanceUpdate = -1;
		if (window["EventManager"])
		{
			var HandleServerRequest = function(request)
			{
				if (request.Fields["action"] != undefined && request.Fields["action"] == "doSpin")
				{
					var purchaseIndex = -1;
					if (request.Fields[GameProtocolDictionary.FreeSpinsPurchase.optionIndex] != null)
						purchaseIndex = parseInt(request.Fields[GameProtocolDictionary.FreeSpinsPurchase.optionIndex]);

					if (request.Fields[GameProtocolDictionary.FeaturePurchaseParam] != undefined)
						purchaseIndex = parseInt(request.Fields[GameProtocolDictionary.FeaturePurchaseParam]);

					if (purchaseIndex > -1 && (purchaseIndex < purchaseCosts.length))
					{
						var fCost = purchaseCosts[purchaseIndex] * CoinManager.GetNextBet();
						NetPositionFOX.costForJPBalanceUpdate = fCost;
						var npfa=globalRuntime.sceneRoots[1].GetComponentsInChildren(NetPositionFOX, true);
						for (var i=0; i<npfa.length; i++)
							npfa[i].featureCost = fCost;
					}
				}
			};
			EventManager.AddHandler(AdapterEvents.evtServerRequest, HandleServerRequest, this);
		}

		NetPositionFOX.prototype.XTRegisterCallbacks = function()
		{
			this.featureCost = 0;
			this.priority = 69;
			FOXLink.prototype.XTRegisterCallbacks.call(this);
			XT.RegisterCallbackEvent(Vars.Evt_DataToCode_CollectJackpotPressed, this.OnCollectJackpotPressed, this);
		}

		NetPositionFOX.prototype.HandleInitResponse = function(param)
		{
			var fspc = VSProtocolParser.ParseFSPurchaseConfig(param);
			if (fspc != null)
			{
				if (fspc.purchaseOptions != null)
				{
					for (var i = 0; i < fspc.purchaseOptions.length; i++)
					{
						purchaseCosts.push(fspc.purchaseOptions[i].bet);
					}
				}
			}

			if (param["purInit"] != undefined)
			{
				var purInit = [];
				try
				{
					purInit = eval(param.purInit);
				}
				catch(err) {}

				if (purInit.length > 0)
				{
					for (var i = 0; i < purInit.length; i++)
					{
						purchaseCosts.push(purInit[i].bet);
					}
				}
			}
			
			this.oRespinData = XT.GetObject(Vars.RespinData);
			this.netPositionLabel.text = LocaleManager.FormatValue(this.currentNetPosition, this.formatOptions);
		};

		NetPositionFOX.prototype.HandleCollectResponse = function(/**Object*/ dict)
		{
			this.ignoreFirstTumble = true;
			this.oRespinData = null;
			this.currentNetPosition += this.lastTotalWin;
		};

		NetPositionFOX.prototype.SpinIsFree = function(/**Object*/ dict)
		{
			if (XT.GetBool(Vars.Logic_IsFreeSpin))
				return true;

			if (XT.GetBool(Vars.IsDifferentSpinType))
			{
				if (this.ignoreFirstTumble)
					this.ignoreFirstTumble = false;
				else
					return true;
			}

			var respinData = XT.GetObject(Vars.RespinData);
			var isRespin = respinData != null;
			var isFreeRespin = isRespin && !(this.oRespinData == null || this.oRespinData.IsDone);
			
			this.oRespinData = XT.GetObject(Vars.RespinData);
			
			if (isFreeRespin)
			{
				return true;
			}

			if (dict["tmb_res"] != undefined)
				return true;
			if (dict["rs_t"] != undefined && dict["na"] != undefined && dict["na"] == "c")
				return true;

			return false;
		}

		NetPositionFOX.prototype.DeductBet = function(/**Object*/ dict)
		{
			var lines = -1;
			var coin = -1;
			if (dict[GameProtocolDictionary.line] != undefined)
				lines = _number.otoi(dict[GameProtocolDictionary.line]);
			else
				lines = XT.GetInt(Vars.BetToTotalBetMultiplier);

			if (dict[GameProtocolDictionary.coin] != undefined)
				coin = _number.otod(dict[GameProtocolDictionary.coin]);

			if (coin != -1 && lines != -1 && dict[GameProtocolDictionary.FreeRound.TotalWin] == undefined)
			{
				if (this.featureCost > 0)
				{
					this.currentNetPosition -= this.featureCost;
					this.featureCost = 0;
				}
				else if (dict["sor_coef"] != undefined)
				{
					this.currentNetPosition -= _number.otod(dict["sor_coef"]);
				}
				else
					this.currentNetPosition -= (coin * lines);
			}

			this.OnUpdateDisplayedWin();
		}

		NetPositionFOX.prototype.AddWin = function(/**Object*/ dict)
		{
			if (dict[GameProtocolDictionary.NextActions.nextAction] != undefined && dict[GameProtocolDictionary.NextActions.nextAction].indexOf(GameProtocolDictionary.NextActions.Collect) >= 0)
			{
				this.currentNetPosition += this.lastTotalWin;
				this.lastTotalWin = 0;
			}
		}

		NetPositionFOX.prototype.OnCollectJackpotPressed = function()
		{
			if (!NetPositionFOX.isInit)
				this.currentNetPosition += XT.GetDouble(Vars.FromServer_JackpotAmountWon);
		}
		NetPositionFOX.isInit = true;
		NetPositionFOX.prototype.HandleSpinResponse = function(/**Object*/ dict)
		{
			NetPositionFOX.isInit = false;
			if (dict[GameProtocolDictionary.spinCycleWin] != undefined)
				this.lastTotalWin = _number.otod(dict[GameProtocolDictionary.spinCycleWin]);

			if (!this.SpinIsFree(dict)) 
				this.DeductBet(dict);

			this.AddWin(dict);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchJurisdictionSessionUptime",
	ready:function()
	{
		return (window["JurisdictionSessionUptime"] != undefined);
	},
	apply:function()
	{
		JurisdictionSessionUptime.prototype.Awake = function()
		{
			if (UHT_GAME_CONFIG_SRC["s_elapsed"] != null)
			{
				this.currentTime = UHT_GAME_CONFIG_SRC["s_elapsed"] * 60;
				return;
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchOnBalanceUpdated",
	ready:function()
	{
		return (window["StageSpin"] != undefined);
	},
	apply:function()
	{
		var oSSOBU = StageSpin.prototype.OnBalanceUpdated;
		StageSpin.prototype.OnBalanceUpdated = function()
		{
			if (XT.GetDouble(TournamentVars.Promotion_WinReceived) <= 0)
			{
				oSSOBU.apply(this, arguments);
			}
			if (StageSpin.preventBalanceUpdate)
			{
				if (XT.GetDouble(Vars.BonusBalance) < 0.0001)
				{
					if (NetPositionFOX.costForJPBalanceUpdate < 0)
						XT.SetDouble(Vars.BalanceDisplayed, XT.GetDouble(Vars.BalanceDisplayed) - CoinManager.GetLastTotalBet());
					else
					{
						XT.SetDouble(Vars.BalanceDisplayed, XT.GetDouble(Vars.BalanceDisplayed) - NetPositionFOX.costForJPBalanceUpdate);
						NetPositionFOX.costForJPBalanceUpdate = -1;
					}
				}
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRequirementMAC",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG_SRC"] != undefined) && (window["TournamentVars"] != undefined) && (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (IsRequired("MAC"))
		{
			XT.SetBool(TournamentVars.PrizeDropManuallyCredited, true);
		}

		if (IsRequired("MAC") && window["UHT_GAME_CONFIG_SRC"]["manualPayout"] == undefined)
		{
			XT.SetBool("PrizeDropManuallyCredited_AGBM", true);
			XT.SetBool("PrizeDropManuallyCredited_FR", true);
			XT.SetBool("TournamentManuallyCredited_AGBM", true);
			XT.SetBool("TournamentManuallyCredited_FR", true);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchAllowNL",
	ready:function()
	{
		return (window["ModificationsManager"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("ALLOWNL"))
		{
			return;
		}

		if (window["UHT_CONFIG"].LANGUAGE == "nl")
			ModificationsManager.prototype.Init = function(){};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
});

UHTPatch({
	name: "PatchForgetFRBEndWindowOnInit",
	ready:function()
	{
		return (window["EventManager"] != undefined);
	},
	apply:function()
	{
		var OnUHTUpdate = function()
		{
			if (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"])
				return;

			if (IsRequired("FFE"))
			{
				XT.SetBool(Vars.DontShowFRBEndWindowOnInit, true);
			}

			EventManager.ClearCallback(OnUHTUpdate, this);
		}
		EventManager.AddHandler("EVT_UHT_UPDATE", OnUHTUpdate, this);
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchForgetPreviousWin",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UHT_GAME_CONFIG_SRC"] != undefined && window["VideoSlotsConnection"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("FPW"))
		{
			VideoSlotsConnection.cleanupPreviousWin = true;
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchTournamentReloadInterval",
	ready:function()
	{
		return (window["TournamentConnectionXTLayer"] != undefined);
	},
	apply:function()
	{
		var oTCXTL_OGI = TournamentConnectionXTLayer.prototype.OnGameInit;
		TournamentConnectionXTLayer.prototype.OnGameInit = function()
		{
			oTCXTL_OGI.apply(this, arguments);
			if (this.connection != null)
			{
				this.connection.reloadLeaderboardsInterval = 120;
				this.connection.leaderboardsTimer = 120;
				this.connection.reloadTournamentsInterval = 120;
				this.connection.tournamentsTimer = 120;
				this.connection.reloadRaceWinnersInterval = 120;
				this.connection.raceWinnersTimer = 120;
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchNODEC",
	ready:function()
	{
		return (window["LocaleManager"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NODEC"))
		{
			var oLM_FV = LocaleManager.FormatValue;
			LocaleManager.FormatValue = function(/**number*/ val, /**FormatOptions*/ formatInfo)
			{
				formatInfo.hasDecimals = !(val == (val | 0));
				return oLM_FV.apply(this, arguments);
			};
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchJR",
	ready:function()
	{
		return (window["VideoSlotsConnectionXTLayer"] != undefined);
	},
	apply:function()
	{
		var oVSCXTL_RS = VideoSlotsConnectionXTLayer.prototype.RequirementsSetup;
		VideoSlotsConnectionXTLayer.prototype.RequirementsSetup = function ()
		{
			NOJRChecked = false;
			var a = IsRequired("UNUSED", false, true);
			oVSCXTL_RS.apply(this, arguments);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchRemoveTournamentCatchphraseItalian",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "it")
		{

			this.OnXTGameInit = function()
			{
				if (!Globals.isMobile)
				{
					var pathsDesktop = [
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/ShortRulesCombined/Catchphrase"
					];

					for (var i = 0; i < pathsDesktop.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
						if (t != null)
						{
							t.gameObject.SetActive(false);
						}
					}
				}
				else if (!Globals.isMini)
				{
					var pathsMobileLand = [
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/ShortCombined/Catchphrase"
					];

					var pathsMobilePort = [
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/ShortCombined/Catchphrase"
					];

					for (var i = 0; i < pathsMobileLand.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobileLand[i]);
						if (t != null)
						{
							t.gameObject.SetActive(false);
						}
					}

					for (var i = 0; i < pathsMobilePort.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobilePort[i]);
						if (t != null)
						{
							t.gameObject.SetActive(false);
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchLocalization",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "tr")
		{

			this.OnXTGameInit = function()
			{
				if (!Globals.isMobile)
				{
					var pathsDesktop = [
						"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/FreeBonusRounds!Label",
						"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/Title/Label",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/Texts/Prize/FRN/Amount/FreeBonusRoundsLabel!",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/FR/Texts/Prize/Bet/AtLabel",
						"UI Root/XTRoot/Root/GUI/Tournament/Tournament/LocalizedLabels/LocalizedStartsInLabel_0"
					];

					var newTranslationDesktop = [
						"ÜCRETSİZ DÖNÜŞ KAZANDINIZ!",
						"OYNAMAYA BAŞLATMAK İÇİN DEVAM'A BASIN",
						"ŞANŞLISINIZ!",
						"ÜCRETSİZ DÖNÜŞ!",
						"BAHİS",
						"IÇINDE BAŞLAR"
					];

					for (var i = 0; i < pathsDesktop.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsDesktop[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslationDesktop[i];
						}
					}
				}
				else if (!Globals.isMini)
				{
					var pathsMobileLand = [
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/FreeBonusRounds!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/Prize/FRN/Amount/FreeBonusRoundsLabel!",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Land/FR/Texts/Prize/Bet/AtLabel",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/TournamentArrangeable/Tournament/LocalizedLabels/LocalizedStartsInLabel_0"
					];

					var pathsMobilePort = [
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/FreeBonusRounds!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/Prize/FRN/Amount/FreeBonusRoundsLabel!",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/ContentWin/ContentAnimator/Content/Europe/Port/FR/Texts/Prize/Bet/AtLabel",
						"UI Root/XTRoot/Root/GUI_mobile/Tournament/TournamentArrangeable/Tournament/LocalizedLabels/LocalizedStartsInLabel_0"
					];

					var newTranslationMobile = [
						"ÜCRETSİZ DÖNÜŞ KAZANDINIZ!",
						"OYNAMAYA BAŞLATMAK İÇİN DEVAM'A BASIN",
						"ÜCRETSİZ DÖNÜŞ!",
						"BAHİS",
						"IÇINDE BAŞLAR"
					];

					for (var i = 0; i < pathsMobileLand.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobileLand[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslationMobile[i];
						}
					}

					for (var i = 0; i < pathsMobilePort.length; i++)
					{
						var t = globalRuntime.sceneRoots[1].transform.Find(pathsMobilePort[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslationMobile[i];
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}

		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "th")
		{

			this.OnXTGameInit = function()
			{
				var newTranslation = "ของรางวัลจำนวน";
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				if (!Globals.isMobile)
				{
					var pathsDesktop = [
						"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI/Tournament/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PContent/PD_AGBM/Title/Title/NoOfPrizesLabel"
					];

					for (var i = 0; i < pathsDesktop.length; i++)
					{
						var t = localizationRoot.transform.Find(pathsDesktop[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslation;
						}
					}
				}
				else
				{
					var pathsMobile = [
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Landscape/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/TournamentArrangeable/Tournament/Portrait/Content/Holder_Tournaments/Clipped/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/Landscape/ScreenAnchor/Content/Details/Prizes/PrizesContent/PD_BM/Title/Title/NoOfPrizesLabel",
						"GUI_mobile/Tournament/Landscape/ScreenAnchor/Content/Details/Prizes/PrizesContent/PD_AGBM/Title/Title/NoOfPrizesLabel"
					];

					for (var i = 0; i < pathsMobile.length; i++)
					{
						var t = localizationRoot.transform.Find(pathsMobile[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslation;
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}

		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "id")
		{

			this.OnXTGameInit = function()
			{
				var newTranslation = "KELUAR";
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				if (!Globals.isMobile)
				{
					var pathsDesktop = [
						"GUI/Interface/Windows/MenuWindow/Content/Links/WithoutPromoUrl/Home/Text/HomeLabel",
						"GUI/Interface/Windows/MenuWindow/Content/Links/WithPromoUrl/Home/Text/HomeLabel"
					];

					for (var i = 0; i < pathsDesktop.length; i++)
					{
						var t = localizationRoot.transform.Find(pathsDesktop[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslation;
						}
					}
				}
				else
				{
					var pathsMobile = [
						"GUI_mobile/Interface_Landscape/ContentInterface/Windows/MenuWindow/Content/Links/WithoutPromoUrl/Home/Text/HomeLabel",
						"GUI_mobile/Interface_Landscape/ContentInterface/Windows/MenuWindow/Content/Links/WithPromoUrl/Home/Text/HomeLabel",
						"GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/Links/WithoutPromoUrl/Home/HomeLabel",
						"GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/Links/WithPromoUrl/Home/HomeLabel"
					];

					for (var i = 0; i < pathsMobile.length; i++)
					{
						var t = localizationRoot.transform.Find(pathsMobile[i]);
						if (t != null)
						{
							var label = t.GetComponentsInChildren(UILabel, true)[0];
							if (label != null)
								label.text = newTranslation;
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}
		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "ru")
		{
			this.OnXTGameInit = function()
			{
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				if (!Globals.isMobile)
				{
					if (window["Paytable"] == undefined)
						return;
					var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
					if (paytable != null)
					{
						var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.trim() == "БЕСПЛАТНЫХ СПИНОВ")
								labels[i].text = "БЕСПЛАТНЫЕ СПИНЫ";
						}
					}

					var t = localizationRoot.transform.Find("GUI/Interface/Windows/BonusRoundsWindows");
					if (t != null)
					{
						var labels = t.gameObject.GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.indexOf("БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНІ") != -1)
								labels[i].text = labels[i].text.replace("БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНІ","БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНЫ")
						}
					}
				}
				else
				{
					if (window["Paytable_mobile"] == undefined)
						return;
					var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
					if (paytable != null)
					{
						var labels = globalRuntime.sceneRoots[1].GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.trim() == "БЕСПЛАТНЫХ СПИНОВ")
								labels[i].text = "БЕСПЛАТНЫЕ СПИНЫ";
						}
					}

					var t = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows");
					if (t != null)
					{
						var labels = t.gameObject.GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.indexOf("БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНІ") != -1)
								labels[i].text = labels[i].text.replace("БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНІ","БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНЫ")
						}
					}

					var t = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows");
					if (t != null)
					{
						var labels = t.gameObject.GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.indexOf("БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНІ") != -1)
								labels[i].text = labels[i].text.replace("БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНІ","БЕСПЛАТНЫЕ БОНУСНЫЕ СПИНЫ")
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}

		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "el")
		{
			this.OnXTGameInit = function()
			{
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				var labels = localizationRoot.GetComponentsInChildren(UILabel, true);
				for (var i = 0; i < labels.length; i++)
				{
					if (labels[i].text.indexOf("ΚΕΡΙΣΤΕ") != -1)
						labels[i].text = labels[i].text.replaceAll("ΚΕΡΙΣΤΕ","ΚΕΡΔΙΣΤΕ");
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}

		if (window["UHT_GAME_CONFIG"]["LANGUAGE"] == "es")
		{
			this.OnXTGameInit = function()
			{
				var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
				if (localizationRoot == null)
					return;

				if (!Globals.isMobile)
				{
					var t = localizationRoot.transform.Find("GUI/Interface/Windows/BonusRoundsWindows");
					if (t != null)
					{
						var labels = t.gameObject.GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.indexOf("TIRADAS BONUS GRATIS") != -1)
								labels[i].text = labels[i].text.replace("TIRADAS BONUS GRATIS","TIRADAS GRATIS")
							if (labels[i].text.indexOf("¡HA RECIBIDO") != -1)
								labels[i].text = labels[i].text.replace("¡HA RECIBIDO","¡HAS RECIBIDO!")
							if (labels[i].text.indexOf("HA RECIBIDO") != -1)
								labels[i].text = labels[i].text.replace("HA RECIBIDO","¡HAS RECIBIDO!")
						}
					}
				}
				else
				{
					var t = localizationRoot.transform.Find("GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows");
					if (t != null)
					{
						var labels = t.gameObject.GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.indexOf("TIRADAS BONUS GRATIS") != -1)
								labels[i].text = labels[i].text.replace("TIRADAS BONUS GRATIS","TIRADAS GRATIS")
							if (labels[i].text.indexOf("¡HA RECIBIDO") != -1)
								labels[i].text = labels[i].text.replace("¡HA RECIBIDO","¡HAS RECIBIDO!")
							if (labels[i].text.indexOf("HA RECIBIDO") != -1)
								labels[i].text = labels[i].text.replace("HA RECIBIDO","¡HAS RECIBIDO!")
						}
					}

					var t = localizationRoot.transform.Find("GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows");
					if (t != null)
					{
						var labels = t.gameObject.GetComponentsInChildren(UILabel, true);
						for (var i = 0; i < labels.length; i++)
						{
							if (labels[i].text.indexOf("TIRADAS BONUS GRATIS") != -1)
								labels[i].text = labels[i].text.replace("TIRADAS BONUS GRATIS","TIRADAS GRATIS")
							if (labels[i].text.indexOf("¡HA RECIBIDO") != -1)
								labels[i].text = labels[i].text.replace("¡HA RECIBIDO","¡HAS RECIBIDO!")
							if (labels[i].text.indexOf("HA RECIBIDO") != -1)
								labels[i].text = labels[i].text.replace("HA RECIBIDO","¡HAS RECIBIDO!")
						}
					}
				}
			}
			XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
		}

	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchRC_CheckShowWindow",
	ready:function()
	{
		return (window["RC_CheckShowWindow"] != undefined);
	},
	apply:function()
	{
		RC_CheckShowWindow = function()
		{
			if (RC_timer == -1)
				return;
			if (UHT_GAME_CONFIG["rcSettings"] == null)
				return;
			if (UHT_GAME_CONFIG["rcSettings"]["rctype"] != "RC0")
				return;
			if (IsRequired("RCEA") && (UHT_GAME_CONFIG["rcSettings"]["elapsed"] > UHT_GAME_CONFIG["rcSettings"]["interval"]))
				UHT_GAME_CONFIG["rcSettings"]["elapsed"] -= UHT_GAME_CONFIG["rcSettings"]["interval"];
			if (RC_WindowShown)
				return;
			var now = (new Date).getTime();
			var interval = UHT_GAME_CONFIG["rcSettings"]["interval"];
			var minutes_passed = ((now - RC_timer) / 6E4) + (UHT_GAME_CONFIG["rcSettings"]["elapsed"] || 0);
			var all_minutes_passed = Math.floor((now - RC_sessionTimer) / 6E4) | 0;
			if (minutes_passed >= interval) {
				SystemMessageManager.ShowMessage(SystemMessageType.ClientRegulation, false, UHT_GAME_CONFIG["rcSettings"]["msg"].replace("{0}", interval.toString()).replace("{1}", all_minutes_passed));
				UHT_GAME_CONFIG["rcSettings"]["elapsed"] = 0;
				RC_WindowShown = true
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchFRBEV",
	ready:function()
	{
		return (window["XT"] != undefined && window["XT"]["RegisterAndInitDone"]);
	},
	apply:function()
	{
		var isStart = false;
		var SendFRBEvent = function()
		{
			if (isStart)
				UHTInterfaceBOSS.PostMessage("FRB_STARTED");
			else
				UHTInterfaceBOSS.PostMessage("FRB_ENDED");
		}

		if (IsRequired("FRBEVS"))
		{
			var PrepareToSendStartEvent = function()
			{
				isStart = true;
			};

			if (Vars.Evt_DataToCode_BonusRoundsOnContinuePressed)
				XT.RegisterCallbackEvent(Vars.Evt_DataToCode_BonusRoundsOnContinuePressed, SendFRBEvent, this);
			if (Vars.Evt_CodeToData_BonusRoundsStarted)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_BonusRoundsStarted, PrepareToSendStartEvent, this);
			if (Vars.Evt_CodeToData_TimedBonusRoundsStarted)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_TimedBonusRoundsStarted, PrepareToSendStartEvent, this);
		}

		if (IsRequired("FRBEVE"))
		{
			var PrepareToSendEndEvent = function()
			{
				isStart = false;
			};

			if (Vars.Evt_DataToCode_BonusRoundsOnContinuePressed)
				XT.RegisterCallbackEvent(Vars.Evt_DataToCode_BonusRoundsOnContinuePressed, SendFRBEvent, this);
			if (Vars.Evt_CodeToData_BonusRoundsFinished)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_BonusRoundsFinished, PrepareToSendEndEvent, this);
			if (Vars.Evt_CodeToData_TimedBonusRoundsFinished)
				XT.RegisterCallbackEvent(Vars.Evt_CodeToData_TimedBonusRoundsFinished, PrepareToSendEndEvent, this);
		}
	},
	retry:function()
	{
		return (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"]);
	}
});

UHTPatch({
	name: "PatchSlider",
	ready:function()
	{
		return (window["Slider"] != undefined);
	},
	apply:function()
	{
		Slider.prototype.Autocomplete = function()
		{
			if (this.autocomplete)
			{
				if (this.type == SliderType.Bool)
				{
					var targetValue = this.internalValue >= 0.5 ? 1 : 0;
					var value = UHTMath.inverseLerp(this.thumb.localPositionLimitMin.x, this.thumb.localPositionLimitMax.x, this.thumb.target.localPosition().x);

					if (targetValue != value)
					{
						this.animator.manualTo = this.internalValue >= 0.5 ? this.thumb.localPositionLimitMax : this.thumb.localPositionLimitMin;
						this.animator.animationTime = this.animationTime * Math.abs(targetValue - value);
						this.animator.Play();
					}
				}
			}

			this.autocompleteFrameCount = Time.frameCount;
		};
		
		Slider.prototype.InverseAutocomplete = function()
		{
			if (this.autocomplete && this.autocompleteFrameCount != Time.frameCount)
			{
				if (this.type == SliderType.Bool)
				{
					var targetValue = this.internalValue >= 0.5 ? 0 : 1;
					var value = UHTMath.inverseLerp(this.thumb.localPositionLimitMin.x, this.thumb.localPositionLimitMax.x, this.thumb.target.localPosition().x);

					if (targetValue != value)
					{
						this.animator.manualTo = targetValue == 1 ? this.thumb.localPositionLimitMax : this.thumb.localPositionLimitMin;
						this.animator.animationTime = this.inverseAnimationTime * Math.abs(targetValue - value);
						this.animator.Play();
					}
				}
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchWalletAwareSB",
	ready:function()
	{
		return (window["RequestManager"] != undefined && window["RequestManager"].MustLimitSpinRequest != undefined);
	},
	apply:function()
	{
		if (IsRequired("WASB"))
		{
			var oRMMLSR = RequestManager.MustLimitSpinRequest;
			RequestManager.MustLimitSpinRequest = function()
			{
				XT.SetFloat(Vars.SpinDuration, 0);
				return oRMMLSR.apply(this, arguments);
			}
		};
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchSplitResponseContent",
	ready:function()
	{
		return (window["GameProtocolCommonParser"] != undefined);
	},
	apply:function()
	{
		GameProtocolCommonParser.SplitResponseContent = function(nameValues)
		{
			var mapNameValues = {};
			for (var i = 0; i < nameValues.length; ++i)
			{
				var nameValueSplitted = nameValues[i].split('=', 2);
				if (nameValueSplitted.length == 2)
				{
					nameValueSplitted[1] = nameValues[i].split("=").slice(1).join("=");
					if (mapNameValues[nameValueSplitted[0]] == undefined)
						mapNameValues[nameValueSplitted[0]] = nameValueSplitted[1];
				}
			}
			return mapNameValues;
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchBonusBalanceEvent",
	ready:function()
	{
		return (window["VideoSlotsConnectionXTLayer"] != undefined && window["VSProtocolParser"].ParseVsResponse != undefined);
	},
	apply:function()
	{
		if (window["UHTInterfaceBOSS"].enabled && window.top != window)
		{
			var hadBonusBalance = undefined;
			var oPVR = VSProtocolParser.ParseVsResponse;
			VSProtocolParser.ParseVsResponse = function()
			{
				var hasBonusBalance = (arguments[0].balance_bonus > 0);
				if ((hasBonusBalance && hadBonusBalance!=true) || (!hasBonusBalance && hadBonusBalance!=false))
				{
					var msg = "";
					if (hasBonusBalance)
						msg = "bonusBalanceAvailable";
					if (!hasBonusBalance)
						msg = "bonusBalanceUnavailable";
					
					hadBonusBalance=hasBonusBalance;
					
					var args =
					{
						sender: URLGameSymbol,
						lang: UHT_GAME_CONFIG["LANGUAGE"].toUpperCase(),
						success: true,
						name: msg,
						event: msg
					}
					
					UHTInterfaceBOSS.PostMessageRec(window.parent, args);
				}
				return oPVR.apply(this, arguments);
			}
		};
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchGameHistoryEvent",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("GHEV"))
		{
			UHTInterfaceBOSS.HandleGameHistory = function()
			{
				UHTInterfaceBOSS.PostMessage("OPEN_HISTORY");
				return true;
			};
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchHideGameHistory",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOGH"))
		{
			if (window["Vars"] != undefined && window["Vars"]["Jurisdiction_GameHistoryInfoVisible"] != undefined)
				XT.SetBool(Vars.Jurisdiction_GameHistoryInfoVisible, false);
			var gameHistoryButtons = globalRuntime.sceneRoots[1].GetComponentsInChildren(GameHistoryButton, true);
			for (var i = 0; i < gameHistoryButtons.length; i++)
			{
				gameHistoryButtons[i].gameObject.SetActive(false);
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchRealityCheckEvents",
	ready:function()
	{
		return (window["SystemMessageManager"] != undefined) && (window["SystemMessageManager"]["RCClose"] != undefined) 
			&& (window["SystemMessageManager"]["RCContinue"] != undefined) && (window["SystemMessageManager"]["ShowMessage"] != undefined);
	},
	apply:function()
	{
		var oSMMRCContinue = SystemMessageManager.RCContinue;
		SystemMessageManager.RCContinue = function()
		{
			UHTInterfaceBOSS.PostMessage("RC_CONTINUE");
			oSMMRCContinue.apply(this, arguments);
		}

		var oSMMRCClose = SystemMessageManager.RCClose;
		SystemMessageManager.RCClose = function()
		{
			UHTInterfaceBOSS.PostMessage("RC_QUIT");
			oSMMRCClose.apply(this, arguments);
		}

		var oSMMShowMessage = SystemMessageManager.ShowMessage;
		SystemMessageManager.ShowMessage = function(type, unlogged, text, args, customMsg)
		{
			if (type == SystemMessageType.ClientRegulation)
				UHTInterfaceBOSS.PostMessage("RC_SHOWN");

			oSMMShowMessage.apply(this, arguments);

			if (metaIframe != null)
				metaIframe.contentWindow.postMessage({group:'lobby', name:'close'}, "*");
		}

	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchHideCurrency",
	ready:function()
	{
		return (window["Adapter"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOCUR"))
		{
			var oA_HGC = Adapter.prototype.HandleGetConfiguration;
			Adapter.prototype.HandleGetConfiguration = function ()
			{
				oA_HGC.apply(this, arguments);
				ServerOptions.currency = "GNR";
			};
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDisableHomeButtonMobile",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1) && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		var shouldDisable = false;
		var styleNameList = "wkl_wynn383,wkl_mxm,396_ao99,oryxsw_zlatnik,btsn_supercasino,btsn_jackpot247,btsn_casinoeuro,btsn_jallacasino,btsn_liveroulette,btsn_mobilbahis,btsn_betsafe,btsn_betsafeee,btsn_betsafelv,btsn_betsafede,btsn_betsafese,btsn_betsson,btsn_betssones,btsn_betssongr,btsn_betssonde,btsn_betssonse,btsn_casinodk,btsn_europebet,btsn_nordicbet,btsn_nordicbetdk,btsn_nordicbetde,btsn_nordicbetse".split(",");
		for (var i = 0; i < styleNameList.length; i++)
		{
			if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
			{
				shouldDisable = true;
				break;
			}
		}

		if (UHT_GAME_CONFIG.STYLENAME.indexOf("weinet_") > -1)
			shouldDisable = true;

		if (UHT_GAME_CONFIG.STYLENAME.indexOf("ggn_") > -1)
			shouldDisable = true;

		if (IsRequired("NOHB"))
			shouldDisable = true;

		if (shouldDisable)
		{
			if (Globals.isMobile)
			{
				var OnNotification = function(notification)
				{
					if (notification == null || notification.buttons == null)
						return;

					for (var i = 0; i < notification.buttons.length; i++)
					{
						if (notification.buttons[i].id == "BtCLOSE" || notification.buttons[i].action == "quit")
						{
							notification.buttons.splice(i, 1);
							break;
						}
					}
					XT.SetObject(CustomNotificationVars.CustomNotification, notification);
				}
				XT.RegisterCallbackObject(CustomNotificationVars.CustomNotification, OnNotification, this, -1);

				if (window["MenuWindowControllerMobile"] == undefined)
					return;
				var menus = globalRuntime.sceneRoots[1].GetComponentsInChildren(MenuWindowControllerMobile, true);
				for (var i = 0; i < menus.length; ++i)
				{
					var go = menus[i].transform.Find("Content/Home");
					if (go != null)
						go.gameObject.SetActive(false);
					else
					{
						menus[i].transform.Find("Content/Links/WithoutPromoUrl/Home").gameObject.SetActive(false);
						menus[i].transform.Find("Content/Links/WithPromoUrl/Home").gameObject.SetActive(false);
						go = menus[i].transform.Find("Content/Lines")
						if (go != null)
							go.gameObject.SetActive(false);
						go = menus[i].transform.Find("Content/Links/Lines")
						if (go != null)
							go.gameObject.SetActive(false);
					}
				}
				XT.SetBool(Vars.Jurisdiction_GameLobbyInfoVisible, false);

				if (window["SCWindowsController"] != undefined)
				{
					var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
					if (localizationRoot != null)
					{
						var homeButton = localizationRoot.transform.Find("GUI_mobile/Interface/Windows/MenuWindow/Content/GameSettingsButtons/HomeButton");
						if (homeButton != undefined)
							homeButton.gameObject.SetActive(false);
					}
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchScrollableListOnDisable",
	ready: function()
	{
		return (window["ScrollableList"] != undefined);
	},
	apply: function()
	{
		ScrollableList.prototype.OnDisable = function()
		{
			if (this.wasPressed)
				this.OnPress(false);
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchIOSShadows",
	ready: function()
	{
		return (window["UILabel"] != undefined);
	},
	apply: function()
	{
		var needsPatch = (window["safari"] != undefined) || (document.documentElement.className.indexOf("iOS") >= 0);
		if (!needsPatch)
			return;

		var oUILI = UILabel.prototype.init;
		UILabel.prototype.init = function()
		{
			if (this.mOutline == true)
				this.mBlurShadow = false;
			oUILI.apply(this, arguments);
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchTimedFreeRoundBonusManager",
	ready:function()
	{
		return (window["TimedFreeRoundBonusManager"] != undefined);
	},
	apply:function()
	{
		TimedFreeRoundBonusManager.prototype.OnBonusRoundsData = function(obj)
		{
			this.bonusRoundsData  = obj;
			if (obj == null)
				return;

			if (this.bonusRoundsData.Type != VsFreeRound.RoundType.Timed)
				return;

			var evts = XT.GetObject(Vars.BonusRoundsEvents);
			if (evts != null)
			{
				for (var i = 0; i < evts.length; i++)
				{
					if (evts[i].Type == VsFreeRoundEvent.EventType.Start)
					{
						this.cachedStartEvent.push(evts[i].Clone());
						var foxResponse = XT.GetObject(FOXVars.FOX_Response);
						if (foxResponse != undefined && foxResponse["c"] != undefined)
							this.cachedbetLevel = parseFloat(foxResponse["c"]);
						XT.SetBool(Vars.ShouldIgnoreNextFinishEventFromServer, true);
						var fsr = XT.GetObject(Vars.ReceivedFreeSpinsResponse);
						if (evts.length == 1 && !fsr.IsLastFreeSpin)
							this.RequestToShow();
						XT.SetDouble(Vars.BonusRoundEndDateTimestamp, evts[i].EndDateTimestamp);
						if (evts != null && evts.length == 1 && evts[0].Type == VsFreeRoundEvent.EventType.Start && !evts[0].IsFreeRoundPending)
						{
							this.countingInBackground = true;
							this.currentTime = this.bonusRoundsData.RoundsLeft;
						}
					}
				}
			}
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchGBets",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && window["UHT_GAME_CONFIG_SRC"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("GBETS"))
		{
			var oCCVACB = CoinManager.ComputeCoinValuesAndCurrentBet;
			CoinManager.ComputeCoinValuesAndCurrentBet = function(betsFromServer, lastBet, defaultBet)
			{
				var minBet = betsFromServer[0];
				var maxBet = betsFromServer[betsFromServer.length - 1];
				var curve = [ 0.05, 0.1, 0.2, 0.4 ];

				var levels = 10;

				while ((minBet*levels)<((maxBet/levels)*curve[0]))
					curve.unshift(curve[0]*0.2);

				if (maxBet/minBet < levels)
				{
					levels = ((maxBet * 1000) / (minBet * 1000)) | 0;
				}

				var maxCoinValue = ((maxBet * 1000) / levels) / 1000;
				var x = (maxCoinValue - minBet);

				var coinValues = [];
				coinValues.push(minBet);
				for (var j = 0; j < curve.length; j++)
				{
					var computedVal = CoinManager.GetNiceCoinValue(minBet + x * curve[j]);
					if ((computedVal > minBet) && (computedVal < maxCoinValue))
						coinValues.push(computedVal);
				}
				coinValues.push(maxCoinValue);

				for (var i = 1; i < coinValues.length; i++ )
				{
					if (Math.abs(coinValues[i] - coinValues[i - 1]) < 1e-3)
					{
						coinValues.splice(i, 1);
						i--;
					}
				}

				var generatedBets = [];
				for (var levelIndex = 1; levelIndex <= levels; levelIndex++)
				{
					for (var i = 0; i < coinValues.length; i++)
					{
						var value = levelIndex * (coinValues[i] * 100) / 100;
						if (generatedBets.indexOf(value) == -1)
							generatedBets.push(value);
					}
				}
				generatedBets = generatedBets.sort(function (a, b) { return a - b });
				arguments[0] = generatedBets;
				oCCVACB.apply(this, arguments);
			};
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchNOST_SB",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1 && window["StageSpin"] != undefined);
	},
	apply:function()
	{
		StageSpin.prototype.OnPressedStop = function()
		{
			if(XT.GetBool(Vars.AllowFastStop) && !XT.GetBool(Vars.DisableStopButton))
				XT.TriggerEvent(Vars.Evt_Internal_ReelManager_StopSpin);
		};

	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideBETMENUjakr",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && (UHT_GAME_CONFIG_SRC["lang"] == "ja" || UHT_GAME_CONFIG_SRC["lang"] == "ko"))
		{
			var t = globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/Paytable/Pages/Common_Info2/BetMenu/Title/BetMenuLabel");
			if (t != null)
				t.gameObject.SetActive(false);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});


UHTPatch({
	name: "PatchConvertLeaderboardToPlayerCurrency",
	ready:function()
	{
		return (window["TournamentConnection"] != undefined);
	},
	apply:function()
	{
		var oCLTPC = TournamentConnection.prototype.ConvertLeaderboardToPlayerCurrency;
		TournamentConnection.prototype.ConvertLeaderboardToPlayerCurrency = function()
		{
			if (!arguments[0]["leaderboard"])
				return;
			oCLTPC.apply(this, arguments);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideFullScreenAfter5Seconds",
	ready:function()
	{
		return (window["IPhone8Helper"] != undefined);
	},
	apply:function()
	{
		if (FullScreenIPhoneHelper.USING_NEW_IMPLEMENTATION)
		{
			var oRH = IPhone8Helper.prototype.ResizeHandler;
			IPhone8Helper.prototype.ResizeHandler = function(e)
			{
				oRH.call(this);
				if ((UHT_UA_INFO != undefined) && (UHT_UA_INFO.os.version.split(".")[0] >= 15))
				{
					if (this.root != null)
					{
						this.UpdateStyle(false);
						UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({common: "EVT_FULLSCREEN_OVERLAY_HIDDEN", args: null}));
					}
				}
			};
			return;
		}
		IPhone8Helper.prototype.ResizeHandler = function(e)
		{
			var self = this;

			if (!this.GameStarted())
			{
				setTimeout(function(){ self.ResizeHandler() }, 100);
				return;
			}

			if (this.root == null)
				this.InitElements();

			var wasLandscape = this.isLandscape;
			this.isLandscape = window.innerWidth > window.innerHeight;

			if (!this.isTouch)
			{
				if(wasLandscape == this.isLandscape)
				{
					if(this.panelHiddenTime > 0)
					{
						if (Date.now() - this.panelHiddenTime < 69)
						{
							setTimeout(function(){ self.ResizeHandler(e); }, 500);
							return;
						}
					}
				}
				else
				{
					if (this.isLandscape && window.innerHeight != Math.min(screen.width, screen.height))
					{
						this.UpdateStyle(true);
						this.UpdateScrollable(true);
						UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({common: "EVT_FULLSCREEN_OVERLAY_SHOWN", args: null}));
						this.panelHiddenTime = -1;
						if (!this.isLandscape)
							this.QueueFullscreenHide();
						else if (timeoutOrientationChanged != null)
							clearTimeout(timeoutOrientationChanged);
					}
					this.ResetScroll();
				}
			}

			var screenHeight = this.isLandscape ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height) - 60;
			if(!this.isLandscape && screenHeight == 752)
				screenHeight -= 35;
			if(!this.isLandscape && screenHeight == 836)
				screenHeight -= 4;

			this.clientHeight = this.GetClientHeight();

			var wasTopPanel = this.isTopPanel;
			this.isTopPanel = this.clientHeight < screenHeight;

			if (this.isTopPanel)
			{
				if(!wasTopPanel)
				{
					this.UpdateStyle(true);
					this.ResetScroll();
					this.UpdateScrollable(true);
					UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({common: "EVT_FULLSCREEN_OVERLAY_SHOWN", args: null}));
					this.panelHiddenTime = -1;
					if (!this.isLandscape)
						this.QueueFullscreenHide();
					else if (timeoutOrientationChanged != null)
						clearTimeout(timeoutOrientationChanged);
				}
			}
			else
			{
				if(wasTopPanel)
				{
					this.UpdateStyle(false);
					UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({common: "EVT_FULLSCREEN_OVERLAY_HIDDEN", args: null}));
					this.panelHiddenTime = Date.now();
				}
				this.UpdateScrollable(false);
			}

			if (e !== undefined)
				setTimeout(function(){ self.ResizeHandler(); }, 500);
		};

		var timeoutOrientationChanged = null;
		IPhone8Helper.prototype.QueueFullscreenHide = function()
		{
			var self = this;
			if (timeoutOrientationChanged != null)
				clearTimeout(timeoutOrientationChanged);

			timeoutOrientationChanged = setTimeout(self.HideFullScreen, 3000, self);
		};

		IPhone8Helper.prototype.HideFullScreen = function(obj)
		{
			obj.UpdateStyle(false);
			UHTEventBroker.Trigger(UHTEventBroker.Type.Game, JSON.stringify({common: "EVT_FULLSCREEN_OVERLAY_HIDDEN", args: null}));
			obj.panelHiddenTime = Date.now();
			obj.UpdateScrollable(false);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	},
});

UHTPatch({
	name: "PatchBonusRoundsStartWindowContinueLabel",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		this.OnBonusRoundCanBePlayedLater = function(value)
		{
			var paths = [
				"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinueToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickContinue"
			];
			for (var i = 0; i < paths.length; i++)
			{
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null)
					t.gameObject.SetActive(!value);
			}

			paths = [
				"UI Root/XTRoot/Root/GUI/Interface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label",
				"UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Texts/ClickPlayNowToStartPlaying!Label"
			];
			for (var i = 0; i < paths.length; i++)
			{
				var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
				if (t != null)
					t.gameObject.SetActive(false);
			}
		}
		XT.RegisterCallbackBool(Vars.BonusRoundCanBePlayedLater, this.OnBonusRoundCanBePlayedLater, this);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchBonusRoundStartWindowLandscapeMobile",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		var paths = [
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Buttons/PlayLater/ContinueButton",
			"UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/Windows/BonusRoundsWindows/BonusRoundsStartWindow/Buttons/PlayLater/ContinueLabel"
		];
		for (var i = 0; i < paths.length; i++)
		{
			var t = globalRuntime.sceneRoots[1].transform.Find(paths[i]);
			if (t != null)
				t.gameObject.transform.SetParent(t.transform.parent.parent.transform, true);
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchClock",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs") == 0)
		{
			if (!Globals.isMini)
			{
				if (UHT_GAME_CONFIG.STYLENAME.indexOf("genesis_") == 0 || UHT_GAME_CONFIG.STYLENAME.indexOf("em_") == 0 || IsRequired("ALTCLK"))
				{
					var clockDisplayers = globalRuntime.sceneRoots[1].GetComponentsInChildren(ClockDisplayer, true);
					for (var j = 0; j < clockDisplayers.length; j++)
					{
						clockDisplayers[j].hoursLabel.effectStyle = 2;
						clockDisplayers[j].hoursLabel.effectHeight = 2;
						clockDisplayers[j].hoursLabel.effectWidth = 2;
						clockDisplayers[j].hoursLabel.init(true);
						clockDisplayers[j].separatorLabel.effectStyle = 2;
						clockDisplayers[j].separatorLabel.effectHeight = 2;
						clockDisplayers[j].separatorLabel.effectWidth = 2;
						clockDisplayers[j].separatorLabel.init(true);
						clockDisplayers[j].minutesLabel.effectStyle = 2;
						clockDisplayers[j].minutesLabel.effectHeight = 2;
						clockDisplayers[j].minutesLabel.effectWidth = 2;
						clockDisplayers[j].minutesLabel.init(true);
					}
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHidePressSpinLabelDesktop",
	ready:function()
	{
		return (window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		var t = globalRuntime.sceneRoots[1].transform.Find("UI Root/XTRoot/Root/Paytable/Pages/Common_Info1/HowToPlay/Rules/Bottom/Rule2Label");
		if (t != null)
			t.gameObject.SetActive(false);
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchDisableSpacebarSpin",
	ready:function()
	{
		return (window["Input"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOKEY") || (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1))
		{
			Input.GetKeyDown = function(keyCode)
			{
				return false;
			};

			Input.GetKey = function(keyCode)
			{
				return false;
			};
			if (!Globals.isMobile)
			{
				if (window["GUIMessageTurboSpin"] != undefined)
					GUIMessageTurboSpin.prototype.Show = function()
					{
						if (this.messages!= null && this.messages.length > 0)
						{
							var i = Random.Range(0, this.messages.length);
							this.label.text = this.messages[i];
						}
					
						this.gameObject.SetActive(true);
					};
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDisableFastPlayAndStopButton",
	ready:function()
	{
		return (window["VideoSlotsConnectionXTLayer"] != undefined);
	},
	apply:function()
	{
		if (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1)
		{
			var oVSCXTL_RS = VideoSlotsConnectionXTLayer.prototype.RequirementsSetup;
			VideoSlotsConnectionXTLayer.prototype.RequirementsSetup = function ()
			{
				ServerOptions.brandRequirements += ",NOST,NOFP";
				oVSCXTL_RS.apply(this, arguments);
			};
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchHideVolatilityInfo",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply:function()
	{
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && (UHT_GAME_CONFIG_SRC["region"] == "Asia" || IsRequired("NOVOL")))
		{
			var localizationRoot = globalRuntime.sceneRoots[1].GetComponentInChildren(LocalizationRoot);
			if (localizationRoot != null)
			{
				var transforms = localizationRoot.GetComponentsInChildren(Transform, true);
				for (var i = 0; i < transforms.length; i++)
				{
					if (transforms[i].gameObject.name.indexOf("VolatilityMeter") > -1)
						transforms[i].gameObject.SetActive(false);
				}
			}

			var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
			if (paytable.length == 0)
				paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
			
			if (paytable.length > 0)
			{
				var transforms = paytable[0].GetComponentsInChildren(Transform, true);
				for (var i = 0; i < transforms.length; i++)
				{
					if (transforms[i].gameObject.name.indexOf("VolatilityMeter") > -1)
					{
						if (transforms[i].parent != null)
							if (transforms[i].parent.gameObject.name != "RealContent")
								transforms[i].parent.gameObject.SetActive(false);
							else
								transforms[i].gameObject.SetActive(false);
					}

					if (transforms[i].gameObject.name.indexOf("VolatilityRuleLabel") > -1)
					{
						transforms[i].gameObject.SetActive(false);
					}
				}
			}
		}
	},
	retry:function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchHideRTPInfo",
	ready: function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["globalRuntime"] != undefined && globalRuntime.sceneRoots.length > 1);
	},
	apply: function()
	{
		var mustApply = false;
		if (window["UHT_GAME_CONFIG_SRC"] != undefined && UHT_GAME_CONFIG_SRC["region"] == "Asia")
			mustApply = true;
		if (UHT_GAME_CONFIG.STYLENAME.indexOf("weinet_") > -1)
			mustApply = true;
		var extrastylenames=["ggn_ggpoker","ggn_ggpokerok"];
		if (extrastylenames.indexOf(UHT_GAME_CONFIG.STYLENAME)>-1)
			mustApply = true;

		
		var stylenames=["solidrdge_intercasino","solidrdge_verajohn","solid2_verajohn","nkt_10bet","nkt_baazi247","nkt_bangbangcasino","nkt_bollytech","nkt_rtsm","nkt_unikrn","bv10","bv8","bv9","bv2","bv6","bv15","bv7","hg_casitabi","hg_casinome","hg_purecasino","hg_simplecasinojp","hub88_hub88asia","hub88_hub88slotsb2basia","btcnst_vbetasia"];
		if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME)>-1)
			mustApply = false;

		if (IsRequired("ALTNFO"))
			mustApply = true;

		if (IsRequired("FORCENFO"))
			mustApply = false;
		
		if (mustApply)
		{
			var gameHasRTPInfoSelector = window["RTPInfoSelector"] != undefined;
			if (gameHasRTPInfoSelector)
			{
				this.OnXTGameInit = function()
				{
					var rtpInfoTargets = globalRuntime.sceneRoots[1].GetComponentsInChildren(RTPInfoSelector, true);
					for (var i = 0; i < rtpInfoTargets.length; i++)
					{
						rtpInfoTargets[i].gameObject.SetActive(false);
					}
				}
				XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, this.OnXTGameInit, this);
			}
			{
				var paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable, true);
				if (paytable.length == 0)
					paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(Paytable_mobile, true);
				
				if (paytable.length == 0 && window["SCPaytable"])
					paytable = globalRuntime.sceneRoots[1].GetComponentsInChildren(SCPaytable, true);
				
				if (paytable.length > 0)
				{
					if (window["VarDisplayer"])
					{
						var rtpVarDisplayer = paytable[0].GetComponentsInChildren(VarDisplayer, true);
						for (var i = 0; i < rtpVarDisplayer.length; i++)
						{
							if (rtpVarDisplayer[i].variable.name == "ReturnToPlayer" || rtpVarDisplayer[i].variable.name == "ReturnToPlayerWithJackpot" || rtpVarDisplayer[i].variable.name == "ReturnToPlayerMinWithJackpot")
							{
								rtpVarDisplayer[i].label.transform.parent.gameObject.SetActive(false);
							}
						}
					}
					
					if (window["ValueDisplayer"])
					{
						var rtpValueDisplayer = paytable[0].GetComponentsInChildren(ValueDisplayer, true);
						for (var i = 0; i < rtpValueDisplayer.length; i++)
						{
							if (rtpValueDisplayer[i].actualVarName == "ReturnToPlayer" || rtpValueDisplayer[i].actualVarName == "ReturnToPlayerWithJackpot" || rtpValueDisplayer[i].actualVarName == "ReturnToPlayerMinWithJackpot")
							{
								rtpValueDisplayer[i].label.transform.parent.gameObject.SetActive(false);
							}
						}
					}
					
					if (window["AddVariablesToText"])
					{
						var rtpAddVariablesToText = paytable[0].GetComponentsInChildren(AddVariablesToText, true);
						for (var i = 0; i < rtpAddVariablesToText.length; i++)
						{
							for (var j = 0; j < rtpAddVariablesToText[i].someVariables.length; j++)
							{
								if (rtpAddVariablesToText[i].someVariables[j].variable.name == "ReturnToPlayer" || 
									rtpAddVariablesToText[i].someVariables[j].variable.name == "ReturnToPlayerWithJackpot" || 
									rtpAddVariablesToText[i].someVariables[j].variable.name == "ReturnToPlayerMinWithJackpot" ||
									rtpAddVariablesToText[i].someVariables[j].gameInfo_Name == "rtps"
									)
								{
									rtpAddVariablesToText[i].baseLabel.gameObject.SetActive(false);
								}
							}
						}
					}
				}
			}
		}
	},
	retry: function()
	{
		return window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"];
	}
});

UHTPatch({
	name: "PatchStagingWatermark",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined && window["DemoLabelPosition"] != undefined);
	},
	apply:function()
	{
		var hasWatermark = false; //UHT_GAME_CONFIG.watermark == "STAGING";
		if(hasWatermark)
		{
			DemoLabelPosition.prototype.OnGameInit = function()
			{
				this.showDemoCAT.Start();
				var labels = this.gameObject.GetComponentsInChildren(UILabel);
				if(labels)
				{
					var label = labels[0];
					label._text = "STAGING";
					label.color.r = label.color.g = label.color.b = 255;
					label.color.a = 0.05;
				}
			};						
		}
		else
		{
			DemoLabelPosition.prototype.OnGameInit = function(){};
		}			
				
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	}
});

UHTPatch({
	name: "PatchDontSendOpenCashierEvent",
	ready:function()
	{
		return (window["UHT_GAME_CONFIG"] != undefined);
	},
	apply:function()
	{
		var stylenames=["888_888casinouk","888_888casinoit","888_888casinoes","888_888casinodk","888_888casinose","888_888casinoro","888_888casinopt","888_888casinocom"];
		
		if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME)>-1)
			window["UHT_DISABLEOPENCASHIEREVENT"]=true;
	},
	retry:function()
	{
		return true;
	}
});

UHTPatch({
	name: "PatchSMMCloseGameEvent",
	ready:function()
	{
		return (window["SystemMessageManager"] != undefined) && (window["SystemMessageManager"]["CloseGame"] != undefined);
	},
	apply:function()
	{
		var oSMMCG = SystemMessageManager.CloseGame;
		SystemMessageManager.CloseGame = function()
		{
			UHTInterfaceBOSS.PostMessage("gameQuit");
			oSMMCG.apply(this, arguments);
		}
	},
	retry:function()
	{
		return true;
	}
});

UHTPatch({
	name: "PatchSRMIframe",
	ready:function()
	{
		return (window["SwedishRegulationManager"] != undefined);
	},
	apply:function()
	{
		SwedishRegulationManager.prototype.OnUHTResize = function(/**Object*/ unused)
		{
			var canv = document.getElementsByTagName("canvas")[0];
			var rgsParent = document.getElementsByClassName("RGSContainerActive")[0].dataset;
			var pixelRatio = UHTScreen.height / window.innerHeight;
			var scale = 1 - (rgsParent.height * pixelRatio / UHTScreen.height);
			var sign = (document.documentElement.className.indexOf("iPhone") >= 0 && document.documentElement.id == "Mobile" && window.orientation == 90 && !window.frameElement) ? 1 : -1;
			var transY = sign * ((rgsParent.height * pixelRatio / (UHTScreen.height - rgsParent.height * pixelRatio)) / 2) * 100 ;
			canv.style.transform = "scale(" + scale + ") translateY(" + transY + "%)";
		};
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
	interval: 100
});

var NOJRChecked = false;

function IsRequired(requirement, justCheck, useServerOptions)
{
	if (window["UHT_GAME_CONFIG_SRC"] == undefined)
		return false;
	
	if (!NOJRChecked)
	{
		NOJRChecked = true;
		if (IsRequired("NOJR", true))
		{
			window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements = "";
			window["UHT_GAME_CONFIG"].jurisdictionRequirements = "";
		}
	}

	var retValue = false;
	
	var reqs = (window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements + "," + window["UHT_GAME_CONFIG_SRC"].brandRequirements).split(',');
	if (useServerOptions)
		reqs = (ServerOptions.jurisdictionRequirements + "," + ServerOptions.brandRequirements).split(',');

	if ((window["UHT_GAME_CONFIG_SRC"]["replayMode"] == true) || (window["UHT_GAME_CONFIG_SRC"]["demoMode"]))
	{
		reqs.push("-SHONP");
		reqs.push("-SISU");
	}

	var reqs_processed = [];
	var reqs_delete = [];
	for (var i = 0; i < reqs.length; ++i)
	{
		if ((reqs[i] == "") || (reqs[i] == "undefined"))
			continue;
			
		var req = reqs[i];
		var splits = req.split("@");
		if (splits.length > 1)
		{
			if (splits[1] == window["UHT_GAME_CONFIG"]["GAME_SYMBOL"])
				req = splits[0];
			else
				req = "";
		}

		splits = req.split("*");
		if (splits.length > 1)
		{
			var isMini = window["UHT_GAME_CONFIG_SRC"]["minimode"] == '1';
			var isMobile = UHT_DEVICE_TYPE.MOBILE == true;
			var platform = (isMini?"MINI_":"")+(isMobile?"MOBILE":"DESKTOP");
			if (splits[1] == platform)
				req = splits[0];
			else
				req = "";
		}

		splits = req.split("~");
		if (splits.length > 1)
		{
			var currencies = splits[1].split(";");
			var found = false;
			for (var cIdx = 0; cIdx < currencies.length; cIdx++)
			{
				if (currencies[cIdx] == window["UHT_GAME_CONFIG_SRC"].currency)
				{
					req = splits[0];
					found = true;
				}
				if (currencies[cIdx] == "!"+window["UHT_GAME_CONFIG_SRC"].currencyOriginal)
				{
					req = splits[0];
					found = true;
				}
			}
			if (!found)
				req = "";
		}
		splits = req.split("]");
		if (splits.length > 1)
			if (req == "[" + window["UHT_GAME_CONFIG_SRC"].jurisdiction + "]" + splits[1])
				req = splits[1];
			else
				req = "";

		if (justCheck)
			if (req == requirement)
				return true;
			
		reqs_processed.push(req);
		
		if (req[0] == '-')
			reqs_delete.push(req);
	}
	
	if (justCheck)
		return false;
	
	for (var d = 0; d < reqs_delete.length; ++d)
	{
		for (var i = 0; i < reqs_processed.length; ++i)
		{
			if (reqs_delete[d] == '-' + reqs_processed[i])
				reqs_processed[i] = "";
			
			if (reqs_processed[i][0] == '-')
				reqs_processed[i] = "";
		}
	}
	for (var i = 0; i < reqs_processed.length; ++i)
	{
		if (reqs_processed[i] == requirement)
			retValue = true;
		else
			if (reqs_processed[i].split(":")[0] == requirement)
			{
				if (retValue == false)
					retValue = [];
				var reqVal = reqs_processed[i].split(":")[1];
				if (retValue.indexOf(reqVal)<0)
					retValue.push(reqVal);
			}
	}

	var reqs_string = reqs_processed.join(',');
	window["UHT_GAME_CONFIG_SRC"].jurisdictionRequirements = reqs_string;
	window["UHT_GAME_CONFIG_SRC"].brandRequirements = "";
	if(window["UHT_GAME_CONFIG"])
		window["UHT_GAME_CONFIG"].jurisdictionRequirements = reqs_string;
	
	if (window["ServerOptions"] != undefined)
	{
		ServerOptions.jurisdictionRequirements = reqs_string;
		ServerOptions.brandRequirements = "";
	}
	return retValue;
}

var timeoutPatchCurrency = null;
function PatchCurrency()
{
	if (timeoutPatchCurrency != null)
		clearTimeout(timeoutPatchCurrency);
	if (window["CurrencyPatch"] == undefined)
	{
		timeoutPatchCurrency = setTimeout(PatchCurrency, 100);
		return;
	}
	var map=[{c:"BYN",s:"Br"},{c:"PEN",s:"S/."},{c:"VND2",s:"K₫"},{c:"GEL",s:"₾"}];
	var ovrCS = IsRequired("OVR_CS");
	if (ovrCS != false)
		for (var i=0; i<ovrCS.length; i++)
			map.push({c:ovrCS[i].split(";")[0], s:ovrCS[i].split(";")[1]});
	var oICI = CurrencyPatch.prototype.InitCurrencyInfo;
	CurrencyPatch.prototype.InitCurrencyInfo = function()
	{
		for (var i=0; i<map.length; i++)
			this.currencies[map[i].c+"sym"] = map[i].s;
		
		this.languageFormats["id_dsep"]=".";this.languageFormats["id_dnum"]="2";this.languageFormats["id_gsep"]=",";this.languageFormats["id_gnum"]="3";this.languageFormats["id_symp"]="2";
		this.languageFormats["tr_dsep"]=",";this.languageFormats["tr_dnum"]="2";this.languageFormats["tr_gsep"]=".";this.languageFormats["tr_gnum"]="3";this.languageFormats["tr_symp"]="3";
		
		if (IsRequired("ES-419"))
		{
			this.languageFormats["es_dsep"]=".";this.languageFormats["es_gsep"]=",";this.languageFormats["es_symp"]="0";
		}
		
		var ret = oICI.apply(this, arguments);
		if (["mnsn_m88"].indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
		{
			ret.CurrencySymbol="";
			ret.CurrencyPositivePattern = 0;
			ret.CurrencyNegativePattern = 0;
		}
		
		var lastCharCode = ret.CurrencySymbol.charCodeAt(ret.CurrencySymbol.length-1);
		if ((lastCharCode >= 48) && (lastCharCode <= 57))
			if (ret.CurrencyPositivePattern == 0)
				ret.CurrencySymbol += " ";
		
		return ret;
	}
}
PatchCurrency();



UHTPatch({
	name: "PatchGA",
	ready:function()
	{
		return (window["Tracking"] != undefined);
	},
	apply:function()
	{
		if (IsRequired("NOGA"))
		{
			window["globalTracking"].QueuedEvents = [];
			window["globalTracking"].QueuedTimers = [];
			window["globalTracking"].SendEvent = function(){};
			window["globalTracking"].SendTimer = function(){};
			window["globalTracking"].StopTimerAndSend = function(){};
			return;
		}

		var spinCounter=0;
		
		var spinFastPlayCounter=0;
		var spinTurboCounter=0;
		var spinAutoPlayCounter=0;
		var spinResponseTimer=0;
		var spinWithCoinsCounter=0;
		
		var spinBatchSize=1;
		
		var oT_SE = Tracking.prototype.SendEvent;
		Tracking.prototype.SendEvent = function(category, action, value, type)
		{
			if (["SoundEnabled",
				"ORIENTATION_MOBILE_time_portrait",
				"ORIENTATION_MOBILE_time_landscape",
				"ORIENTATION_MOBILE_initial_portrait",
				"ORIENTATION_MOBILE_initial_landscape",
				"SND_MOBILE_download_started",
				"SND_setBackToON"
				].indexOf(arguments[1]) != -1)
				return;
			
			if (window["GrafanaFaroWebSdk"] != undefined)
			{
				if (category == "uht_spin")
				{
					if (action == "started_normal_spin_fastplay")
					{
						spinCounter++;
						spinFastPlayCounter += (XT.GetBool(Vars.FastPlay) ? 1 : 0);
						spinWithCoinsCounter += (XT.GetBool(Vars.HasCoins) ? 1 : 0);
					}
					
					if (action == "started_turbo_spin_fastplay")
					{
						spinCounter++;
						spinTurboCounter++;
						spinFastPlayCounter += (XT.GetBool(Vars.FastPlay) ? 1 : 0);
						spinWithCoinsCounter += (XT.GetBool(Vars.HasCoins) ? 1 : 0);
					}
						
					if (action == "finished_autospin")
					{
						spinAutoPlayCounter++;
					}
				}
				else
					window.GrafanaFaroWebSdk.faro.api.pushMeasurement(
					{
						type: 'Custom'+type,
						values:
						{
							value: value
						},
					},
					{
						context: 
						{
							category: category,
							symbol: ServerOptions.gameSymbol,
							action: action
						}
					}
				);
			}

			if (arguments[3] == "SpinTracker")
				arguments[3] = "ST" + SPIN_TRACKER_ID;
			if (arguments[1][0]=="_")
				arguments[1] = "E" + arguments[1];
			oT_SE.apply(this, arguments);
		}
		
		var oT_STAS = Tracking.prototype.StopTimerAndSend;
		Tracking.prototype.StopTimerAndSend = function(category, variable, type)
		{
			var oLength = globalTracking.QueuedTimers.length;
			oT_STAS.apply(this, arguments);
			if ((arguments[2] == "SpinTracker") && globalTracking.QueuedTimers.length > oLength)
			{
				globalTracking.QueuedTimers[globalTracking.QueuedTimers.length - 1].type = "ST" + SPIN_TRACKER_ID;
			}
			if (window["GrafanaFaroWebSdk"] != undefined)
			{
				var timer = this.GetTimerValue(category, variable, type);
				var values =
				{
					value: timer
				};
				
				if (category == "uht_spin")
				{
					if (variable == "time_response_received")
					{
						spinResponseTimer += timer;
						if (spinCounter >= spinBatchSize)
						{
							values["fastplayCount"] = spinFastPlayCounter;
							values["usingCoinsCount"] = spinWithCoinsCounter;
							values["turboCount"] = spinTurboCounter;
							values["autoplayCount"] = spinAutoPlayCounter;
							values["value"] = values["responsetimeAverage"] = ((spinResponseTimer / spinCounter) * 100 | 0) / 100;
							values["_batchsize"] = spinCounter;

							spinCounter=0;
							spinFastPlayCounter=0;
							spinTurboCounter=0;
							spinAutoPlayCounter=0;
							spinResponseTimer=0;
							
							if (spinBatchSize < 64)
								spinBatchSize *= 2;
						}
						else
							return;
					}
				}
				window.GrafanaFaroWebSdk.faro.api.pushMeasurement(
					{
						type: 'CustomTimer'+type,
						values: values,
					},
					{
						context: 
						{
							category: category,
							symbol: ServerOptions.gameSymbol,
							variable: variable
						}
					}
				);
			}
		}
	},
	retry:function()
	{
		return (window["Renderer"] == undefined);
	},
	interval: 10
});

var timeoutPatchTCU = null;
function PatchTCU()
{
	if (timeoutPatchTCU != null)
		clearTimeout(timeoutPatchTCU);
	if (window["TournamentConnection"] == undefined)
	{
		timeoutPatchTCU = setTimeout(PatchTCU, 10);
		return;
	}
	var oTCU = TournamentConnection.prototype.Update;
	TournamentConnection.prototype.Update = function()
	{
		this.isRacePrizesReloaded = true;
		oTCU.apply(this, arguments)
	}
	if (window["LobbyConnection"] != undefined)
	{
		var oFP = LobbyConnection.prototype.FindPromotion;
		LobbyConnection.prototype.FindPromotion = function()
		{
			if (this.promoResponse==null)
				return null;
			return oFP.apply(this, arguments)
		}
	}
	
	if (window["LobbyCategoriesManager"] != undefined)
		LobbyCategoriesManager.prototype.FindLocalizedLabel = function(/**string*/ name)
		{
			for (var i = 0; i < this.localizedLabels.length; ++i)
				if (this.localizedLabels[i].gameObject.name == name)
					return this.localizedLabels[i];

			return null;
		};
}
PatchTCU();

var timeoutPatchMCS_SQ = null;
function PatchMCS_SQ()
{
	if (timeoutPatchMCS_SQ != null)
		clearTimeout(timeoutPatchMCS_SQ);
	if (window["MoneyCollectSequence_ScarabQueen"] == undefined)
	{
		timeoutPatchMCS_SQ = setTimeout(PatchMCS_SQ, 1000);
		return;
	}
	var oMCS_SQ = MoneyCollectSequence_ScarabQueen.prototype.PatchAndProcessData;
	MoneyCollectSequence_ScarabQueen.prototype.PatchAndProcessData = function()
	{
		if (XT.GetObject(Vars.RandomMysterySymbolId) == null)
        	return;

		return oMCS_SQ.apply(this, arguments);
	}
}
PatchMCS_SQ();

var timeoutPatchSpinExciter = null;
function PatchSpinExciter()
{
	if (timeoutPatchSpinExciter != null)
		clearTimeout(timeoutPatchSpinExciter);
	if (window["VS_SpinExciter"] == undefined)
	{
		timeoutPatchSpinExciter = setTimeout(PatchSpinExciter, 10);
		return;
	}
	var oSAOR = VS_SpinExciter.prototype.SymbolAppearencesOnReel;
	VS_SpinExciter.prototype.SymbolAppearencesOnReel = function(symbolId, reelidx)
	{
		this.symbolId = symbolId;
		return oSAOR.call(this,symbolId, reelidx);
	}
}
PatchSpinExciter();

var timeoutPatchCustomMessagesLabels = null;
function PatchCustomMessagesLabels()
{
	if (timeoutPatchCustomMessagesLabels != null)
		clearTimeout(timeoutPatchCustomMessagesLabels);
	if (window["SystemMessageManager"] == undefined)
	{
		timeoutPatchCustomMessagesLabels = setTimeout(PatchCustomMessagesLabels, 10);
		return;
	}
	var oPT = SystemMessageManager.ProcessText;
	SystemMessageManager.ProcessText = function(text)
	{
		if (text != undefined)
			return oPT.call(this, text);
		else
			return text;
	}
}
PatchCustomMessagesLabels();

var timeoutPatchAGCC = null;
function PatchAGCC()  // AND CHINESE SOUND FOR PROMOTIONS
{
	if (timeoutPatchAGCC != null)
		clearTimeout(timeoutPatchAGCC);

	var fixed = false;
	
	if (window["globalRuntime"] != undefined)
		if (window["globalRuntime"].sceneRoots.length > 0)
		{
			var paths = [
				"UI Root/LoaderParent/Loader/AGCC", //agcc
				]
			
			var roots = globalRuntime.sceneRoots;

			for (var r = 0; r < roots.length; ++r)
			{
				for (var i = 0; i < paths.length; ++i)
				{
					var t = roots[r].transform.Find(paths[i]);
					if (t != null)
					{
						t.gameObject.transform.localScale(0.85, 0.85, 0.85);
					}
				}
			}
			
			// CHINESE SOUND
			
			if (globalRuntime.sceneRoots.length > 1)
			{
				if (window["PromotionContentSwitcher"] != undefined)
				{
					var pcs = globalRuntime.sceneRoots[1].GetComponentsInChildren(PromotionContentSwitcher, true);
					for (var s=0; s<pcs.length; s++)
					{
						var pc = pcs[s];
						for (var a=0; a<pc.asiaContents.length; a++)
						{
							var asp = pc.asiaContents[a].GetComponent(SoundPlayer);
							if (asp != null && a<pc.europeContents.length)
							{
								var esp = pc.europeContents[a].GetComponent(SoundPlayer);
								if (esp != null)
									asp.audioClip = esp.audioClip;
							}
						}
					}
				}
				fixed = true; //move this outside when reverting - this must remain
			}
		}
		
	if (!fixed)
	{
		timeoutPatchAGCC = setTimeout(PatchAGCC, 10);
		return;
	}
}
PatchAGCC();

var timeoutPatchCFullscreen = null;
function PatchCFullscreen()
{
	if (timeoutPatchCFullscreen != null)
		clearTimeout(timeoutPatchCFullscreen);
	
	if (window["screenfull"] != undefined)
	{
		var mustDisable = false;
		if ((navigator.userAgent.indexOf("Android") != -1) && ((navigator.userAgent.indexOf("wv") != -1) || (navigator.userAgent.indexOf("WebView") != -1)))
			mustDisable ||= IsRequired("NOFSW");
		else
			mustDisable ||= IsRequired("NOFSB");
		if (IsRequired("NOFS"))
			mustDisable = true;
		if (["pxlbt_pixelbetse", "pxlbt_pixelbet","yb_yabo","pxlbt_pixelbetde"].indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			mustDisable = true;
		if ((window["UHT_GAME_CONFIG_SRC"] != undefined) && (UHT_GAME_CONFIG_SRC["integrationType"] == "BETWAY"))
			mustDisable = true;
		
		if (mustDisable)
		{
			//Disable for some
			window["screenfull"]["request"] = function(elem) {};
		}
		else
		{
			//Handle it simpler for all the rest - Not that simple, but works in Chrome < 71 also now
			window["screenfull"]["request"] = function(elem)
			{
				var info = UAParser2();
				if ((info.os.name == "iOS") || (info.os.name == "Mac OS"))
					return;
				var request = this.raw.requestFullscreen;
				elem = elem || document.documentElement;
				elem[request]({navigationUI: "hide"});
			}
		}			
		return;
	}
	timeoutPatchCFullscreen = setTimeout(PatchCFullscreen, 10);
}
PatchCFullscreen();


var timeoutPatchFFSound = null;
var oCSR = null;
function PatchFFSound()
{
	if (timeoutPatchFFSound != null)
		clearTimeout(timeoutPatchFFSound);
	if (window["createjs"] != undefined)
		if (window["createjs"]["Sound"] != undefined)
			if (window["createjs"]["Sound"]["registerPlugins"] != undefined)
			{
				oCSR = createjs.Sound.registerPlugins;
				createjs.Sound.registerPlugins = function(arg)
				{
					if (arg.length > 1)
						return oCSR(arg);
					return false;
				};
				return;
			}
	timeoutPatchFFSound = setTimeout(PatchFFSound, 10);
}
PatchFFSound();


var timeoutPatchXTVars = null;
function PatchXTVars()
{
	if (timeoutPatchXTVars != null)
		clearTimeout(timeoutPatchXTVars);
	if (window["XT"] == undefined || window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchXTVars = setTimeout(PatchXTVars, 10);
		return;
	}
	var oXTRAI = XT.RegisterAndInit;
	XT.RegisterAndInit = function(go)
	{
		oXTRAI.call(this,go);
		
		// Disable autoplay
		var DisableAutoplay = false;
		var stylenames = ["NYX939", "atg_atg"];
		if (stylenames.indexOf(UHT_GAME_CONFIG.STYLENAME) > -1)
			DisableAutoplay = true;

		if (DisableAutoplay)
			if (Vars.Jurisdiction_DisableAutoplay != undefined)
				XT.SetBool(Vars.Jurisdiction_DisableAutoplay, true);

		// Instant autoplay
		var InstantAutoplay = false;
		if (UHT_GAME_CONFIG.STYLENAME == "_??????????????????????????????_")
			InstantAutoplay = true;

		if (InstantAutoplay)
			if (Vars.InstantAutoplay != undefined)
				XT.SetBool(Vars.InstantAutoplay, true);

			
	}
}
PatchXTVars();

var timeoutPatchCloseEvent = null;
function PatchCloseEvent()
{
	if (timeoutPatchCloseEvent != null)
		clearTimeout(timeoutPatchCloseEvent);
	if (window["UHTInterfaceBOSS"] == undefined)
	{
		timeoutPatchCloseEvent = setTimeout(PatchCloseEvent, 100);
		return;
	}
	var oOBU = window.onbeforeunload;
	window.onbeforeunload = function()
	{
		var lastEventIndex = globalTracking.QueuedEvents.length - 1;
		var willSend = true;
		if (lastEventIndex > -1)
		{
			var lastEventAction = globalTracking.QueuedEvents[lastEventIndex].action;
			if (lastEventAction.indexOf("OpenedFromLobby_") != -1)
				willSend = false;
			if (lastEventAction.indexOf("OpenedFromMultiLobby_") != -1)
				willSend = false;
		}
		if (willSend)
			UHTInterfaceBOSS.PostMessage("notifyCloseContainer");
		oOBU.call(this);
	}
}
PatchCloseEvent();


var timeoutPatchZeroSizeScreen = null;
function PatchZeroSizeScreen()
{
	if (timeoutPatchZeroSizeScreen != null)
		clearTimeout(timeoutPatchZeroSizeScreen);
	if (window["Camera"] == undefined)
	{
		timeoutPatchZeroSizeScreen = setTimeout(PatchZeroSizeScreen, 100);
		return;
	}
	var oCU = Camera.prototype.Update;
	Camera.prototype.Update = function()
	{
		if (UHTScreen.height == 0) UHTScreen.height = 1;
		if (UHTScreen.width == 0) UHTScreen.width = 1;
		oCU.call(this);
	}
}
PatchZeroSizeScreen();

var timeoutPatchEnableDesktopHomeButton = null;
function PatchEnableDesktopHomeButton()
{
	if (timeoutPatchEnableDesktopHomeButton != null)
		clearTimeout(timeoutPatchEnableDesktopHomeButton);
	
	if (window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchEnableDesktopHomeButton = setTimeout(PatchEnableDesktopHomeButton, 100);
		return;
	}
	var ShowHomeOnDesktop = false;
	var styleNameList = "sbod_sbotest,sbod_sbotry,sbod_sbobetvip,cer_casino999dk,cer_vikings".split(",");
	for (var i = 0; i < styleNameList.length; i++)
	{
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
		{
			ShowHomeOnDesktop = true;
			break;
		}
	}
	
	if (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1)
		ShowHomeOnDesktop = true;
	
	if (IsRequired("HBD"))
		ShowHomeOnDesktop = true;
	
	if (!ShowHomeOnDesktop)
		return;
	
	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1))
	{
		//SHOW HOME BUTTON
		var homePaths = [
			"UI Root/XTRoot/Root/GUI/Interface/Windows/MenuWindow/Content/Links/WithoutPromoUrl/Home", //show home button desktop WithoutPromoUrl
			"UI Root/XTRoot/Root/GUI/Interface/Windows/MenuWindow/Content/Links/WithPromoUrl/Home", //show home button desktop WithPromoUrl
			]
		
			for (var i = 0; i < homePaths.length; ++i)
			{
				var t = window["globalRuntime"].sceneRoots[1].transform.Find(homePaths[i]);
				if (t != null)
					t.gameObject.SetActive(true);
			}
		
	}
	else
	{
		timeoutPatchEnableDesktopHomeButton = setTimeout(PatchEnableDesktopHomeButton, 100);
	}
}
PatchEnableDesktopHomeButton();

var timeoutPatchHomeButtonDemoMode = null;
function PatchHomeButtonDemoMode()
{
	if (timeoutPatchHomeButtonDemoMode != null)
		clearTimeout(timeoutPatchHomeButtonDemoMode);
	
	if (window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchHomeButtonDemoMode = setTimeout(PatchHomeButtonDemoMode, 100);
		return;
	}
    
    var shouldPatch = false;
    if (window["UHT_GAME_CONFIG"]["demoMode"])
        shouldPatch = true;
		
	if (!shouldPatch)
		return;
	
	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1))
	{
        var OnRequestToCloseGame = function()
        {
            window.parent.postMessage(JSON.stringify({action: 'omni-api.goTo', actionData: 'lobby' }), '*');
        }
        XT.RegisterCallbackEvent(Vars.Evt_ToServer_CloseGame, OnRequestToCloseGame, this);	
	}
	else
	{
		timeoutPatchHomeButtonDemoMode = setTimeout(PatchHomeButtonDemoMode, 100);
	}
}
PatchHomeButtonDemoMode();

var timeoutPatchHidePPlogo = null;
function PatchHidePPlogo()
{
	if (window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchHidePPlogo = setTimeout(PatchHidePPlogo, 10);
		return;
	}
	var HideLogo = false;
	if (UHT_GAME_CONFIG.STYLENAME == "ebetgrp_ebet")
		HideLogo = true;

	if (UHT_GAME_CONFIG.STYLENAME == "vb-dafa")
		HideLogo = true;

	if (UHT_GAME_CONFIG.STYLENAME == "SBO")
		HideLogo = true;
	
	if (UHT_GAME_CONFIG.STYLENAME == "SB2")
		HideLogo = true;
	
	if (!HideLogo)
		return;
		
	if (timeoutPatchHidePPlogo != null)
		clearTimeout(timeoutPatchHidePPlogo);

	if (window["globalRuntime"] == undefined)
	{
		timeoutPatchHidePPlogo = setTimeout(PatchHidePPlogo, 10);
		return;
	}
	
	var paths = [
		"UI Root/XTRoot/Root/GUI/PragmaticPlayAnchor", //hide desktop tm
		"UI Root/XTRoot/Root/GUI_mobile/PragmaticPlayAnchor", //hide mobile tm
		"UI Root/LoaderParent/Loader/Logo", //hide client logo
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page2/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page4/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page6/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page8/Content/RealContent/CopyrightHolder", // hide QoG copyright

		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page2/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page4/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page6/Content/RealContent/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable_mobile/Paytable_landscape/Page8/Content/RealContent/CopyrightHolder", // hide QoG copyright
		
		"UI Root/XTRoot/Root/Paytable/Pages/Page1/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable/Pages/Page2/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable/Pages/Page3/CopyrightHolder", // hide QoG copyright
		"UI Root/XTRoot/Root/Paytable/Pages/Page4/CopyrightHolder" // hide QoG copyright

		]
	
	var roots = globalRuntime.sceneRoots;

    for (var r = 0; r < roots.length; ++r)
    {
        for (var i = 0; i < paths.length; ++i)
        {
            var t = roots[r].transform.Find(paths[i]);
            if (t != null)
                t.gameObject.SetActive(false);
        }
    }
	
	if (globalRuntime.sceneRoots.length < 2)
	{
		timeoutPatchHidePPlogo = setTimeout(PatchHidePPlogo, 10);
	}
}
PatchHidePPlogo();

var timeoutPatchRCCloseParentWindowRedirect = null;
function PatchRCCloseParentWindowRedirect()
{
    if (timeoutPatchRCCloseParentWindowRedirect != null)
		clearTimeout(timeoutPatchRCCloseParentWindowRedirect);
	
    if (window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchRCCloseParentWindowRedirect = setTimeout(PatchRCCloseParentWindowRedirect, 100);
		return;
	}
    
    var shouldPatch = false;
	var styleNameList = "isb_stoiximanro-prod,isb_stoiximanpt-prod,isb_stoiximangr-lux-prod,isb_stoiximande-lux-prod,isb_stoiximanbr-lux-prod,isb_sbtech_prod,isb_sbtech_prod-uk".split(",");
	for (var i = 0; i < styleNameList.length; i++)
	{
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
		{
			shouldPatch = true;
			break;
		}
	}

	if (!shouldPatch)
		return;
    
	if (window["SystemMessageManager"] == undefined)
	{
		timeoutPatchRCCloseParentWindowRedirect = setTimeout(PatchRCCloseParentWindowRedirect, 100);
		return;
	}
	
    SystemMessageManager.RCClose = function()
    {
        if (RCCloseURL != undefined)
        {
            if (RCCloseURL_Type == "notify")
            {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", RCCloseURL, true);
                xhr.send(null);
    
                UHTEventBroker.Trigger(UHTEventBroker.Type.Adapter, JSON.stringify({common: "EVT_CLOSE_GAME", args: null}));
            }
            else
                window.top.location.href = RCCloseURL;
        }
        else
            UHTEventBroker.Trigger(UHTEventBroker.Type.Adapter, JSON.stringify({common: "EVT_CLOSE_GAME", args: null}));
    };
}
PatchRCCloseParentWindowRedirect();

var timeoutPatchPlayNowButton = null;
function PatchPlayNowButton()
{
	if (timeoutPatchPlayNowButton != null)
		clearTimeout(timeoutPatchPlayNowButton);
	
	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1))
	{
        if (window["TournamentSimpleOptIn"] == undefined)
            return;

        var tSOI = globalRuntime.sceneRoots[1].GetComponentsInChildren(TournamentSimpleOptIn, true)[0];
        tSOI.RemoveButtonAndPatchText = function() {
            this.disableOptOut.Start();
            var roots = globalRuntime.sceneRoots;
            for (var i = 0; i < roots.length; i++)
                if (Globals.isMini) {
                    var joinNowLabel = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/Window/Bottom/Buttons/OptInLabel");
                    if (joinNowLabel != null) {
                        var label = joinNowLabel.transform.GetComponentsInChildren(UILabel, true)[0];
                        var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/NoMoneyWindow/Button/NoMoneyButtonLabel");
                        if (okLabelTransform != null)
                        {
                            var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
                            label.text = okLabel.text;
                        }
                    }
                    var buttonsParent = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/Window/Bottom/Buttons");
                    if (buttonsParent != null) {
                        var multipleLabelAnchor = buttonsParent.transform.GetComponentsInChildren(MultipleLabelAnchor, true)[0];
                        multipleLabelAnchor.ignoreInactiveLabels = true
                    }
                } else if (Globals.isMobile) {
                    var joinNowLabelLand = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Land/Buttons/JoinNowLabel");
                    if (joinNowLabelLand != null) {
                        var label = joinNowLabelLand.transform.GetComponentsInChildren(UILabel, true)[0];
                        var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Land/CloseButton/OkLabel");
                        if (okLabelTransform != null)
                        {
                            var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
                            label.text = okLabel.text;
                        }
                    }

                    var joinNowLabelPort = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/Buttons/OptIn/JoinNowLabel");
                    if (joinNowLabelPort != null) {
                        var label = joinNowLabelPort.transform.GetComponentsInChildren(UILabel, true)[0];
                        var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/QuickSpinArrangeable/QuickSpinAnimator/QuickSpin/Window/Content/Port/CloseButton/OkLabel");
                        if (okLabelTransform != null)
                        {
                            var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
                            label.text = okLabel.text;
                        }
                    }

                    var optInParent = roots[i].transform.Find("UI Root/XTRoot/Root/GUI_mobile/Tournament/PromotionsAnnouncer/Content/ContentAnimator/Content/Port/Buttons/OptIn");
                    if (optInParent != null) {
                        var pos = optInParent.transform.localPosition();
                        optInParent.transform.localPosition(pos.x, pos.y - 120, pos.z);
                        var label = optInParent.transform.GetComponentsInChildren(UILabel, true)[0];
                    }
                } else {
                    var joinNowLabel = roots[i].transform.Find("UI Root/XTRoot/Root/GUI/Tournament/Tournament/PromotionsAnnouncer/ContentAnimator/Content/Window/Buttons/JoinNowLabel");
                    if (joinNowLabel != null) {
                        var label = joinNowLabel.transform.GetComponentsInChildren(UILabel, true)[0];
                        var okLabelTransform = roots[i].transform.Find("UI Root/XTRoot/Root/GUI/QuickSpinAnimator/QuickSpin/Window/Content/CloseButton/OkLabel");
                        if (okLabelTransform != null)
                        {
                            var okLabel = okLabelTransform.transform.GetComponentsInChildren(UILabel, true)[0];
                            label.text = okLabel.text;
                        }
                    }
                }
        }
	}
	else
	{
		timeoutPatchPlayNowButton = setTimeout(PatchPlayNowButton, 100);
	}
}
PatchPlayNowButton();

var timeoutPatchSpinButtonColliderDesktop = null;
function PatchSpinButtonColliderDesktop()
{
	if (timeoutPatchSpinButtonColliderDesktop != null)
		clearTimeout(timeoutPatchSpinButtonColliderDesktop);
	
	var fixed = false;

	if (window["globalRuntime"] != undefined)
	{
		if (window["globalRuntime"].sceneRoots.length > 0)
		{
			if (Globals.isMobile)
				return;

			var paths = [
				"UI Root/XTRoot/Root/GUI/Interface/TopBar/RightGroup/SpinButtons/StartSpin_Button",
				"UI Root/XTRoot/Root/GUI/Interface/TopBar/RightGroup/SpinButtons/StopSpin_Button"
			]
			
			var roots = globalRuntime.sceneRoots;

			for (var r = 0; r < roots.length; ++r)
			{
				for (var i = 0; i < paths.length; ++i)
				{
					var t = roots[r].transform.Find(paths[i]);
					if (t != null)
					{
						var collider = t.GetComponentsInChildren(Collider, true)[0];
						if (collider != null)
						{
							collider.size.x = 80;
							collider.size.y = 80;
							collider.transform.SetAllDirtyUserFlags();
							fixed = true;
						}
					}
				}
			}
		}
	}
	
	if (!fixed)
	{
		timeoutPatchSpinButtonColliderDesktop = setTimeout(PatchSpinButtonColliderDesktop, 100);
		return;
	}
}
PatchSpinButtonColliderDesktop();

var timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers = null;
function FRBWrongTotalBetWhenMultipleBetLevelsMultipliers()
{
	if (timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers != null)
		clearTimeout(timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers);
	
	var fixed = false;

    if (window["BonusRoundsController"] != undefined)
    {
        if(UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs20fruitsw") == -1 && UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vs20sbxmas") == -1 && UHT_GAME_CONFIG.GAME_SYMBOL.indexOf("vswaysrhino") == -1)
        {
            BonusRoundsController.SetLines = function (lines)
            {
                XT.SetInt(Vars.BetToTotalBetMultiplier, lines);
                XT.SetInt(Vars.Lines, XT.GetBool(Vars.GameHasWaysInsteadOfLines) ? XT.GetInt(Vars.TotalNumberOfLines) : lines);
            }
        }
        fixed = true;
    }
	
	if (!fixed)
	{
		timeoutFRBWrongTotalBetWhenMultipleBetLevelsMultipliers = setTimeout(FRBWrongTotalBetWhenMultipleBetLevelsMultipliers, 100);
		return;
	}
}
FRBWrongTotalBetWhenMultipleBetLevelsMultipliers();

var timeoutPatchiOSLabelMultipleLayers = null;
function PatchiOSLabelMultipleLayers()
{
	if (timeoutPatchiOSLabelMultipleLayers != null)
		clearTimeout(timeoutPatchiOSLabelMultipleLayers);
		
	if (window["LabelMultipleLayers"] == undefined)
	{
		timeoutPatchiOSLabelMultipleLayers = setTimeout(PatchiOSLabelMultipleLayers, 100);
		return;
	}

	if ((window["safari"] != undefined) || (document.documentElement.className.indexOf("iOS") >= 0 && document.documentElement.className.indexOf("MobileSafari") >= 0))
	{
		var oLM_UT = LabelMultipleLayers.prototype.UpdateText;
		LabelMultipleLayers.prototype.UpdateText = function()
		{
			navigator.isCocoonJS = true;
			var oldWindowSafari = window["safari"];
			window["safari"] = {};
			oLM_UT.apply(this, arguments);
			navigator.isCocoonJS = false;
			window["safari"] = oldWindowSafari;
		}
	}
}
PatchiOSLabelMultipleLayers();

var timeoutPatchiOSStandaloneDisableFullscreen = null;
function PatchiOSStandaloneDisableFullscreen()
{
	if (timeoutPatchiOSStandaloneDisableFullscreen != null)
		clearTimeout(timeoutPatchiOSStandaloneDisableFullscreen);
	
	if (window["IPhone8Helper"] == undefined || window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchiOSStandaloneDisableFullscreen = setTimeout(PatchiOSStandaloneDisableFullscreen, 100);
		return;
	}

	var shouldDisable = false;
	var styleNameList = "isb,isb_netbetit-prod,isb_netbetcouk-prod,isb_netbetro-prod,1xbet,betb2b_betandyou,betb2b_fansportcom,betb2b_retivabet,betb2b_allnewgclub,betb2b_astekbet,betb2b_betwinner,betb2b_casinoz,betb2b_dbbet,betb2b_megapari,betb2b_oppabet,betb2b_gyzylburgutbet,betb2b_sapphirebet,betb2b_melbet,betb2b_play595,1xbet_1xbit,betb2b_aznbet,1xbet_sw,betb2b_sprutcasino,betb2b_1xslot,betb2b_22bet".split(",");
	for (var i = 0; i < styleNameList.length; i++)
	{
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
		{
			shouldDisable = true;
			break;
		}
	}

	if (navigator.standalone || shouldDisable)
	{
		IPhone8Helper.prototype.GameStarted = function(){return false};
	}
}
PatchiOSStandaloneDisableFullscreen();

var timeoutPatchDisableTurboSpin = null;
function PatchDisableTurboSpin()
{
	if (timeoutPatchDisableTurboSpin != null)
		clearTimeout(timeoutPatchDisableTurboSpin);
	
	if (window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutPatchDisableTurboSpin = setTimeout(PatchDisableTurboSpin, 100);
		return;
	}

	var shouldDisable = false;
	var styleNameList = "iforium_williamhill,iforium_willhilles,iforium_williamhilles,iforium,NYX1287,NYX897".split(",");
	for (var i = 0; i < styleNameList.length; i++)
	{
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
		{
			shouldDisable = true;
			break;
		}
	}
	if (UHT_GAME_CONFIG.STYLENAME.indexOf("gsys_gamesys") > -1)
		shouldDisable = true;
	
	if (UHT_GAME_CONFIG.GAME_SYMBOL != undefined && UHT_GAME_CONFIG.GAME_SYMBOL.substr(0,2) != "vs")
		return;
	
	if (window["XT"] == undefined || !window["XT"]["RegisterAndInitDone"] || ServerOptions.jurisdiction == null)
	{
		timeoutPatchDisableTurboSpin = setTimeout(PatchDisableTurboSpin, 100);
		return;
	}

	if (IsRequired("NOTS"))
		shouldDisable= true;
	
	if (!shouldDisable)
		return;

	var OnXTContinuousSpinChanged = function(/**boolean*/ isContinuousSpin)
	{
		if (isContinuousSpin)
			XT.SetBool(Vars.ContinuousSpin, false);
	};

	var OnXTGameInit = function()
	{
		if (Globals.isMobile)
		{
			var autoplay = window["AutoplayControllerMobile"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true) : [];
			for (var i = 0; i < autoplay.length; ++i)
			{
				var turboSpin = autoplay[i].transform.Find("Content/Checkboxes/TurboSpin");
				if (turboSpin != null)
					turboSpin.gameObject.SetActive(false);
			}

			var interfaces = window["InterfaceControllerMobile_1"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceControllerMobile_1, true) : [];
			for (var i = 0; i < interfaces.length; ++i)
			{
				var holdForTurbo = interfaces[i].transform.Find("ContentInterface/DynamicContent/AnchoredRight/Normal/SpinButtons/StartSpin_Button/HoldToAutoplay");
				if (holdForTurbo != null)
					holdForTurbo.gameObject.SetActive(false);
			}

			interfaces = window["InterfaceControllerMobile_2"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(InterfaceControllerMobile_2, true) : [];
			for (var i = 0; i < interfaces.length; ++i)
			{
				var holdForTurbo = interfaces[i].transform.Find("ContentInterface/DynamicContent/ContentScale/Normal/SpinButtons/StartSpin_Button/HoldToAutoplay");
				if (holdForTurbo != null)
					holdForTurbo.gameObject.SetActive(false);
			}
		}
		else
		{
			var autoplay = window["AutoplayControllerMobile"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerMobile, true) : [];
			for (var i = 0; i < autoplay.length; ++i)
			{
				var turboSpin = autoplay[i].transform.Find("Content/Checkboxes/TurboSpin");
				if (turboSpin != null)
					turboSpin.gameObject.SetActive(false);
			}
		}

		var advancedAutoplay = window["AutoplayControllerAdvanced"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(AutoplayControllerAdvanced, true) : [];
		for (var i = 0; i < advancedAutoplay.length; ++i)
		{
			var turboSpin = advancedAutoplay[i].transform.Find("Checkboxes/TurboSpin");
			if (turboSpin != null)
				turboSpin.gameObject.SetActive(false);
			
			turboSpin = advancedAutoplay[i].transform.Find("Clipped/Content/Checkboxes/TurboSpin");
			if (turboSpin != null)
				turboSpin.gameObject.SetActive(false);
		}

		var quickSpinWindow = window["QuickSpinWindowController"] ? globalRuntime.sceneRoots[1].GetComponentsInChildren(QuickSpinWindowController, true) : [];
		for (var i = 0; i < quickSpinWindow.length; ++i)
			quickSpinWindow[i].disableWindow.Start();
	};

	var OnXTContinuousSpinChanged = function(/**boolean*/ isContinuousSpin)
	{
		if (isContinuousSpin)
			XT.SetBool(Vars.ContinuousSpin, false);
	};

	XT.RegisterCallbackEvent(Vars.Evt_Internal_GameInit, OnXTGameInit, this);
	XT.RegisterCallbackBool(Vars.ContinuousSpin, OnXTContinuousSpinChanged, this);
	if (!Globals.isMobile)
	{
		if (window["GUIMessageTurboSpin"] != undefined)
			GUIMessageTurboSpin.prototype.Show = function()
			{
				if (this.messages!= null && this.messages.length > 0)
				{
					var i = Random.Range(0, this.messages.length);
					this.label.text = this.messages[i];
				}
			
				this.gameObject.SetActive(true);
			};
	}
}
PatchDisableTurboSpin();

var timeoutDisableHomeButtonMiniMode = null;
function DisableHomeButtonMiniMode()
{
	if (timeoutDisableHomeButtonMiniMode != null)
		clearTimeout(timeoutDisableHomeButtonMiniMode);
	
	if (window["UHT_GAME_CONFIG"] == undefined)
	{
		timeoutDisableHomeButtonMiniMode = setTimeout(DisableHomeButtonMiniMode, 100);
		return;
	}

	var shouldDisable = false;
	var styleNameList = "mnsn_m88,mnsn_happy8,mnsn_happy8stg,mnsn_m88stg,mnsn_happy8rc,mnsn_m88rc".split(",");
	for (var i = 0; i < styleNameList.length; i++)
	{
		if (UHT_GAME_CONFIG.STYLENAME == styleNameList[i])
		{
			shouldDisable = true;
			break;
		}
	}
	if (UHT_GAME_CONFIG.STYLENAME.indexOf("weinet_") > -1)
		shouldDisable = true;

	if (IsRequired("NOHBMINI"))
		shouldDisable = true;

	if (!shouldDisable)
		return;
	
	if (window["globalRuntime"] != undefined && (window["globalRuntime"].sceneRoots.length > 1))
	{
        if (Globals.isMini)
        {
            var homeButtonPath = "UI Root/XTRoot/Root/GUI_mobile/Interface_Portrait/ContentInterface/Windows/MenuWindow/Content/Home";
            var gameRoot = globalRuntime.sceneRoots[1];

            var t = gameRoot.transform.Find(homeButtonPath);
            if (t != null)
                t.gameObject.SetActive(false);
			XT.SetBool(Vars.Jurisdiction_GameLobbyInfoVisible, false);
        }
	}
	else
	{
		timeoutDisableHomeButtonMiniMode = setTimeout(DisableHomeButtonMiniMode, 100);
	}
}
DisableHomeButtonMiniMode();

var timeoutPatchMBUV = null;
function PatchMBUV()
{
	if (timeoutPatchMBUV != null)
		clearTimeout(timeoutPatchMBUV);
    
    if (window["MenuButton"] == undefined)
	{
		timeoutPatchMBUV = setTimeout(PatchMBUV, 100);
		return;
	}
	MenuButton.prototype.UpdateValue = function(uil, uis) {
        this.label.text = uil.text;
        this.label.fontName = uil.fontName;
        this.label.Prepare();
        GUIArranger.I.CopySprite(uis, this.icon);
        GUIArranger.I.CopySpriteSize(uis, this.icon);
        var uibuttons = this.button.gameObject.GetComponents(UIButton);
        for (var i = 0; i < uibuttons.length; i++)
            if (uibuttons[i].target == this.icon)
                uibuttons[i].normal = uis.spriteName
    }

	
}
PatchMBUV();
