import { applyMiddleware, createStore } from "redux";

import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./reducers/index";

const initialsState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialsState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
