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
import {Route, IndexRoute} from 'react-router';
import React from 'react';

import App from './pages/app';
import Auth from './pages/auth';
import MaybeList from './pages/maybe_list';
import PostPage from './pages/post';
import PostEditPage from './pages/post_edit';
import UserPage from './pages/user';
import UserLikesPage from './pages/user-likes';
import UserFavoritesPage from './pages/user-favorites';
import AboutUserPage from './pages/user-bio';
import SettingsPage from './pages/settings';
import SettingsPasswordPage from './pages/settings-password';
import SettingsFollowersPage from './pages/settings-followers';
import TagPage from './pages/tag';

// <Redirect from="/user/:username" to="/user/:username/posts" />

let routes = (
  <Route component={App}>
    <Route component={MaybeList} path="/" />
    <Route component={Auth} path="/auth" />
    <Route component={PostPage} path="/post/:uuid" />
    <Route component={PostEditPage} path="/post/edit/:uuid" />
    <Route component={TagPage} path="/tag/:tag" />
    <Route path="/settings">
      <IndexRoute component={SettingsPage} />
      <Route component={SettingsPasswordPage} path="password" />
      <Route component={SettingsFollowersPage} path="followers" />
    </Route>
    <Route path="/user/:username">
      <IndexRoute component={UserPage} />
      <Route component={UserLikesPage} path="/user/:username/likes" />
      <Route component={UserFavoritesPage} path="/user/:username/favorites" />
      <Route component={AboutUserPage} path="/user/:username/bio" />
    </Route>
  </Route>
)

export default routes;
