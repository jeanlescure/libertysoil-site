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
import express from 'express';
import bodyParser from 'body-parser';
//import multer from 'multer';
import _ from 'lodash';
import session from 'express-session';
import initRedisStore from 'connect-redis';

import React from 'react';
import { renderToString } from 'react-dom/server'
import createMemoryHistory from 'history/lib/createMemoryHistory'
import { Router, RoutingContext, match } from 'react-router'

import Routes from './src/routing';
import {initApi} from './src/api/routing'
import initBookshelf from './src/api/db';
import {API_HOST} from './src/config';
import ApiClient from './src/api/client'

import {initState, setCurrentUser, setLikes, setFavourites} from './src/store';

import db_config from './knexfile';


let wrap = fn => (...args) => fn(...args).catch(args[2]);

let RedisStore = initRedisStore(session);

let sessionMiddleware = session({
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  secret: 'libertysoil',
  resave: false,
  saveUninitialized: false
});

let corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
};


let exec_env = process.env.DB_ENV || 'development';
const knexConfig = db_config[exec_env];
let bookshelf = initBookshelf(knexConfig);
let api = initApi(bookshelf)

let reactHandler = async (req, res) => {
  let store = initState();

  if (req.session && req.session.user && _.isString(req.session.user)) {
    try {
      let user = await bookshelf
        .model('User')
        .where({id: req.session.user})
        .fetch({require: true, withRelated: ['following']});

      let data = user.toJSON();

      let likes = await bookshelf.knex
        .select('post_id')
        .from('likes')
        .where({user_id: req.session.user});

      let favourites = await bookshelf.knex
        .select('post_id')
        .from('favourites')
        .where({user_id: req.session.user});

      store.dispatch(setCurrentUser(data));
      store.dispatch(setLikes(data.id, likes.map(like => like.post_id)));
      store.dispatch(setFavourites(data.id, favourites.map(fav => fav.post_id)));
    } catch (e) {
      console.log(`dispatch failed: ${e.stack}`);
    }
  }

  const makeRoutes = (history) => (
    <Router history={history}>
      {Routes}
    </Router>
  )

  let history = createMemoryHistory();
  let location = history.createLocation(req.url);
  let routes = makeRoutes(history);

  match({ routes, location }, async (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(301, redirectLocation.pathname + redirectLocation.search)
    } else if (error) {
      res.status(500).send(error.message)
    } else if (renderProps == null) {
      res.status(404).send('Not found')
    } else {
      let component = _.last(renderProps.routes).component;

      if ('fetchData' in component) {
        let props = store.getState().toJS();
        props.params = renderProps.params;

        let client = new ApiClient(API_HOST, req);
        await component.fetchData(props, client);
      }

      let html = renderToString(<RoutingContext {...renderProps}/>)
      let state = JSON.stringify(store.getState().toJS());

      res.render('index', { state, html });
    }
  });
};


let app = express();

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json());  // for parsing application/json
//app.use(multer());  // for parsing multipart/form-data
app.use(corsMiddleware);

app.use('/api/v1', api);
app.use(express.static('public', { index: false}));
app.use(wrap(reactHandler));

app.listen(8000);
