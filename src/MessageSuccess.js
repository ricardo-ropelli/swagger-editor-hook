import React, {Component} from 'react';
import { css } from 'glamor';

const getSuccessToastProps = function(){
   var MsgSuccessProps = { 
        autoClose : 4000,
        hideProgressBar : true,
        className: css({
          borderRadius: 4,
          background: '#39e600',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          color: 'white'
        }) 
      }
      return MsgSuccessProps;
}

export { getSuccessToastProps }

export default class MessageError extends Component {
    constructor(props){
        super(props);
    }
    
    render(){
        return(
        <div className="row">
            <div className="col-md-2">
                <span className="glyphicon glyphicon-ok-sign"></span>
            </div>
            <div className="col-md-10 toast-text-max-width">
                <span>{this.props.msg}</span>
            </div>
        </div>
        )
    }

}