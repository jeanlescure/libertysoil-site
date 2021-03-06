/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import bem from '../utils/bemClassNames';

import {getStore, removeMessage} from '../store';

import messageType from '../consts/messageTypeConstants';

export default class Messages extends React.Component {
  close (i) {
    getStore().dispatch(removeMessage(i));
  }

  render() {
    if (this.props.messages.length == 0) {
      return <script/>;
    }

    let msgTags = this.props.messages.map((msg, i) => {
      var cn = bem.makeClassName({
        block: 'message',
        modifiers: {
          error: () => (msg.type == messageType.ERROR)
        }
      });

      return <div key={i} className={cn}>
        <span onClick={this.close.bind(this, i)} className="message__close action fa fa-times"></span>
        <div className="message__body">
          {msg.message}
        </div>
      </div>;
    })

    return (
      <div className="layout layout__space layout-align_center">
        <div className="message__group">{msgTags}</div>
      </div>
    );
  }
}
