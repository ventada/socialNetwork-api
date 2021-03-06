import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../actiions/alert";
import { register } from "../../actiions/auth";
import PropTypes from "prop-types";

// import axios from "axios";

const Register = ({ setAlert, register }) => {
  const [formData, setformData] = useState({
    name: "",
    emai: "",
    password: "",
    password2: ""
  });

  const { name, email, password, password2 } = formData;

  const onChange = e =>
    setformData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("password do not match", "danger");
    } else {
      register({ name, email, password });
    }
  };

  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => onChange(e)}
            name="name"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={e => onChange(e)}
            placeholder="Email Address"
            name="email"
            required
          />
          <small className="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={e => onChange(e)}
            placeholder="Password"
            name="password"
            minLength="6"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password2}
            onChange={e => onChange(e)}
            placeholder="Confirm Password"
            name="password2"
            required
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired
};

export default connect(null, { setAlert, register })(Register);
