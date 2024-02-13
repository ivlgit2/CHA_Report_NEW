sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/util/File",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/export/Spreadsheet"
], function (Controller, MessageBox, File, Export, ExportTypeCSV, Spreadsheet) {
	"use strict";

	return Controller.extend("bri.CHA_Report.controller.Report_List", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf bri.CHA_Report.view.Report_List
		 */
		 
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
			this.filterDataModel = this.getOwnerComponent().getModel("FiltersModel");
			this.getView().setModel(this.filterDataModel, "ComboModel");
			this.BOEData = this.getOwnerComponent().getModel("BOE_Model");
			this.getView().setModel(this.BOEData, "BOEModel");
			this.cmnModel = this.getOwnerComponent().getModel("CMN_Model");
			this.getView().setModel(this.cmnModel, "CMNModel");
			this.chaModel = this.getOwnerComponent().getModel("CHA_Model");
			this.headerCountModel = this.getOwnerComponent().getModel("TotalHederCount_Model");
		},

		_handleRouteMatched: function (oEvent) {
			this.getCHA(); //Default if cha logins
			var filterModel = new sap.ui.model.json.JSONModel();
			this.filteredData = {
				results: []
			};
			filterModel.setData(this.filteredData);
			this.getView().setModel(filterModel, "FilterData");
			/*Json For get All records*/
			/*this.chaDtls = {
				results: []
			};*/
			/**/
		},

		_OpenBusyDialog: function () {
			if (!this.bsdalog) {
				this.bsdalog = sap.ui.xmlfragment(this.getView().getId(), "bri.CHA_Report.view.fragments.BusyDialog", this);
				this.getView().addDependent(this.bsdalog);
			}
			this.bsdalog.open();
			/*jQuery.sap.delayedCall(1000, this, function () {
				this.bsdalog.close();
			});*/
		},
		_CloseBusyDialog: function () {
			this.bsdalog.close();
		},
		onSearch: function (oEvent) {
			if (!this.getView().byId("filterBar").isDialogOpen()) {
				var docnofrm,
					docnoto,
					opendate,
					opendatefrm,
					opendateto,
					splitdt,
					chacod,
					custboeno,
					shptyp,
					shpmod,
					port,
					blno,
					vchdt,
					chqdt,
					agnvchdt,
					agnchqdt,
					splitetarange,
					splitetafrom,
					Date_from,
					splitetato,
					Date_to,
					flag = 1;
				var that = this;
				docnofrm = this.getView().byId("docnoFrm").getValue();
				docnoto = this.getView().byId("docnoTo").getValue();
				chacod = this.getView().byId("idVendor").getValue();
				custboeno = this.getView().byId("idCustBOENo").getValue();
				shptyp = this.getView().byId("idShpTyp").getSelectedKey();
				shpmod = this.getView().byId("idShpMod").getSelectedKey();
				port = this.getView().byId("idPort").getValue();
				blno = this.getView().byId("idBLNo").getValue();
				vchdt = this.getView().byId("idvchdt").getValue();
				chqdt = this.getView().byId("idchqdt").getValue();
				agnvchdt = this.getView().byId("idagnvchdt").getValue();
				agnchqdt = this.getView().byId("idagnchqdt").getValue();
				var i = 0;
				// opendate = this.byId("openDate").getValue();
				var filters = new Array();
				var FilterVal;
				var sorters = new Array();
				var sortval;
				this.chaDtls = {
					results: []
				};
				var omodelData = new sap.ui.model.json.JSONModel();
				if (!CHA_Report.Formatter.checkEmpty(docnofrm) && !CHA_Report.Formatter.checkEmpty(docnoto) && !CHA_Report.Formatter.checkEmpty(
						chacod) && !CHA_Report.Formatter.checkEmpty(custboeno) && !CHA_Report.Formatter.checkEmpty(
						shptyp) && !CHA_Report.Formatter.checkEmpty(shpmod) && !CHA_Report.Formatter.checkEmpty(port) && !CHA_Report.Formatter.checkEmpty(
						blno) && !CHA_Report.Formatter.checkEmpty(vchdt) && !CHA_Report.Formatter.checkEmpty(chqdt) && !CHA_Report.Formatter.checkEmpty(
						agnvchdt) && !CHA_Report.Formatter.checkEmpty(agnchqdt)) { //&& !CHA_Report.Formatter.checkEmpty(opendate) && !CHA_Report.Formatter.checkEmpty(bu)
					this.getView().byId("tbDocuments").setVisible(false);
					this.getView().byId("dwnldBtn").setVisible(false);
					MessageBox.error("Please Filter Atleast By Any One Criteria");
					flag = 0;
					return false;
				}
				if (vchdt != "") {
					if (chqdt != "" || agnvchdt != "" || agnchqdt != "") {
						MessageBox.error("Please Filter By Any One Date");
						flag = 0;
						return false;
					}
				}
				if (chqdt != "") {
					if (vchdt != "" || agnvchdt != "" || agnchqdt != "") {
						MessageBox.error("Please Filter By Any One Date");
						flag = 0;
						return false;
					}
				}
				if (agnvchdt != "") {
					if (chqdt != "" || vchdt != "" || agnchqdt != "") {
						MessageBox.error("Please Filter By Any One Date");
						flag = 0;
						return false;
					}
				}
				if (agnchqdt != "") {
					if (chqdt != "" || vchdt != "" || agnvchdt != "") {
						MessageBox.error("Please Filter By Any One Date");
						flag = 0;
						return false;
					}
				}
				if (flag) {
					this._OpenBusyDialog();
					if (CHA_Report.Formatter.checkEmpty(docnofrm)) {
						FilterVal = new sap.ui.model.Filter("docnr", sap.ui.model.FilterOperator.EQ, docnofrm);
						filters.push(FilterVal);
					}
					if (CHA_Report.Formatter.checkEmpty(docnoto)) {
						if (CHA_Report.Formatter.checkEmpty(docnofrm)) {
							filters.pop();
							FilterVal = new sap.ui.model.Filter("docnr", sap.ui.model.FilterOperator.BT, docnofrm, docnoto);
							filters.push(FilterVal);
						} else {
							FilterVal = new sap.ui.model.Filter("docnr", sap.ui.model.FilterOperator.EQ, docnoto);
							filters.push(FilterVal);
						}
					}
					if (CHA_Report.Formatter.checkEmpty(chacod)) {
						FilterVal = new sap.ui.model.Filter("chacode", sap.ui.model.FilterOperator.EQ, chacod);
						filters.push(FilterVal);
					}
					if (CHA_Report.Formatter.checkEmpty(vchdt)) {
						splitetarange = vchdt.split(" to ");
						splitetafrom = splitetarange[0].split("/");
						Date_from = splitetafrom[2].trim() + "-" + splitetafrom[1].trim() + "-" + splitetafrom[0].trim();
						splitetato = splitetarange[1].split("/");
						Date_to = splitetato[2].trim() + "-" + splitetato[1].trim() + "-" + splitetato[0].trim();
						//	where = where+" and  Docdate eq '"+Date_from+"' and Date_to eq '"+Date_to+"'";

						FilterVal = new sap.ui.model.Filter("vchdt", sap.ui.model.FilterOperator.BT, Date_from, Date_to);
						/*filters.push(filterval);
						filterval = new sap.ui.model.Filter("docdate", sap.ui.model.FilterOperator.EQ, Date_to);*/
						filters.push(FilterVal);
					}
					if (CHA_Report.Formatter.checkEmpty(chqdt)) {
						splitetarange = chqdt.split(" to ");
						splitetafrom = splitetarange[0].split("/");
						Date_from = splitetafrom[2].trim() + "-" + splitetafrom[1].trim() + "-" + splitetafrom[0].trim();
						splitetato = splitetarange[1].split("/");
						Date_to = splitetato[2].trim() + "-" + splitetato[1].trim() + "-" + splitetato[0].trim();
						//	where = where+" and  Docdate eq '"+Date_from+"' and Date_to eq '"+Date_to+"'";

						FilterVal = new sap.ui.model.Filter("chqdt", sap.ui.model.FilterOperator.BT, Date_from, Date_to);
						/*filters.push(filterval);
						filterval = new sap.ui.model.Filter("docdate", sap.ui.model.FilterOperator.EQ, Date_to);*/
						filters.push(FilterVal);
					}
					if (CHA_Report.Formatter.checkEmpty(agnvchdt)) {
						splitetarange = agnvchdt.split(" to ");
						splitetafrom = splitetarange[0].split("/");
						Date_from = splitetafrom[2].trim() + "-" + splitetafrom[1].trim() + "-" + splitetafrom[0].trim();
						splitetato = splitetarange[1].split("/");
						Date_to = splitetato[2].trim() + "-" + splitetato[1].trim() + "-" + splitetato[0].trim();
						// where = where+" and Docdate eq '"+Date_from+"' and Date_to eq '"+Date_to+"'";

						FilterVal = new sap.ui.model.Filter("agnvchdt", sap.ui.model.FilterOperator.BT, Date_from, Date_to);
						/*filters.push(filterval);
						filterval = new sap.ui.model.Filter("docdate", sap.ui.model.FilterOperator.EQ, Date_to);*/
						filters.push(FilterVal);
					}
					/*Close A*/
					// if (CHA_Report.Formatter.checkEmpty(agnvchdt)) {
					// 	splitetarange = agnvchdt.split(" to ");
					// 	splitetafrom = splitetarange[0].split("/");
					// 	Date_from = splitetafrom[2].trim() + "-" + splitetafrom[1].trim() + "-" + splitetafrom[0].trim();
					// 	splitetato = splitetarange[1].split("/");
					// 	Date_to = splitetato[2].trim() + "-" + splitetato[1].trim() + "-" + splitetato[0].trim();
					// 	//	where = where+" and  Docdate eq '"+Date_from+"' and Date_to eq '"+Date_to+"'";

					// 	FilterVal = new sap.ui.model.Filter("agnvchdt", sap.ui.model.FilterOperator.BT, Date_from, Date_to);
					// 	/*filters.push(filterval);
					// 	filterval = new sap.ui.model.Filter("docdate", sap.ui.model.FilterOperator.EQ, Date_to);*/
					// 	filters.push(FilterVal);
					// }
					/**/
					if (CHA_Report.Formatter.checkEmpty(agnchqdt)) {
						splitetarange = agnchqdt.split(" to ");
						splitetafrom = splitetarange[0].split("/");
						Date_from = splitetafrom[2].trim() + "-" + splitetafrom[1].trim() + "-" + splitetafrom[0].trim();
						splitetato = splitetarange[1].split("/");
						Date_to = splitetato[2].trim() + "-" + splitetato[1].trim() + "-" + splitetato[0].trim();
						//	where = where+" and  Docdate eq '"+Date_from+"' and Date_to eq '"+Date_to+"'";

						FilterVal = new sap.ui.model.Filter("agnchqdt", sap.ui.model.FilterOperator.BT, Date_from, Date_to);
						/*filters.push(filterval);
						filterval = new sap.ui.model.Filter("docdate", sap.ui.model.FilterOperator.EQ, Date_to);*/
						filters.push(FilterVal);
					}
					/*if (CHA_Report.Formatter.checkEmpty(opendate)) {
						opendatefrm = opendate.split(" - ")[0];
						opendateto = opendate.split(" - ")[1];
						splitdt = opendatefrm.split("/");
						opendatefrm = splitdt[2].trim() + "-" + splitdt[1].trim() + "-" + splitdt[0].trim();
						splitdt = opendateto.split("/");
						opendateto = splitdt[2].trim() + "-" + splitdt[1].trim() + "-" + splitdt[0].trim();
						FilterVal = new sap.ui.model.Filter("ersda", sap.ui.model.FilterOperator.BT, opendatefrm, opendateto);
						filters.push(FilterVal);
						
					}*/

					sortval = new sap.ui.model.Sorter("docnr", true, false);
					sorters.push(sortval);
					/*Commented Bcz to get the total length from header records*/
					/*	this.chaModel.read("/xbrixi_iidcha", {
							urlParameters: {
								"$top": "5000",
								"$expand": "to_iidchacharge,to_charges"
							},
							filters: filters,
							sorters: sorters,
							success: function (getData) {
								if (getData.results.length > 0) {
									that.fnBindingData(getData);
								} else {
									that._CloseBusyDialog();
									MessageBox.error("No Matching Records Found!");
								}
							},
							error: function () {
								that._CloseBusyDialog();
							}
						});*/
					/*commented Close*/
					/*By Aswini For the Purpose of get the header count(customEntity */
					this.headerCountModel.read("/xBRIxCE_CHA_REPORTS(parameter_1='')/Set", {
						filters: filters,
						success: function (getData) {
							//	debugger;
							var totLength = getData.results[0].totalRecord;
							console.log("total length", totLength);
							var length = Math.ceil(totLength / 5000);
							that.mainServiceFunctn(i, length, filters, sorters);

						},
						error: function () {
							//	debugger;
						}
					});
				}
			}
		},
		/*Main Service*/
		mainServiceFunctn: function (i, length, filters, sorters) {
			//	debugger;

			var _self = this;
			var skipCount = i * 5000;
			//	var skipCount = i * 10;
			this.chaModel.read("/xbrixi_iidcha", {
				urlParameters: {
					"$skip": skipCount,
					"$top": "5000",

					//	"$top": "10",
					"$expand": "to_iidchacharge,to_charges"
				},
				filters: filters,
				sorters: sorters,
				success: function (getData) {
					//	debugger;
					i++
					if (getData.results.length > 0) {

						//	_self.fnBindingData(getData);
						_self.chaDtls.results = _self.chaDtls.results.concat(getData.results);
						if (i < length) {
							//	_self.fnBindingData(getData);
							_self.mainServiceFunctn(i, length, filters, sorters);
							//	_self.fnBindingData(_self.chaDtls);
							return false;
						} else {
							_self.fnBindingData(_self.chaDtls);
							return false;
							_self._CloseBusyDialog();
						}
					} else {
						_self._CloseBusyDialog();
						MessageBox.error("No Matching Records Found!");
					}
				},
				error: function () {
					_self._CloseBusyDialog();
				}
			});
		},
		/**/
		/*By Aswini For the Purpose of get the header count(customEntity  Code commented Close*/
		onClear: function (oEvent) {
			//FilterBar clear button action event
			//Code only to clear the values on the fb items do not change the view of the fb
			var i;
			var filterbaritems = oEvent.getParameters().selectionSet.length;
			for (i = 0; i < filterbaritems; i++) {
				//reset the value of each item on the filterbar
				oEvent.getParameters().selectionSet[i].setValue("");
			}
		},
		//End of onClear

		getCHA: function () {
			if (sap.ushell) {
				var _self = this;
				this.userId = sap.ushell.Container.getService("UserInfo").getId().toUpperCase();
				// this.userId = "NIKHILA.MOREIRA@IVLDSP.COM";
				// this.userId = "XXXX@YOPMAIL.COM";
				this.vendorDetails = {
					results: []
				};

				this.cmnModel.read("/vendor_email", {
					urlParameters: {
						"$top": "5000"
					},
					success: function (getData) {
						if (getData.results.length > 0) {
							//////////////////////////////////////////////////////Commented Aiswarya for getting vendoraccordng to CHA users and others usres//////////////////////////////////////////////////////////////////////////////////////
							// if (getData.results.filter(fil => fil.email_id == _self.userId && fil.cha == "X").length > 0) {
							// _self.byId("idVendor").setValueHelpOnly(true);
							// _self.chaCodelogin = getData.results.filter(fil => fil.email_id == _self.userId && fil.cha == "X")[0].lifnr;
							// _self.getView().byId("idVendor").setValue(_self.chaCodelogin);
							// _self.vendorDetails.results = getData.results.filter(fil => fil.email_id == _self.userId && fil.cha == "X");
							/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
						_self.vendorDetails.results = getData.results.filter(fil => fil.email_id == _self.userId && fil.cha == "X");
							//_self.vendorDetails.results = getData.results.filter(fil =>  fil.cha == "X");
							if (_self.vendorDetails.results.length > 0) {
								_self.chaCodelogin = _self.vendorDetails.results[0].lifnr;
								_self.getView().byId("idVendor").setValue(_self.chaCodelogin);
								if (_self.vendorDetails.results.length == 1) {
									_self.byId("idVendor").setEnabled(false);
								} else {
									_self.byId("idVendor").setEnabled(true);
								}
							}else {
								var array = getData.results;
								var result = Array.from(new Set(array.map(s => s.lifnr))).map(id => {
									return {
										lifnr: id,
										name1: array.find(s => s.lifnr == id).name1,
										cha: array.find(s => s.lifnr == id).cha,
										chacode: array.find(s => s.lifnr == id).chacode,
										email_id: array.find(s => s.lifnr == id).email_id
									}
								});
								getData.results = result;
								_self.vendorDetails.results = getData.results;
								_self.byId("idVendor").setValueHelpOnly(false);
								_self.byId("idVendor").setEnabled(true); //Added Aiswarya 9/2/2024
							}
							var oModelData = new sap.ui.model.json.JSONModel([]);
							oModelData.setData(_self.vendorDetails);
							_self.getView().setModel(oModelData, "VendorNosearchHelp");
						}
					},
					error: function (response) {
						console.log(response);
					}
				});
			}
		},

		handleReqVendorValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.vendorDialog) {
				this.vendorDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogVendor", this);
				this.getView().addDependent(this.vendorDialog);
			}
			this.vendorDialog.open();
		},

		_handleValueHelpSearch_Vendor: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"chacode",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose_Vendor: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					this.getView().byId(this.inputId).setValue(oSelectedItem);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		SelectDocNo: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (CHA_Report.Formatter.checkEmpty(this.getView().byId("idVendor").getValue())) {
				var filters = new Array();
				var filterval = new sap.ui.model.Filter({
					path: "chacode",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.getView().byId("idVendor").getValue()
				});
				filters.push(filterval);
				var filterData = {
					xbrixi_iidcha: []
				};
				var that = this;
				this.chaModel.read("/xbrixi_iidcha", {
					urlParameters: {
						"$top": "5000"
					},
					filters: filters,
					success: function (oData) {
						filterData.xbrixi_iidcha = oData.results;
						var oModel = new sap.ui.model.json.JSONModel([]);
						oModel.setData(filterData);
						that.getView().setModel(oModel, "docnoModel");
						if (!that.docnoDialog) {
							that.docnoDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogDocNo", this);
							that.getView().addDependent(that.docnoDialog);
						}
						that.docnoDialog.open();
					},
					error: function (response) {
						console.log("error");
					}
				});
			} else {
				if (!this.docnoDialog) {
					this.docnoDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogDocNo", this);
					this.getView().addDependent(this.docnoDialog);
				}
				this.getView().setModel(this.getOwnerComponent().getModel("CHA_Model"), "docnoModel");
				this.docnoDialog.open();
			}
		},

		_handleValueHelpSearch_ReqNoTo: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"docnr",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose_ReqNoTo: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					this.getView().byId(this.inputId).setValue(oSelectedItem);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		_getBOEDetails: function (docnr) {
			var filters = new Array();
			var FilterVal;
			FilterVal = new sap.ui.model.Filter("docno", sap.ui.model.FilterOperator.EQ, docnr);
			filters.push(FilterVal);
			this.BOEData.read("/xBRIxi_iidbehdr", {
				urlParameters: {
					"$top": "5000",
					"$expand": "to_itemdetails"
				},
				async: true,
				filters: filters,
				success: function (getData) {
					if (getData.results.length > 0) {

					} else {
						MessageBox.error("No Matching Records Found!");
					}
				},
				error: function () {

				}
			});
		},

		fnBindingData: function (getData) {
			var i, j, k, l, m;
			var iidchalength = 0,
				iidchareflength = 0,
				iidchachrgelength = 0;
			this.filteredData = {
				results: []
			};
			var tempData = {
				results: []
			};
			var tempDataIIDCHA = {
				results: []
			};
			var tempDataIIDCHARef = {
				results: []
			};
			var jsonData = {};
			this.keys = new Array();
			var iidcharef;
			var iidchachrge;
			tempData.results[0] = JSON.parse(JSON.stringify(getData.results[0]));
			iidcharef = tempData.results[0].to_charges;
			iidchachrge = tempData.results[0].to_iidchacharge;
			this.deleteMetadata(tempData.results[0]);
			this.deleteMetadata(iidcharef.results[0]);
			this.deleteMetadata(iidchachrge.results[0]);
			iidchalength = this.getKeys(tempData.results[0], iidchalength);
			iidchareflength = this.getKeys(iidcharef.results[0], iidchalength);
			iidchachrgelength = this.getKeys(iidchachrge.results[0], iidchareflength);
			for (i = 0; i < getData.results.length; i++) {
				jsonData = {};
				iidcharef = getData.results[i].to_charges;
				iidchachrge = getData.results[i].to_iidchacharge;
				this.deleteMetadata(getData.results[i]);
				for (k = 0; k < iidchalength; k++) {

					jsonData[this.keys[k]] = getData.results[i][this.keys[k]];
				}
				for (j = 0; j < iidcharef.results.length; j++) {
					this.deleteMetadata(iidcharef.results[j]);
					tempDataIIDCHA.results = JSON.parse(JSON.stringify(jsonData));
					for (k = iidchareflength; k > iidchalength; k--) {
						tempDataIIDCHA.results[this.keys[k]] = iidcharef.results[j][this.keys[k]];
						/*if (this.keys[k] == 'docno') {
							this._getBOEDetails(iidcharef.results[j][this.keys[k]]);
						}*/
					}
					for (l = 0; l < iidchachrge.results.length; l++) {
						this.deleteMetadata(iidchachrge.results[l]);
						tempDataIIDCHARef.results = JSON.parse(JSON.stringify(tempDataIIDCHA.results));
						for (k = iidchachrgelength; k > iidchareflength; k--) {
							if (this.keys[k] != undefined && this.keys[k].match('catyp')) {
								if (iidchachrge.results[l][this.keys[k]].match('C')) {
									tempDataIIDCHARef.results[this.keys[k]] = 'Reimbursement';
								} else {
									tempDataIIDCHARef.results[this.keys[k]] = 'Agency';
									tempDataIIDCHARef.results["vchdt"] = getData.results[i]["agnvchdt"];
									tempDataIIDCHARef.results["chqdt"] = getData.results[i]["agnchqdt"];
									tempDataIIDCHARef.results["paydt"] = getData.results[i]["agnpaydt"];
								}
							} else {
								tempDataIIDCHARef.results[this.keys[k]] = iidchachrge.results[l][this.keys[k]];
							}
						}
						this.filteredData.results.push(tempDataIIDCHARef.results);
					}
					if (iidchachrge.results.length == 0) {
						this.filteredData.results.push(tempDataIIDCHA.results);
					}
				}
			}

			var
			// bu,
				custboeno,
				shptyp,
				shpmod,
				port,
				blno,
				vchdt,
				chqdt,
				agnvchdt,
				agnchqdt;

			custboeno = this.getView().byId("idCustBOENo").getValue();
			shptyp = this.getView().byId("idShpTyp").getValue();
			shpmod = this.getView().byId("idShpMod").getValue();
			port = this.getView().byId("idPort").getValue();
			blno = this.getView().byId("idBLNo").getValue();
			vchdt = this.getView().byId("idvchdt").getValue();
			agnvchdt = this.getView().byId("idagnvchdt").getValue();
			/*chqdt = this.getView().byId("idchqdt").getValue();
			
			agnchqdt = this.getView().byId("idagnchqdt").getValue();*/
			if (CHA_Report.Formatter.checkEmpty(custboeno)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.shpbilno == custboeno);
			}
			if (CHA_Report.Formatter.checkEmpty(shptyp)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.shptyp == shptyp);
			}
			if (CHA_Report.Formatter.checkEmpty(shpmod)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.modtran == shpmod);
			}
			if (CHA_Report.Formatter.checkEmpty(port)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.port == port);
			}
			if (CHA_Report.Formatter.checkEmpty(blno)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.bolnr == blno);
			}
			/*if (CHA_Report.Formatter.checkEmpty(vchdt) || CHA_Report.Formatter.checkEmpty(chqdt) || CHA_Report.Formatter.checkEmpty(agnvchdt) ||
				CHA_Report.Formatter.checkEmpty(agnchqdt)) {
				var condn = "this.filteredData.results.filter(a => a.";
				if (CHA_Report.Formatter.checkEmpty(vchdt)) {
					vchdt = vchdt + ".000Z";
					condn = condn + "vchdt == '" + vchdt + "'";
				}
				if (CHA_Report.Formatter.checkEmpty(chqdt)) {
					chqdt = chqdt + ".000Z";
					condn = condn + " && a.chqdt == '" + chqdt + "'";
				}
				if (CHA_Report.Formatter.checkEmpty(agnvchdt)) {
					agnvchdt = agnvchdt + ".000Z";
					condn = condn + " && vchdt == '" + agnvchdt + "'";
				}
				if (CHA_Report.Formatter.checkEmpty(agnchqdt)) {
					agnchqdt = agnchqdt + ".000Z";
					condn = condn + " && a.chqdt == '" + agnchqdt + "'";
				}
				condn = condn + ")";
				this.filteredData.results = eval(condn);

			}*/
			/*	if (CHA_Report.Formatter.checkEmpty(chqdt)) {
					this.filteredData.results = this.filteredData.results.filter(a => a.chqdt == chqdt + ".000Z");
				}
				if (CHA_Report.Formatter.checkEmpty(agnvchdt)) {
					this.filteredData.results = this.filteredData.results.filter(a => a.vchdt == agnvchdt + ".000Z");
				}
				if (CHA_Report.Formatter.checkEmpty(agnchqdt)) {
					this.filteredData.results = this.filteredData.results.filter(a => a.chqdt == agnchqdt + ".000Z");
				}*/
			if (CHA_Report.Formatter.checkEmpty(vchdt)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.catyp == 'Reimbursement');
			}
			if (CHA_Report.Formatter.checkEmpty(agnvchdt)) {
				this.filteredData.results = this.filteredData.results.filter(a => a.catyp == 'Agency');
			}
			if (this.filteredData.results.length <= 0) {
				this.getView().byId("tbDocuments").setVisible(false);
				this.getView().byId("dwnldBtn").setVisible(false);
				this._CloseBusyDialog();
				MessageBox.error("No Matching Records Found!");
			} else {
				var sortedArray = {};
				var sortedArray1 = {};
				/*	var array = {};
					sortedArray = this.filteredData.results.filter(a => a.catyp == 'Reimbursement');
					sortedArray1 = this.filteredData.results.filter(a => a.catyp == 'Agency');
					array = sortedArray.concat(sortedArray1);
					this.filteredData.results = array*/
				this._FnSetAndRefreshModel("FilterData", this.filteredData);
				this.getView().byId("doctitle").setTitle("Documents (" + this.filteredData.results.length + ")");
				this.getView().byId("prevBtn").setVisible(false);
				this.getView().byId("nextBtn").setVisible(true);
				this.getView().byId("tbDocuments").setVisible(true);
				this.getView().byId("dwnldBtn").setVisible(true);
				this.getView().byId("dwnldBtn").setVisible(true);
				this.prev = 0;
				this.curr = 0;
				this.next = this.curr + 1;
				this.primaryModel = new sap.ui.model.json.JSONModel({
					visible: true
				});
				this.getView().setModel(this.primaryModel, "primaryState");
				this.secondaryModel = new sap.ui.model.json.JSONModel({
					visible: false
				});
				this.getView().setModel(this.secondaryModel, "secondaryState");
				this.tertiaryModel = new sap.ui.model.json.JSONModel({
					visible: false
				});
				this.getView().setModel(this.tertiaryModel, "tertiaryState");
				this.quaternaryModel = new sap.ui.model.json.JSONModel({
					visible: false
				});
				this.getView().setModel(this.quaternaryModel, "quaternaryState");
				this.quinaryModel = new sap.ui.model.json.JSONModel({
					visible: false
				});
				this.getView().setModel(this.quinaryModel, "quinaryState");
				this._CloseBusyDialog();
			}
		},

		getKeys: function (json, len) {
			for (var z in json) {
				len++;
				this.keys.push(z);
			}
			return len;
		},

		_FnSetAndRefreshModel: function (modelname, value) {
			this.getView().getModel(modelname).setData(value);
			this.getView().getModel(modelname).refresh(true);
		},

		deleteMetadata: function (json) {
			if (json != undefined) {
				delete json.__metadata;
				delete json.to_cfsnam;
				delete json.to_Curr;
				delete json.to_Currency;
				delete json.to_dragefrtme;
				delete json.to_dtnfredys;
				delete json.to_charges;
				delete json.to_iidchacharge;
				delete json.to_cha;
				delete json.to_iidcha;
			}
		},

		onPressLessDetails: function (oEvent) {
			this.next = this.curr;
			this.curr = this.prev;
			this.prev = this.prev - 1;
			if (this.prev == -1) {
				this.prev = 0;
			}
			if (this.next == 1) {
				this.next = 1;
				this.getView().getModel("primaryState").setProperty("/visible", true)
				this.getView().getModel('secondaryState').setProperty("/visible", false);
				this.getView().getModel('tertiaryState').setProperty("/visible", false);
				this.getView().getModel('quaternaryState').setProperty("/visible", false);
				this.getView().byId("prevBtn").setVisible(false);
				this.getView().byId("nextBtn").setVisible(true);
			}
			if (this.next == 2) {
				this.getView().getModel("primaryState").setProperty("/visible", false)
				this.getView().getModel('secondaryState').setProperty("/visible", true);
				this.getView().getModel('tertiaryState').setProperty("/visible", false);
				this.getView().getModel('quaternaryState').setProperty("/visible", false);
				this.getView().byId("prevBtn").setVisible(true);
				this.getView().byId("nextBtn").setVisible(true);
			}
			if (this.next == 3) {
				this.getView().getModel("primaryState").setProperty("/visible", false)
				this.getView().getModel('secondaryState').setProperty("/visible", false);
				this.getView().getModel('tertiaryState').setProperty("/visible", true);
				this.getView().getModel('quaternaryState').setProperty("/visible", false);
				this.getView().byId("prevBtn").setVisible(true);
				this.getView().byId("nextBtn").setVisible(true);
			}
		},

		onPressMoreDetails: function (oEvent) {
			this.prev = this.curr;
			this.curr = this.next;
			this.next = this.curr + 1;
			if (this.curr == 1) {
				this.getView().getModel("primaryState").setProperty("/visible", false)
				this.getView().getModel('secondaryState').setProperty("/visible", true);
				this.getView().getModel('tertiaryState').setProperty("/visible", false);
				this.getView().getModel('quaternaryState').setProperty("/visible", false);
				this.getView().byId("prevBtn").setVisible(true);
				this.getView().byId("nextBtn").setVisible(true);
			}
			if (this.curr == 2) {
				this.getView().getModel("primaryState").setProperty("/visible", false)
				this.getView().getModel('secondaryState').setProperty("/visible", false);
				this.getView().getModel('tertiaryState').setProperty("/visible", true);
				this.getView().getModel('quaternaryState').setProperty("/visible", false);
				this.getView().byId("prevBtn").setVisible(true);
				this.getView().byId("nextBtn").setVisible(true);
			}
			if (this.curr == 3) {
				this.getView().getModel("primaryState").setProperty("/visible", false)
				this.getView().getModel('secondaryState').setProperty("/visible", false);
				this.getView().getModel('tertiaryState').setProperty("/visible", false);
				this.getView().getModel('quaternaryState').setProperty("/visible", true);
				this.getView().byId("prevBtn").setVisible(true);
				this.getView().byId("nextBtn").setVisible(false);
				this.next = 3;
			}
			this.getView().getModel('primaryState').refresh();
			this.getView().getModel('secondaryState').refresh();
			this.getView().getModel('tertiaryState').refresh();
			this.getView().getModel('quaternaryState').refresh();
		},

		onDownloadData: function (oEvent) {
			var header = [];
			var data = [];
			var row = {};
			var id = {};
			var oSettings;
			var oSheet;
			var i, j;
			var columnName;
			var formatted_Date;
			var colVal;
			// var txt = "<table>";
			var rows = this.byId("tbDocuments").getBinding().oList;
			var columns = this.byId("tbDocuments").getAggregation("columns");
			// txt += "<tr>";
			for (i = 0; i < columns.length; i++) {
				row = {};
				row.label = columns[i].getLabel().getText();
				// txt += " <th> " + row.label + " </th>";
				row.property = columns[i].getId().split("-")[2];
				row.type = "String";
				header.push(row);
			}
			// txt += "</tr>";
			for (i = 0; i < this.filteredData.results.length; i++) {
				// txt += "<tr>";
				row = {};
				for (j = 0; j < header.length; j++) {
					columnName = header[j].property;
					colVal = this.filteredData.results[i][columnName];
					var conditions = ["billdt",
						"thpvend_bildt",
						"vchdt",
						"chqdt",
						"paydt",
						"shpbildt"
					];
					row[columnName] = conditions.some(el => columnName.includes(el)) ? CHA_Report.Formatter.formatDate(colVal) : colVal;
					// txt += "<td>" + row[columnName] + "</td>";
				}
				data.push(row);
			}
			// txt += "</table>";
			// File.save(txt, "file1", "html");
			oSettings = {
				workbook: {
					columns: header,
					context: {
						sheetName: "Sheet1"
					}
				},
				dataSource: data,
				fileName: "CHA Charges" + ".xlsx"
			};
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {})
				.finally(function () {
					oSheet.destroy();
				});
		},

		handleReqBUValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.buDialog) {
				this.buDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogBU", this);
				this.getView().addDependent(this.buDialog);
			}
			this.buDialog.open();
		},

		_handleValueHelpSearch_BU: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"bsuunit",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpClose_BU: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					this.getView().byId(this.inputId).setValue(oSelectedItem);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleReqCustBOENoValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.cbnDialog) {
				this.cbnDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogCBN", this);
				this.getView().addDependent(this.cbnDialog);
			}
			this.cbnDialog.open();
		},
		_handleValueHelpSearch_CBN: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"impdpsno",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpClose_CBN: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					this.getView().byId(this.inputId).setValue(oSelectedItem);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleReqPortValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.prtDialog) {
				this.prtDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogPort", this);
				this.getView().addDependent(this.prtDialog);
			}
			this.prtDialog.open()
		},
		_handleValueHelpSearch_Port: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"coddesc",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpClose_Port: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					this.getView().byId(this.inputId).setValue(oSelectedItem);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleReqBLNoValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.blnoDialog) {
				this.blnoDialog = sap.ui.xmlfragment("bri.CHA_Report.view.fragments.dialogBLNo", this);
				this.getView().addDependent(this.blnoDialog);
			}
			this.blnoDialog.open()
		},
		_handleValueHelpSearch_BLNo: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"bolnr",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpClose_BLNo: function (oEvent) {
			if (oEvent.getParameter("selectedItem")) {
				var oSelectedItem = oEvent.getParameter("selectedItem").getTitle();
				if (oSelectedItem) {
					this.getView().byId(this.inputId).setValue(oSelectedItem);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		}

	});

});