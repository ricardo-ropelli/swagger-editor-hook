import React, {Component} from 'react';
import './bootstrap/bootstrap.min.css';
import './css/custom.css';
import axios from 'axios';
import cookie from 'react-cookies';
import { ToastContainer, toast } from 'react-toastify';
import MsgError, {getErrorToastProps} from './MessageError.js';
import MsgSuccess, {getSuccessToastProps} from './MessageSuccess.js';
import json2yaml from "json2yaml";
import YAML from "js-yaml";

/**
 * TODO: Tentar remover o código duplicado entre os métodos.
 * Em alguns casos foi necessário pois o construtor montava objeto com headers ainda
 * undefined pois no topbar do editor, tinha a promise que ainda não tinha sido resolvida.
 */
export default class ManagerSwaggerHeader extends Component {
  
  static getXSRFToken() {
    var queryString = require('query-string');
    var parsed = queryString.parse(window.location.search);
    var managerURL = parsed.managerURL;
    var authToken = parsed.authToken;

    if (!managerURL) {
      var error = {response: {status: 400}}
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }

    var backendManagerToPerformSaveOrUpdate = managerURL.concat("endpoint-to-get-XSRF-token");
    var requestConfig = {
      headers: { 'Auth-Token': authToken }
    };
    
    return axios.get(backendManagerToPerformSaveOrUpdate, requestConfig);
  }

  static parseJSONtoYAML(json) {
    var conv = json2yaml.stringify(json);
    conv = conv.replace("---", "").replace("\n", "");
    return conv;
  }
  
  static getSwaggerFromManager() {
    var queryString = require('query-string');
    var parsed = queryString.parse(window.location.search);
    var managerURL = parsed.managerURL;
    var revisionId = parsed.revId;
    var authToken = parsed.authToken;
  
    if (!managerURL) {
      var error = {response: {status: 400}}
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }

    var backendManagerToPerformSaveOrUpdate = managerURL.concat("endpoint-to-get-swagger-content");
    var requestConfig = {
      headers: { 'Auth-Token': authToken,
                 'XSRF-TOKEN': localStorage.getItem("XSRF-Token") }
    };

    return axios.get(backendManagerToPerformSaveOrUpdate, requestConfig);
  }

  constructor(props) {
    super(props);
    var queryString = require('query-string');
    var parsed = queryString.parse(window.location.search);
    this.managerURL = parsed.managerURL;
    this.apiId = parsed.apiId;
    this.revisionId = parsed.revId; /* Essa variavel é sobreescrita caso usuário salve como uma nova revisão */
    this.callBack = parsed.callBack;
    this.revisionNumber = parsed.revisionNumber;
    this.authToken = parsed.authToken;
    this.xsrfToken = null;

    if (!this.managerURL) return;
    this.backendManagerToPerformSaveOrUpdate = this.managerURL.concat("endpoint-to-get-swagger-content");

    this.callbackToApisList = this.callbackToApisList.bind(this);
    this.callbackToApiOverview = this.callbackToApiOverview.bind(this);
    this.callbackToApiEditingApiStep = this.callbackToApiEditingApiStep.bind(this);
    this.callbackToApiEditingResourceStep = this.callbackToApiEditingResourceStep.bind(this);
    this.backToManager = this.backToManager.bind(this);

    this.getSwaggerFromLocalStorage = this.getSwaggerFromLocalStorage.bind(this);
    this.saveNewRevision = this.saveNewRevision.bind(this);
  }

  callbackToApisList() { 
    return this.managerURL.concat('#/apis/list');
  };

  callbackToApiOverview() {
    var url = this.managerURL.concat('#/apis/overview/').concat(this.apiId);
    if (this.revisionId) {
      url += '/revisions/'.concat(this.revisionId);
    }
    return url;
  };

  callbackToApiEditingApiStep() {
    return this.callbackToApiOverview().concat('/2');
  };

  callbackToApiEditingResourceStep() {
    return this.callbackToApiOverview().concat('/3');
  };

  backToManager() {
    switch (parseInt(this.callBack)) {
      case 1:
        location.href = this.callbackToApisList();
        break;
      case 2:
        location.href = this.callbackToApiEditingApiStep();
        break;
      case 3:
        location.href = this.callbackToApiEditingResourceStep();
        break;
      case 4:
        location.href = this.callbackToApiOverview();
        break;
    }
  }

  getSwaggerFromLocalStorage() {
    return JSON.stringify(YAML.safeLoad(localStorage.getItem("swagger-editor-content")));
  }
  saveNewRevision() {
    var requestConfig = {
      headers: { 'Auth-Token': this.authToken,
                 'XSRF-TOKEN': localStorage.getItem("XSRF-Token"),
                 'Content-Type': 'application/json' }
    };

    axios.post(this.backendManagerToPerformSaveOrUpdate, this.getSwaggerFromLocalStorage(), requestConfig)
      .then(function(success) {
        this.revisionId = success.data.revisionId;
        this.backToManager();
      }.bind(this))
      .catch(function(error) {
        if(error.response){
          if(error.response.data.errors instanceof Array){
            error.response.data.errors.map((reqErrors) => {
              let BackendMsg = reqErrors.message;
              toast(<MsgError msg={BackendMsg}/>, getErrorToastProps());
            });
          } else {
            let BackendMsg = error.response.data;
            toast(<MsgError msg={BackendMsg}/>, getErrorToastProps());  
          }
        } else {
          let BackendMsg = error.message;
          toast(<MsgError msg={BackendMsg}/>, getErrorToastProps());
        } 
      }.bind(this))
  }

  render(){

    const buttonStyle = {
      marginRight: "5px"
    }

    return(
      <div className="row">
        <div className="col-md-12">
          <div className="col-md-3 col-sm-3"></div>
          <div>
            <ToastContainer/>
          </div>
          <div className="col-md-7 col-sm-7 text-right btn-action">
            <span className="label label-info revision">Revision {this.revisionNumber}</span>
            <button onClick = {this.backToManager} className="btn btn-default" style={buttonStyle}>CANCEL</button>
            <button onClick = {this.saveNewRevision} className="btn btn-info btn-flat-border" style={buttonStyle}>SAVE AS NEW REVISION</button>
          </div>
        </div>
      </div>
    )
  }
}
