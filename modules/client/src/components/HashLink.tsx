import React from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";

let hashFragment = "";
let observer = null as any;
let asyncTimerId = null as any;
let scrollFunction = null as any;

function reset() {
  hashFragment = "";
  if (observer !== null) {
    observer.disconnect();
  }
  if (asyncTimerId !== null) {
    window.clearTimeout(asyncTimerId);
    asyncTimerId = null;
  }
}

function getElAndScroll() {
  const element = document.getElementById(hashFragment);
  if (element !== null) {
    scrollFunction(element);
    reset();
    return true;
  }
  return false;
}

function hashLinkScroll() {
  // Push onto callback queue so it runs after the DOM is updated
  window.setTimeout(() => {
    if (getElAndScroll() === false) {
      if (observer === null) {
        observer = new MutationObserver(getElAndScroll);
      }
      observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      // if the element doesn't show up in 10 seconds, stop checking
      asyncTimerId = window.setTimeout(() => {
        reset();
      }, 10000);
    }
  }, 0);
}

const genericHashLink = (props: any, As) => {
  const { scroll, smooth, ...filteredProps } = props;
  function handleClick(e) {
    reset();
    if (props.onClick) props.onClick(e);
    if (typeof props.to === "string") {
      hashFragment = props.to
        .split("#")
        .slice(1)
        .join("#");
    } else if (
      typeof props.to === "object" &&
      typeof props.to.hash === "string"
    ) {
      hashFragment = props.to.hash.replace("#", "");
    }
    if (hashFragment !== "") {
      scrollFunction =
        scroll ||
        (el =>
          smooth
            ? el.scrollIntoView({ behavior: "smooth" })
            : el.scrollIntoView());
      hashLinkScroll();
    }
  }
  return (
    <As {...filteredProps} onClick={handleClick}>
      {props.children}
    </As>
  );
};

export class HashLink extends React.Component {
  render () {
    return genericHashLink(this.props, Link);
  }
}

export function NavHashLink(props) {
  return genericHashLink(props, NavLink);
}

const propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  scroll: PropTypes.func,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

//HashLink.propTypes = propTypes;
NavHashLink.propTypes = propTypes;
