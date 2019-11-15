import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL
} from "../actiions/types";

const initalState = {
  token: localStorage.getItem("token"),
  isAuthenicated: null,
  loading: true,
  user: null
};

export default function(state = initalState, action) {
  const { payload, type } = action;
  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenicated: true,
        loading: false,
        user: payload
      };

    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem("token", payload);

      return {
        ...state,
        ...payload,
        isAuthenicated: true,
        loading: false
      };
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenicated: false,
        loading: false
      };

    default:
      return state;
  }
}
