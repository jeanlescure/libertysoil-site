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
import { connect } from 'react-redux';
import { Link, IndexLink } from 'react-router';

import ApiClient from '../api/client'
import {API_HOST} from '../config';
import {getStore, setUserTags, addError} from '../store';
import SidebarLink from './sidebar-link';
import CurrentUser from './current-user';
import TagCloud from './tag-cloud';
import { defaultSelector } from '../selectors';

let SidebarTagCloud = ({tags}) => {
  if (tags.length == 0) {
    return <script/>;
  }

  return (
    <div className="layout__row">
      <h4>Tags</h4>
      <TagCloud tags={tags}/>
    </div>
  );
};

SidebarTagCloud.displayName = "SidebarTagCloud";

export default SidebarTagCloud;

export default class Sidebar extends React.Component {
  static displayName = 'Sidebar'

  componentDidMount() {
    Sidebar.fetchData(this.props, new ApiClient(API_HOST));
  }

  static async fetchData(props, client) {
    try {
      let userTags = client.userTags();

      getStore().dispatch(setUserTags(await userTags));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    if (!this.props.current_user || !this.props.current_user_tags) {
      return <script/>
    }

    let {
      current_user
    } = this.props;

    let likes_enabled = (current_user.likes && current_user.likes.length > 0);
    let favorites_enabled = (current_user.favourites && current_user.favourites.length > 0);

    return (
      <div className="page__sidebar">
        <div className="layout__row page__sidebar_user">
          <CurrentUser user={current_user} />
        </div>

        <div className="layout__row">
          <SidebarLink className="link" enabled={true} to={`/user/${current_user.username}`}><i className="icon fa fa-feed"></i> News Feed</SidebarLink>
        </div>
        <div className="layout__row">
          <SidebarLink className="link" enabled={likes_enabled} to={`/user/${current_user.username}/likes`}><i className="icon fa fa-heart"></i> My Likes</SidebarLink>
        </div>
        <div className="layout__row">
          <SidebarLink className="link" enabled={favorites_enabled} to={`/user/${current_user.username}/favorites`}><i className="icon fa fa-star"></i> My Favorites</SidebarLink>
        </div>

        <SidebarTagCloud tags={this.props.current_user_tags}/>
      </div>
    )
  }
}

export default connect(defaultSelector)(Sidebar);
